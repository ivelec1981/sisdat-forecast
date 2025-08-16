'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useDeviceCapabilities } from '@/hooks/useAppleGestures';
import { cn } from '@/lib/cn';

interface AppleResponsiveLayoutProps {
  children: React.ReactNode;
  variant?: 'page' | 'modal' | 'sidebar' | 'card';
  spacing?: 'compact' | 'normal' | 'spacious';
  safeArea?: boolean;
  className?: string;
}

export function AppleResponsiveLayout({
  children,
  variant = 'page',
  spacing = 'normal',
  safeArea = true,
  className,
}: AppleResponsiveLayoutProps) {
  const { isMobile, isIOS } = useDeviceCapabilities();

  const getLayoutClasses = () => {
    const baseClasses = 'w-full';
    
    const variantClasses = {
      page: cn(
        'min-h-screen',
        safeArea && 'apple-safe-area',
        // Mobile: full width with padding
        'px-iphone-padding',
        // Tablet: increased padding
        'ipad:px-ipad-padding',
        // Desktop: max width with centered content
        'macbook:px-macbook-padding macbook:max-w-7xl macbook:mx-auto',
        // Large screens: even more padding
        'imac:px-imac-padding'
      ),
      
      modal: cn(
        'relative',
        // Mobile: full screen modal
        'xs:fixed xs:inset-0 xs:z-50',
        // Tablet: centered modal with backdrop
        'ipad:fixed ipad:inset-0 ipad:flex ipad:items-center ipad:justify-center ipad:z-50',
        'ipad:p-6'
      ),
      
      sidebar: cn(
        // Mobile: full width drawer from bottom
        'xs:fixed xs:bottom-0 xs:left-0 xs:right-0 xs:z-40',
        'xs:max-h-[80vh] xs:rounded-t-apple-xl',
        // Tablet: side panel
        'ipad:fixed ipad:top-0 ipad:left-0 ipad:h-full ipad:w-80',
        'ipad:border-r ipad:border-apple-gray-200 ipad:rounded-none',
        // Desktop: integrated sidebar
        'macbook:relative macbook:w-64 macbook:flex-shrink-0'
      ),
      
      card: cn(
        'apple-card-mobile apple-card-tablet apple-card-desktop',
        'bg-apple-white border border-apple-gray-200 shadow-apple'
      ),
    };

    const spacingClasses = {
      compact: cn(
        'space-y-2 xs:space-y-3 ipad:space-y-4 macbook:space-y-6'
      ),
      normal: cn(
        'space-y-4 xs:space-y-6 ipad:space-y-8 macbook:space-y-12'
      ),
      spacious: cn(
        'space-y-6 xs:space-y-8 ipad:space-y-12 macbook:space-y-16'
      ),
    };

    return cn(
      baseClasses,
      variantClasses[variant],
      spacingClasses[spacing],
      className
    );
  };

  const getMotionProps = () => {
    if (variant === 'modal') {
      return {
        initial: { opacity: 0, scale: 0.95, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 20 },
        transition: { 
          type: 'spring',
          stiffness: 300,
          damping: 30,
          mass: 0.8
        },
      };
    }

    if (variant === 'sidebar') {
      return {
        initial: isMobile 
          ? { y: '100%' } 
          : { x: '-100%' },
        animate: isMobile 
          ? { y: 0 } 
          : { x: 0 },
        exit: isMobile 
          ? { y: '100%' } 
          : { x: '-100%' },
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 30,
        },
      };
    }

    return {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: { 
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      },
    };
  };

  return (
    <motion.div
      className={getLayoutClasses()}
      {...getMotionProps()}
    >
      {children}
    </motion.div>
  );
}

// Specialized layout components
export function ApplePageLayout({ children, ...props }: Omit<AppleResponsiveLayoutProps, 'variant'>) {
  return (
    <AppleResponsiveLayout variant="page" {...props}>
      {children}
    </AppleResponsiveLayout>
  );
}

export function AppleModalLayout({ children, ...props }: Omit<AppleResponsiveLayoutProps, 'variant'>) {
  return (
    <AppleResponsiveLayout variant="modal" {...props}>
      <div className="apple-container max-w-lg mx-auto">
        {children}
      </div>
    </AppleResponsiveLayout>
  );
}

