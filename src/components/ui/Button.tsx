'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500 shadow-lg hover:shadow-xl",
        secondary: "bg-white text-slate-900 border border-slate-300 hover:bg-slate-50 focus:ring-slate-500 shadow-sm",
        outline: "border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
        ghost: "text-slate-700 hover:bg-slate-100 focus:ring-slate-500",
        glassmorphism: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 focus:ring-white/50 shadow-lg",
        ecuador: "bg-gradient-to-r from-yellow-400 via-blue-500 to-red-500 text-white hover:shadow-xl focus:ring-yellow-400 shadow-lg",
        default: 'bg-primary text-white hover:bg-primary-600 focus-visible:ring-primary',
        destructive: 'bg-error text-white hover:bg-error-600 focus-visible:ring-error',
        link: 'text-primary underline-offset-4 hover:underline focus-visible:ring-primary',
      },
      size: {
        sm: "h-9 px-3 text-xs",
        default: "h-11 px-4 py-2",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: 'h-10 w-10',
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  animationVariant?: 'scale' | 'slide' | 'glow';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth, 
    isLoading, 
    leftIcon, 
    rightIcon, 
    animationVariant = 'scale',
    children, 
    disabled,
    asChild = false,
    ...props 
  }, ref) => {
    const buttonAnimations = {
      scale: {
        whileHover: { scale: 1.02 },
        whileTap: { scale: 0.98 },
      },
      slide: {
        whileHover: { x: 2 },
        whileTap: { x: 0 },
      },
      glow: {
        whileHover: { 
          boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
          scale: 1.02 
        },
        whileTap: { scale: 0.98 },
      },
    };

    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, fullWidth, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        disabled={disabled || isLoading}
        {...buttonAnimations[animationVariant]}
        transition={{ duration: 0.2 }}
        {...props}
      >
        {/* Shimmer effect for primary and ecuador buttons */}
        {(variant === 'primary' || variant === 'ecuador') && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: 'linear',
              repeatDelay: 3,
            }}
          />
        )}
        
        {/* Loading spinner */}
        {isLoading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        
        {/* Left icon */}
        {!isLoading && leftIcon && (
          <span className="mr-2">{leftIcon}</span>
        )}
        
        {/* Button content */}
        <span className={isLoading ? 'opacity-70' : ''}>
          {children}
        </span>
        
        {/* Right icon */}
        {!isLoading && rightIcon && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };