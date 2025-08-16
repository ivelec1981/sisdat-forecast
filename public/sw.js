const CACHE_NAME = 'sisdat-forecast-v1';
const STATIC_CACHE = 'sisdat-static-v1';
const DYNAMIC_CACHE = 'sisdat-dynamic-v1';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/login',
  '/dashboard',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/_next/static/css/app/layout.css',
  '/_next/static/chunks/main.js',
  '/_next/static/chunks/webpack.js'
];

// API routes to cache with network-first strategy
const API_ROUTES = [
  '/api/auth',
  '/api/energy-data',
  '/api/projections',
  '/api/companies',
  '/api/transmission-stations'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_FILES.map(url => new Request(url, {
          cache: 'reload'
        })));
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => 
              cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== CACHE_NAME
            )
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle different types of requests with appropriate strategies
  if (url.pathname.startsWith('/api/')) {
    // API routes - Network first with cache fallback
    event.respondWith(handleApiRequest(request));
  } else if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff2?)$/)) {
    // Static assets - Cache first
    event.respondWith(handleStaticAssets(request));
  } else {
    // Pages - Stale while revalidate
    event.respondWith(handlePageRequest(request));
  }
});

// Network-first strategy for API requests
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // If successful, update cache and return response
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for API request, trying cache:', request.url);
    
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Both network and cache failed, return offline response
    return new Response(
      JSON.stringify({ 
        error: 'Sin conexión', 
        message: 'No hay conexión a internet y no hay datos en caché',
        offline: true 
      }),
      { 
        status: 503, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Cache-first strategy for static assets
async function handleStaticAssets(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Optionally update cache in background
    updateCacheInBackground(request);
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Failed to fetch static asset:', request.url);
    
    // Return a fallback for images
    if (request.destination === 'image') {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f3f4f6"/><text x="100" y="100" text-anchor="middle" dy="0.3em" font-family="system-ui" font-size="14" fill="#6b7280">Sin conexión</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    
    throw error;
  }
}

// Stale-while-revalidate strategy for pages
async function handlePageRequest(request) {
  const cachedResponse = await caches.match(request);
  
  // Always try to fetch from network
  const networkResponsePromise = fetch(request).then((response) => {
    // Update cache with new response
    if (response.ok) {
      const cache = caches.open(DYNAMIC_CACHE);
      cache.then(c => c.put(request, response.clone()));
    }
    return response;
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Wait for network response if no cache
    return await networkResponsePromise;
  } catch (error) {
    console.log('[SW] Network failed for page request:', request.url);
    
    // Return offline page
    const offlineResponse = await caches.match('/offline');
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Fallback offline response
    return new Response(
      `<!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Sin conexión - SISDAT-forecast</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex; 
              align-items: center; 
              justify-content: center; 
              min-height: 100vh; 
              margin: 0; 
              background: #f9fafb;
              color: #374151;
            }
            .container { 
              text-align: center; 
              padding: 2rem;
              background: white;
              border-radius: 12px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              max-width: 400px;
            }
            .icon { 
              width: 64px; 
              height: 64px; 
              margin: 0 auto 1rem; 
              background: #fee2e2; 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center;
              font-size: 24px;
            }
            h1 { 
              margin: 0 0 0.5rem; 
              font-size: 1.5rem; 
              font-weight: 600;
            }
            p { 
              margin: 0 0 1.5rem; 
              color: #6b7280;
            }
            button {
              background: #FF9500;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 8px;
              font-weight: 500;
              cursor: pointer;
              font-size: 1rem;
            }
            button:hover {
              background: #e6850e;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">⚡</div>
            <h1>Sin conexión</h1>
            <p>No hay conexión a internet. Verifique su conexión e intente nuevamente.</p>
            <button onclick="window.location.reload()">Reintentar</button>
          </div>
        </body>
      </html>`,
      { 
        headers: { 'Content-Type': 'text/html' },
        status: 503
      }
    );
  }
}

// Update cache in background
async function updateCacheInBackground(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response);
    }
  } catch (error) {
    // Silently fail background updates
    console.log('[SW] Background cache update failed for:', request.url);
  }
}

// Handle push notifications (if needed later)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Nueva notificación de SISDAT-forecast',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: data.tag || 'sisdat-notification',
      data: data.data || {},
      actions: [
        {
          action: 'view',
          title: 'Ver',
          icon: '/icons/view-icon.png'
        },
        {
          action: 'dismiss',
          title: 'Descartar'
        }
      ],
      vibrate: [200, 100, 200],
      requireInteraction: true
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'SISDAT-forecast', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('[SW] Background sync triggered');
    
    event.waitUntil(
      // Implement background sync logic here
      // For example, sync offline form submissions
      syncOfflineData()
    );
  }
});

async function syncOfflineData() {
  // Placeholder for background sync implementation
  console.log('[SW] Syncing offline data...');
  
  try {
    // Get offline data from IndexedDB or localStorage
    // Sync with server when connection is restored
    
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
    throw error;
  }
}