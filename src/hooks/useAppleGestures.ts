'use client';

import { useSpring, useTransform, useMotionValue } from 'framer-motion';
import { useDrag, useWheel, usePinch } from '@use-gesture/react';
import { useCallback, useRef } from 'react';

interface UseAppleGesturesOptions {
  enablePullToRefresh?: boolean;
  enableSwipeNavigation?: boolean;
  enablePinchZoom?: boolean;
  enableHapticFeedback?: boolean;
  onRefresh?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onPinchZoom?: (scale: number) => void;
}

export function useAppleGestures({
  enablePullToRefresh = false,
  enableSwipeNavigation = false,
  enablePinchZoom = false,
  enableHapticFeedback = true,
  onRefresh,
  onSwipeLeft,
  onSwipeRight,
  onPinchZoom,
}: UseAppleGesturesOptions = {}) {
  const y = useMotionValue(0);
  const x = useMotionValue(0);
  const scale = useMotionValue(1);
  const lastGestureTime = useRef(0);

  // Haptic feedback function
  const triggerHapticFeedback = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!enableHapticFeedback || typeof navigator === 'undefined') return;
    
    try {
      // Check if the device supports vibration
      if ('vibrate' in navigator) {
        const patterns = {
          light: [10],
          medium: [20],
          heavy: [30, 10, 30]
        };
        navigator.vibrate(patterns[intensity]);
      }
      
      // Check for iOS haptic feedback
      if ('Taptic' in window) {
        const taptic = (window as any).Taptic;
        switch (intensity) {
          case 'light':
            taptic.Impact.Light();
            break;
          case 'medium':
            taptic.Impact.Medium();
            break;
          case 'heavy':
            taptic.Impact.Heavy();
            break;
        }
      }
    } catch (error) {
      console.log('Haptic feedback not supported:', error);
    }
  }, [enableHapticFeedback]);

  // Debounce function for gestures
  const debounceGesture = useCallback((callback: () => void, delay = 300) => {
    const now = Date.now();
    if (now - lastGestureTime.current > delay) {
      lastGestureTime.current = now;
      callback();
    }
  }, []);

  // Pull to refresh spring animation
  const pullToRefreshSpring = useSpring({
    y: y.get(),
    config: { tension: 300, friction: 30 }
  });

  // Swipe navigation spring animation  
  const swipeSpring = useSpring({
    x: x.get(),
    config: { tension: 300, friction: 30 }
  });

  // Pinch zoom spring animation
  const pinchSpring = useSpring({
    scale: scale.get(),
    config: { tension: 300, friction: 30 }
  });

  // Pull to refresh drag handler
  const pullToRefreshBind = useDrag(
    ({ down, movement: [, my], velocity: [, vy], direction: [, dy] }) => {
      if (!enablePullToRefresh) return;

      const threshold = 80;
      const isRefreshTriggered = my > threshold && dy > 0;

      // Apply resistance as user pulls down
      const resistance = Math.max(0, 1 - my / 200);
      const dampedMovement = my * resistance;

      if (down) {
        y.set(Math.max(0, dampedMovement));
        
        // Trigger haptic feedback at threshold
        if (isRefreshTriggered && my > threshold + 10) {
          triggerHapticFeedback('medium');
        }
      } else {
        if (isRefreshTriggered && vy > 0.5) {
          // Trigger refresh with haptic feedback
          triggerHapticFeedback('heavy');
          debounceGesture(() => {
            onRefresh?.();
          });
        }
        
        // Snap back to 0
        y.set(0);
      }
    },
    {
      axis: 'y',
      bounds: { top: 0, bottom: 120 },
      rubberband: true,
      filterTaps: true,
      threshold: 10,
    }
  );

  // Swipe navigation handler
  const swipeNavigationBind = useDrag(
    ({ down, movement: [mx], velocity: [vx], direction: [dx], tap }) => {
      if (!enableSwipeNavigation || tap) return;

      const threshold = 100;
      const velocityThreshold = 0.5;

      if (down) {
        // Apply resistance for visual feedback
        const resistance = Math.max(0, 1 - Math.abs(mx) / 300);
        const dampedMovement = mx * resistance;
        x.set(dampedMovement);
      } else {
        const isSwipeLeft = mx < -threshold && dx < 0 && vx < -velocityThreshold;
        const isSwipeRight = mx > threshold && dx > 0 && vx > velocityThreshold;

        if (isSwipeLeft) {
          triggerHapticFeedback('light');
          debounceGesture(() => {
            onSwipeLeft?.();
          });
        } else if (isSwipeRight) {
          triggerHapticFeedback('light');
          debounceGesture(() => {
            onSwipeRight?.();
          });
        }

        // Snap back to 0
        x.set(0);
      }
    },
    {
      axis: 'x',
      bounds: { left: -150, right: 150 },
      rubberband: true,
      filterTaps: true,
      threshold: 10,
    }
  );

  // Pinch zoom handler
  const pinchZoomBind = usePinch(
    ({ offset: [s], memo = scale.get() }) => {
      if (!enablePinchZoom) return memo;

      const newScale = Math.max(0.5, Math.min(3, memo * s));
      scale.set(newScale);
      
      // Trigger haptic feedback on significant scale changes
      if (Math.abs(newScale - 1) > 0.2) {
        triggerHapticFeedback('light');
      }
      
      onPinchZoom?.(newScale);
      return memo;
    },
    {
      scaleBounds: { min: 0.5, max: 3 },
      rubberband: true,
    }
  );

  // Wheel zoom handler for desktop
  const wheelZoomBind = useWheel(
    ({ delta: [, dy], ctrlKey }) => {
      if (!enablePinchZoom || !ctrlKey) return;

      const newScale = Math.max(0.5, Math.min(3, scale.get() - dy * 0.01));
      scale.set(newScale);
      onPinchZoom?.(newScale);
    },
    {
      preventDefault: true,
    }
  );

  // Combined gesture bindings
  const gestureBindings = {
    ...(enablePullToRefresh && pullToRefreshBind()),
    ...(enableSwipeNavigation && swipeNavigationBind()),
    ...(enablePinchZoom && { ...pinchZoomBind(), ...wheelZoomBind() }),
  };

  // Apple-style momentum scrolling
  const momentumScroll = useCallback((element: HTMLElement, options: ScrollIntoViewOptions = {}) => {
    if (!element) return;

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
      ...options,
    });
  }, []);

  // Apple-style elastic bounce effect
  const elasticBounce = useCallback((element: HTMLElement, direction: 'up' | 'down' | 'left' | 'right' = 'up') => {
    if (!element) return;

    const transforms = {
      up: 'translateY(-10px)',
      down: 'translateY(10px)', 
      left: 'translateX(-10px)',
      right: 'translateX(10px)',
    };

    element.style.transform = transforms[direction];
    element.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    
    setTimeout(() => {
      element.style.transform = 'translateY(0)';
    }, 50);

    setTimeout(() => {
      element.style.transition = '';
      element.style.transform = '';
    }, 350);
  }, []);

  // Touch-friendly focus management
  const focusWithKeyboard = useCallback((element: HTMLElement) => {
    if (!element) return;

    // Ensure element is visible
    momentumScroll(element, { block: 'center' });
    
    // Focus with slight delay for scroll completion
    setTimeout(() => {
      element.focus();
      
      // Trigger haptic feedback
      triggerHapticFeedback('light');
    }, 100);
  }, [momentumScroll, triggerHapticFeedback]);

  return {
    // Gesture bindings
    gestureBindings,
    pullToRefreshBind: enablePullToRefresh ? pullToRefreshBind : undefined,
    swipeNavigationBind: enableSwipeNavigation ? swipeNavigationBind : undefined,
    pinchZoomBind: enablePinchZoom ? pinchZoomBind : undefined,
    
    // Motion values
    y,
    x,
    scale,
    
    // Spring animations
    pullToRefreshSpring,
    swipeSpring,
    pinchSpring,
    
    // Utility functions
    triggerHapticFeedback,
    momentumScroll,
    elasticBounce,
    focusWithKeyboard,
    
    // Transform values for animations
    pullToRefreshTransform: useTransform(y, [0, 80], [0, 1]),
    swipeProgress: useTransform(x, [-100, 0, 100], [-1, 0, 1]),
    scaleTransform: scale,
  };
}

