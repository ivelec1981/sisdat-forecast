'use client';

interface ConnectionInfo {
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g';
  downlink: number;
  rtt: number;
  saveData: boolean;
}

interface OptimizationConfig {
  enableImageOptimization: boolean;
  enableLazyLoading: boolean;
  enablePreloading: boolean;
  enableReducedAnimations: boolean;
  enableDataCompression: boolean;
  maxImageQuality: number;
  maxConcurrentRequests: number;
}

class ConnectionOptimizer {
  private connection: ConnectionInfo | null = null;
  private observers: Map<string, IntersectionObserver> = new Map();
  private preloadQueue: string[] = [];
  private requestQueue: Promise<any>[] = [];

  constructor() {
    this.initializeConnection();
  }

  private initializeConnection() {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      this.connection = {
        effectiveType: connection.effectiveType || '4g',
        downlink: connection.downlink || 10,
        rtt: connection.rtt || 100,
        saveData: connection.saveData || false,
      };

      // Listen for connection changes
      connection.addEventListener('change', () => {
        this.connection = {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
        };
        this.optimizeForConnection();
      });
    }
  }

  getOptimizationConfig(): OptimizationConfig {
    if (!this.connection) {
      return this.getDefaultConfig();
    }

    const { effectiveType, downlink, saveData } = this.connection;
    
    // Slow connection or data saver mode
    if (effectiveType === 'slow-2g' || effectiveType === '2g' || saveData) {
      return {
        enableImageOptimization: true,
        enableLazyLoading: true,
        enablePreloading: false,
        enableReducedAnimations: true,
        enableDataCompression: true,
        maxImageQuality: 40,
        maxConcurrentRequests: 2,
      };
    }

    // Moderate connection
    if (effectiveType === '3g' || downlink < 1.5) {
      return {
        enableImageOptimization: true,
        enableLazyLoading: true,
        enablePreloading: true,
        enableReducedAnimations: false,
        enableDataCompression: true,
        maxImageQuality: 60,
        maxConcurrentRequests: 4,
      };
    }

    // Fast connection
    return {
      enableImageOptimization: false,
      enableLazyLoading: true,
      enablePreloading: true,
      enableReducedAnimations: false,
      enableDataCompression: false,
      maxImageQuality: 85,
      maxConcurrentRequests: 8,
    };
  }

  private getDefaultConfig(): OptimizationConfig {
    return {
      enableImageOptimization: true,
      enableLazyLoading: true,
      enablePreloading: true,
      enableReducedAnimations: false,
      enableDataCompression: false,
      maxImageQuality: 75,
      maxConcurrentRequests: 6,
    };
  }

  private optimizeForConnection() {
    const config = this.getOptimizationConfig();
    
    // Apply CSS optimizations
    this.applyAnimationOptimizations(config.enableReducedAnimations);
    
    // Update image loading strategy
    this.updateImageLoadingStrategy(config);
    
    // Emit custom event for components to react
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('connectionOptimized', { 
        detail: config 
      }));
    }
  }

  private applyAnimationOptimizations(reduceAnimations: boolean) {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    
    if (reduceAnimations) {
      root.style.setProperty('--apple-transition-duration', '0.1s');
      root.style.setProperty('--apple-animation-duration', '0.2s');
      root.classList.add('reduce-motion');
    } else {
      root.style.removeProperty('--apple-transition-duration');
      root.style.removeProperty('--apple-animation-duration');
      root.classList.remove('reduce-motion');
    }
  }

  private updateImageLoadingStrategy(config: OptimizationConfig) {
    if (typeof document === 'undefined') return;

    const images = document.querySelectorAll('img[data-adaptive]');
    images.forEach((img: Element) => {
      const imgElement = img as HTMLImageElement;
      const originalSrc = imgElement.dataset.src || imgElement.src;
      
      if (config.enableImageOptimization) {
        imgElement.src = this.optimizeImageUrl(originalSrc, config.maxImageQuality);
      } else {
        imgElement.src = originalSrc;
      }
    });
  }

  optimizeImageUrl(url: string, quality: number = 75): string {
    if (!url) return url;

    // Add quality parameter for Next.js Image optimization
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}q=${quality}&format=webp`;
  }

  createLazyLoader(
    selector: string = 'img[data-lazy]',
    rootMargin: string = '50px'
  ): IntersectionObserver | null {
    if (typeof IntersectionObserver === 'undefined') return null;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.lazy;
            
            if (src) {
              const config = this.getOptimizationConfig();
              img.src = config.enableImageOptimization 
                ? this.optimizeImageUrl(src, config.maxImageQuality)
                : src;
              
              img.removeAttribute('data-lazy');
              observer.unobserve(img);
            }
          }
        });
      },
      { rootMargin }
    );

    // Observe existing elements
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => observer.observe(el));

    this.observers.set(selector, observer);
    return observer;
  }

  async preloadCriticalResources(urls: string[]) {
    const config = this.getOptimizationConfig();
    
    if (!config.enablePreloading || config.enableDataCompression) {
      return;
    }

    const preloadPromises = urls.slice(0, config.maxConcurrentRequests).map(url => {
      return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = url;
        
        // Determine resource type
        if (url.match(/\.(jpg|jpeg|png|webp|avif)$/i)) {
          link.as = 'image';
        } else if (url.match(/\.(woff2|woff|ttf)$/i)) {
          link.as = 'font';
          link.crossOrigin = 'anonymous';
        } else if (url.match(/\.(js|mjs)$/i)) {
          link.as = 'script';
        } else if (url.match(/\.css$/i)) {
          link.as = 'style';
        }

        link.onload = () => resolve(url);
        link.onerror = () => reject(new Error(`Failed to preload ${url}`));
        
        document.head.appendChild(link);
      });
    });

    try {
      await Promise.allSettled(preloadPromises);
    } catch (error) {
      console.warn('Some resources failed to preload:', error);
    }
  }

  async throttledFetch(
    url: string, 
    options: RequestInit = {}
  ): Promise<Response> {
    const config = this.getOptimizationConfig();
    
    // Wait if we have too many concurrent requests
    while (this.requestQueue.length >= config.maxConcurrentRequests) {
      await Promise.race(this.requestQueue);
    }

    const requestPromise = fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        ...(config.enableDataCompression && {
          'Accept-Encoding': 'gzip, deflate, br',
        }),
      },
    });

    this.requestQueue.push(requestPromise);
    
    try {
      const response = await requestPromise;
      return response;
    } finally {
      // Remove completed request from queue
      const index = this.requestQueue.indexOf(requestPromise);
      if (index > -1) {
        this.requestQueue.splice(index, 1);
      }
    }
  }

  // Adaptive component loading based on connection
  shouldLoadComponent(priority: 'low' | 'medium' | 'high' = 'medium'): boolean {
    const config = this.getOptimizationConfig();
    
    if (priority === 'high') return true;
    
    if (config.enableDataCompression && priority === 'low') {
      return false;
    }
    
    if (config.maxConcurrentRequests <= 2 && priority === 'medium') {
      return Math.random() > 0.5; // Load 50% of medium priority components
    }
    
    return true;
  }

  // Memory optimization for low-end devices
  optimizeMemoryUsage() {
    if (typeof performance === 'undefined') return;

    const memory = (performance as any).memory;
    if (!memory) return;

    const memoryRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    
    if (memoryRatio > 0.8) {
      // High memory usage - cleanup
      this.clearImageCache();
      this.removeUnusedObservers();
      
      // Force garbage collection if available
      if ((window as any).gc) {
        (window as any).gc();
      }
    }
  }

  private clearImageCache() {
    const images = document.querySelectorAll('img:not([data-critical])');
    images.forEach((img: Element) => {
      const imgElement = img as HTMLImageElement;
      if (!this.isInViewport(imgElement)) {
        imgElement.src = '';
        imgElement.dataset.lazy = imgElement.src;
      }
    });
  }

  private removeUnusedObservers() {
    this.observers.forEach((observer, selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        observer.disconnect();
        this.observers.delete(selector);
      }
    });
  }

  private isInViewport(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  // Cleanup method
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.requestQueue = [];
  }

  // Get connection info for debugging
  getConnectionInfo() {
    return this.connection;
  }

  // Check if user prefers reduced motion
  prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}

// Singleton instance
export const connectionOptimizer = new ConnectionOptimizer();

// Hook for React components
export function useConnectionOptimizer() {
  const config = connectionOptimizer.getOptimizationConfig();
  const connectionInfo = connectionOptimizer.getConnectionInfo();
  
  return {
    config,
    connectionInfo,
    optimizeImageUrl: connectionOptimizer.optimizeImageUrl.bind(connectionOptimizer),
    createLazyLoader: connectionOptimizer.createLazyLoader.bind(connectionOptimizer),
    preloadCriticalResources: connectionOptimizer.preloadCriticalResources.bind(connectionOptimizer),
    throttledFetch: connectionOptimizer.throttledFetch.bind(connectionOptimizer),
    shouldLoadComponent: connectionOptimizer.shouldLoadComponent.bind(connectionOptimizer),
    prefersReducedMotion: connectionOptimizer.prefersReducedMotion.bind(connectionOptimizer),
  };
}