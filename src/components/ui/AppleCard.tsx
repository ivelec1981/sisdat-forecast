'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface AppleCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'sm' | 'default' | 'lg' | 'xl';
  hoverable?: boolean;
  onClick?: () => void;
}

const AppleCard = React.forwardRef<HTMLDivElement, AppleCardProps>(
  ({ 
    children, 
    className, 
    variant = 'default',
    padding = 'default',
    hoverable = false,
    onClick,
    ...props 
  }, ref) => {
    const baseClasses = "bg-apple-white rounded-apple-xl apple-transition overflow-hidden";
    
    const variantClasses = {
      default: "shadow-apple border border-apple-gray-200/50",
      elevated: "shadow-apple-lg",
      outlined: "border border-apple-gray-200",
      glass: "bg-apple-white/80 apple-blur shadow-apple border border-apple-white/20"
    };

    const paddingClasses = {
      none: "",
      sm: "p-4",
      default: "p-6",
      lg: "p-8",
      xl: "p-10"
    };

    const hoverClasses = hoverable 
      ? "hover:shadow-apple-lg hover:-translate-y-1 cursor-pointer active:translate-y-0 active:shadow-apple" 
      : "";

    return (
      <motion.div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          paddingClasses[padding],
          hoverClasses,
          className
        )}
        onClick={onClick}
        whileHover={hoverable ? { 
          scale: 1.02,
          transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
        } : undefined}
        whileTap={hoverable ? { 
          scale: 0.98,
          transition: { duration: 0.1, ease: [0.4, 0, 0.2, 1] }
        } : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AppleCard.displayName = "AppleCard";

export { AppleCard };