// Custom hook for Apple-style touch interactions
export function useAppleTouchInteractions() {
  const addTouchClass = useCallback((element: HTMLElement) => {
    if (!element) return;

    const handleTouchStart = () => {
      element.classList.add('apple-touch-active');
    };

    const handleTouchEnd = () => {
      element.classList.remove('apple-touch-active');
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    // Cleanup function
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);

  return { addTouchClass };
}

// Hook for detecting device capabilities
export function useDeviceCapabilities() {
  const hasTouch = typeof window !== 'undefined' && 'ontouchstart' in window;
  const hasHaptics = typeof navigator !== 'undefined' && 'vibrate' in navigator;
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = typeof navigator !== 'undefined' && /Android/.test(navigator.userAgent);
  const isMobile = hasTouch && (isIOS || isAndroid);
  const supportsPassive = typeof window !== 'undefined' && (() => {
    let supportsPassive = false;
    try {
      const opts = Object.defineProperty({}, 'passive', {
        get() {
          supportsPassive = true;
          return true;
        }
      });
      window.addEventListener('testPassive', () => {}, opts);
      window.removeEventListener('testPassive', () => {}, opts);
    } catch (e) {}
    return supportsPassive;
  })();

  return {
    hasTouch,
    hasHaptics,
    isIOS,
    isAndroid,
    isMobile,
    supportsPassive,
    preferReducedMotion: typeof window !== 'undefined' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  };
}