import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { WebVitals } from './web-vitals'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SISDAT-forecast',
  description: 'Sistema de Proyección de Demanda Eléctrica del Ecuador',
  keywords: ['energia', 'prediccion', 'machine learning', 'arconel', 'regulacion', 'ecuador', 'demanda electrica'],
  authors: [{ name: 'ARCONEL - Agencia de Regulación y Control de Electricidad' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SISDAT-forecast',
  },
  openGraph: {
    title: 'SISDAT-forecast',
    description: 'Sistema de Proyección de Demanda Eléctrica del Ecuador',
    type: 'website',
    siteName: 'SISDAT-forecast',
    locale: 'es_EC',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SISDAT-forecast',
    description: 'Sistema de Proyección de Demanda Eléctrica del Ecuador',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'SISDAT-forecast',
    'application-name': 'SISDAT-forecast',
    'msapplication-TileColor': '#FF9500',
    'msapplication-config': '/browserconfig.xml',
  },
}

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
    themeColor: '#2E7CD6',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preload" href="/logosisdat1.png" as="image" type="image/png" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logosisdat1.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/logosisdat1.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/logosisdat1.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileColor" content="#2E7CD6" />
        <meta name="theme-color" content="#2E7CD6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SISDAT-forecast" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Only enable Service Worker in production
              if ('serviceWorker' in navigator && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', {
                    scope: '/',
                    updateViaCache: 'none' // Force SW update check on every page load
                  })
                    .then(function(registration) {
                      console.log('[SW] Registered successfully:', registration.scope);

                      // Check for updates every 60 seconds
                      setInterval(function() {
                        registration.update();
                      }, 60000);

                      // Handle SW updates
                      registration.addEventListener('updatefound', function() {
                        const newWorker = registration.installing;
                        console.log('[SW] Update found, installing new version...');

                        newWorker.addEventListener('statechange', function() {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('[SW] New version installed, refresh to activate');
                            // Optionally show notification to user
                          }
                        });
                      });
                    })
                    .catch(function(registrationError) {
                      console.error('[SW] Registration failed:', registrationError);
                    });

                  // Handle controller change (new SW activated)
                  navigator.serviceWorker.addEventListener('controllerchange', function() {
                    console.log('[SW] Controller changed, reloading page...');
                    window.location.reload();
                  });
                });
              } else if ('serviceWorker' in navigator) {
                // In development, unregister any existing service workers
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    registration.unregister();
                    console.log('[SW] Unregistered service worker in development mode');
                  }
                });
              }
            `,
          }}
        />
      </head>
      <body className="font-sans">
        <WebVitals />
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}