export function AppleSidebarLayout({ children, ...props }: Omit<AppleResponsiveLayoutProps, 'variant'>) {
  return (
    <AppleResponsiveLayout variant="sidebar" {...props}>
      {children}
    </AppleResponsiveLayout>
  );
}

export function AppleCardLayout({ children, ...props }: Omit<AppleResponsiveLayoutProps, 'variant'>) {
  return (
    <AppleResponsiveLayout variant="card" {...props}>
      {children}
    </AppleResponsiveLayout>
  );
}

// Grid layout component with Apple breakpoints
interface AppleGridProps {
  children: React.ReactNode;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

export function AppleGrid({
  children,
  cols = { xs: 1, sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 16,
  className,
}: AppleGridProps) {
  const gridClasses = cn(
    'grid',
    `grid-cols-${cols.xs || 1}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    className
  );

  return (
    <div 
      className={gridClasses}
      style={{ gap: `${gap}px` }}
    >
      {children}
    </div>
  );
}

// Responsive text component
interface AppleResponsiveTextProps {
  children: React.ReactNode;
  variant?: 'body' | 'heading' | 'caption' | 'title';
  className?: string;
}

export function AppleResponsiveText({
  children,
  variant = 'body',
  className,
}: AppleResponsiveTextProps) {
  const variantClasses = {
    body: 'apple-text-responsive font-apple-regular text-apple-text-primary',
    heading: 'apple-heading-responsive text-apple-text-primary',
    caption: cn(
      'text-apple-xs text-apple-text-tertiary font-apple-regular',
      'ipad:text-apple-sm',
      'macbook:text-apple-base'
    ),
    title: cn(
      'text-apple-xl font-apple-semibold text-apple-text-primary',
      'ipad:text-apple-2xl',
      'macbook:text-apple-3xl'
    ),
  };

  return (
    <div className={cn(variantClasses[variant], className)}>
      {children}
    </div>
  );
}

// Responsive navigation component
interface AppleNavProps {
  children: React.ReactNode;
  variant?: 'top' | 'bottom' | 'side';
  className?: string;
}

export function AppleNav({
  children,
  variant = 'top',
  className,
}: AppleNavProps) {
  const { isMobile } = useDeviceCapabilities();

  const getNavClasses = () => {
    const baseClasses = 'flex items-center';
    
    if (variant === 'bottom') {
      return cn(
        baseClasses,
        'apple-nav-mobile apple-nav-desktop',
        'justify-around xs:justify-around',
        'ipad:justify-center ipad:space-x-8',
        'macbook:justify-start macbook:space-x-6'
      );
    }

    if (variant === 'side') {
      return cn(
        baseClasses,
        'flex-col space-y-2',
        'xs:space-y-4 ipad:space-y-6 macbook:space-y-4'
      );
    }

    // Top navigation
    return cn(
      baseClasses,
      'justify-between px-iphone-padding py-3',
      'ipad:px-ipad-padding ipad:py-4',
      'macbook:px-macbook-padding macbook:py-6',
      'apple-safe-top'
    );
  };

  return (
    <nav className={cn(getNavClasses(), className)}>
      {children}
    </nav>
  );
}

// Hook for responsive breakpoint detection
export function useAppleBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<string>('xs');

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width >= 2560) setBreakpoint('6xl');
      else if (width >= 1920) setBreakpoint('5xl');
      else if (width >= 1728) setBreakpoint('4xl');
      else if (width >= 1512) setBreakpoint('3xl');
      else if (width >= 1366) setBreakpoint('2xl');
      else if (width >= 1024) setBreakpoint('xl');
      else if (width >= 768) setBreakpoint('lg');
      else if (width >= 430) setBreakpoint('md');
      else if (width >= 390) setBreakpoint('sm');
      else setBreakpoint('xs');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    breakpoint,
    isXs: breakpoint === 'xs',
    isSm: ['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'].includes(breakpoint),
    isMd: ['md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'].includes(breakpoint),
    isLg: ['lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'].includes(breakpoint),
    isXl: ['xl', '2xl', '3xl', '4xl', '5xl', '6xl'].includes(breakpoint),
    is2Xl: ['2xl', '3xl', '4xl', '5xl', '6xl'].includes(breakpoint),
    isMobile: ['xs', 'sm'].includes(breakpoint),
    isTablet: ['md', 'lg'].includes(breakpoint),
    isDesktop: ['xl', '2xl', '3xl', '4xl', '5xl', '6xl'].includes(breakpoint),
  };
}