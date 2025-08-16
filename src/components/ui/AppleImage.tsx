'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConnectionOptimizer } from '@/lib/performance/connectionOptimizer';
import { cn } from '@/lib/cn';

interface AppleImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: 'low' | 'medium' | 'high';
  lazy?: boolean;
  placeholder?: 'blur' | 'skeleton' | 'none';
  blurDataURL?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  sizes?: string;
  quality?: number;
  fill?: boolean;
  style?: React.CSSProperties;
}

export function AppleImage({
  src,
  alt,
  width,
  height,
  className,
  priority = 'medium',
  lazy = true,
  placeholder = 'skeleton',
  blurDataURL,
  fallbackSrc,
  onLoad,
  onError,
  sizes,
  quality,
  fill = false,
  style,
  ...props
}: AppleImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  const { config, optimizeImageUrl, shouldLoadComponent, prefersReducedMotion } = useConnectionOptimizer();

  const shouldLoad = shouldLoadComponent(priority);
  const reduceMotion = prefersReducedMotion();

  useEffect(() => {
    if (!shouldLoad) return;

    const optimizedSrc = config.enableImageOptimization
      ? optimizeImageUrl(src, quality || config.maxImageQuality)
      : src;

    setCurrentSrc(optimizedSrc);
  }, [src, quality, config, optimizeImageUrl, shouldLoad]);

  useEffect(() => {
    if (!lazy || !imgRef.current || !currentSrc) return;

    const img = imgRef.current;
    
    if (!config.enableLazyLoading || priority === 'high') {
      // Load immediately for high priority or when lazy loading is disabled
      loadImage();
      return;
    }

    // Set up intersection observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage();
            observer.unobserve(img);
          }
        });
      },
      { 
        rootMargin: config.enableDataCompression ? '20px' : '50px' 
      }
    );

    observer.observe(img);

    return () => {
      observer.unobserve(img);
    };
  }, [currentSrc, lazy, config, priority]);

  const loadImage = () => {
    if (!currentSrc) return;

    const img = new Image();
    
    img.onload = () => {
      setIsLoaded(true);
      setIsError(false);
      onLoad?.();
    };

    img.onerror = () => {
      setIsError(true);
      
      if (fallbackSrc && currentSrc !== fallbackSrc) {
        setCurrentSrc(fallbackSrc);
        return;
      }
      
      onError?.(new Error(`Failed to load image: ${currentSrc}`));
    };

    if (sizes) {
      img.sizes = sizes;
    }

    img.src = currentSrc;
  };

  const getPlaceholderContent = () => {
    if (placeholder === 'none') return null;

    if (placeholder === 'blur' && blurDataURL) {
      return (
        <img
          src={blurDataURL}
          alt=""
          className={cn(
            "absolute inset-0 w-full h-full object-cover",
            "scale-110 blur-2xl opacity-60"
          )}
          aria-hidden="true"
        />
      );
    }

    // Skeleton placeholder
    return (
      <div className={cn(
        "absolute inset-0 bg-apple-gray-100",
        "animate-pulse rounded-apple"
      )}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </div>
    );
  };

  const getErrorContent = () => (
    <div className={cn(
      "absolute inset-0 bg-apple-gray-100 rounded-apple",
      "flex items-center justify-center"
    )}>
      <div className="text-center text-apple-text-tertiary">
        <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-apple-xs font-apple-regular">
          Imagen no disponible
        </p>
      </div>
    </div>
  );

  if (!shouldLoad && priority === 'low') {
    return (
      <div 
        className={cn(
          "bg-apple-gray-100 rounded-apple",
          fill ? "absolute inset-0" : "w-full h-32",
          className
        )}
        style={style}
      />
    );
  }

  const containerClasses = cn(
    "relative overflow-hidden rounded-apple",
    fill ? "absolute inset-0" : "",
    className
  );

  const imgClasses = cn(
    "apple-transition-transform duration-300",
    isLoaded ? "opacity-100" : "opacity-0",
    fill ? "absolute inset-0 w-full h-full object-cover" : ""
  );

  return (
    <motion.div
      className={containerClasses}
      style={fill ? style : { width, height, ...style }}
      initial={reduceMotion ? {} : { opacity: 0, scale: 0.95 }}
      animate={reduceMotion ? {} : { opacity: 1, scale: 1 }}
      transition={reduceMotion ? {} : { 
        duration: 0.3, 
        ease: [0.4, 0, 0.2, 1] 
      }}
    >
      {/* Main Image */}
      <motion.img
        ref={imgRef}
        src={isLoaded ? currentSrc : undefined}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={imgClasses}
        data-adaptive="true"
        data-critical={priority === 'high' ? 'true' : undefined}
        loading={lazy ? 'lazy' : 'eager'}
        decoding="async"
        initial={reduceMotion ? {} : { opacity: 0 }}
        animate={reduceMotion ? {} : { opacity: isLoaded ? 1 : 0 }}
        transition={reduceMotion ? {} : { 
          duration: 0.3, 
          ease: [0.4, 0, 0.2, 1] 
        }}
        {...props}
      />

      {/* Placeholder/Loading State */}
      <AnimatePresence>
        {!isLoaded && !isError && (
          <motion.div
            className="absolute inset-0"
            initial={reduceMotion ? {} : { opacity: 1 }}
            exit={reduceMotion ? {} : { 
              opacity: 0,
              transition: { duration: 0.2 }
            }}
          >
            {getPlaceholderContent()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {isError && (
          <motion.div
            className="absolute inset-0"
            initial={reduceMotion ? {} : { opacity: 0 }}
            animate={reduceMotion ? {} : { opacity: 1 }}
            transition={reduceMotion ? {} : { duration: 0.2 }}
          >
            {getErrorContent()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Indicator for Slow Connections */}
      {config.enableDataCompression && !isLoaded && !isError && (
        <motion.div
          className="absolute top-2 right-2 w-4 h-4 bg-apple-blue rounded-full"
          animate={reduceMotion ? {} : { 
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={reduceMotion ? {} : { 
            duration: 1.5, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.div>
  );
}

// Optimized image gallery component
interface AppleImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  className?: string;
  columns?: number;
  gap?: number;
}

export function AppleImageGallery({
  images,
  className,
  columns = 3,
  gap = 16,
}: AppleImageGalleryProps) {
  const { config } = useConnectionOptimizer();
  const [visibleCount, setVisibleCount] = useState(
    config.enableDataCompression ? 6 : 12
  );

  const loadMore = () => {
    setVisibleCount(prev => prev + (config.enableDataCompression ? 6 : 12));
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div 
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${gap}px`
        }}
      >
        {images.slice(0, visibleCount).map((image, index) => (
          <motion.div
            key={`${image.src}-${index}`}
            className="relative group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: index * 0.1,
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1]
            }}
          >
            <AppleImage
              src={image.src}
              alt={image.alt}
              className="w-full aspect-square"
              priority={index < 3 ? 'high' : 'medium'}
              placeholder="skeleton"
              fill
            />
            
            {image.caption && (
              <motion.div
                className={cn(
                  "absolute bottom-0 left-0 right-0",
                  "bg-gradient-to-t from-black/60 to-transparent",
                  "p-3 text-white text-apple-sm font-apple-medium",
                  "opacity-0 group-hover:opacity-100",
                  "apple-transition"
                )}
                initial={{ y: 10, opacity: 0 }}
                whileHover={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {image.caption}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {visibleCount < images.length && (
        <div className="text-center">
          <motion.button
            onClick={loadMore}
            className={cn(
              "px-6 py-3 bg-apple-gray-100 hover:bg-apple-gray-200",
              "text-apple-text-primary font-apple-medium rounded-apple",
              "apple-transition apple-touch-button"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cargar más ({images.length - visibleCount} restantes)
          </motion.button>
        </div>
      )}
    </div>
  );
}