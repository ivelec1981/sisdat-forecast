'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const appleButtonVariants = cva(
  "inline-flex items-center justify-center font-sf font-apple-medium rounded-apple-lg apple-transition focus:outline-none disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        primary: "bg-apple-blue text-white shadow-apple-button hover:shadow-apple-button-hover hover:-translate-y-0.5 active:translate-y-0 active:shadow-apple-sm focus:apple-focus",
        secondary: "bg-apple-gray-100 text-apple-text-primary hover:bg-apple-gray-200 focus:apple-focus",
        ghost: "text-apple-blue hover:bg-apple-blue/5 focus:apple-focus",
        energy: "bg-gradient-to-r from-sisdat-blue-primary to-sisdat-blue-light text-white shadow-apple-button hover:shadow-[0_4px_12px_rgba(46,124,214,0.25)] hover:-translate-y-0.5 active:translate-y-0 focus:apple-focus",
        destructive: "bg-apple-red text-white shadow-apple-button hover:shadow-[0_4px_12px_rgba(255,59,48,0.25)] hover:-translate-y-0.5 active:translate-y-0 focus:apple-focus",
      },
      size: {
        sm: "h-8 px-3 text-apple-sm",
        default: "h-11 px-6 text-apple-base",
        lg: "h-12 px-8 text-apple-lg",
        xl: "h-14 px-10 text-apple-xl",
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

export interface AppleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof appleButtonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loadingText?: string;
}

const AppleButton = React.forwardRef<HTMLButtonElement, AppleButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth, 
    isLoading, 
    leftIcon, 
    rightIcon, 
    loadingText,
    children, 
    disabled,
    ...props 
  }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn(appleButtonVariants({ variant, size, fullWidth, className }))}
        disabled={disabled || isLoading}
        whileHover={{ 
          scale: 1.02,
          transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] }
        }}
        whileTap={{ 
          scale: 0.98,
          transition: { duration: 0.1, ease: [0.4, 0, 0.2, 1] }
        }}
        {...props}
      >
        {/* Apple-style subtle shine effect */}
        {variant === 'primary' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-apple-lg"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: 'linear',
              repeatDelay: 5,
            }}
          />
        )}
        
        {/* Loading spinner */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="mr-2"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
          </motion.div>
        )}
        
        {/* Left icon */}
        {!isLoading && leftIcon && (
          <motion.span 
            className="mr-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            {leftIcon}
          </motion.span>
        )}
        
        {/* Button content */}
        <motion.span 
          className={cn(
            "relative font-apple-medium tracking-[-0.01em]",
            isLoading && 'opacity-70'
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.05 }}
        >
          {isLoading && loadingText ? loadingText : children}
        </motion.span>
        
        {/* Right icon */}
        {!isLoading && rightIcon && (
          <motion.span 
            className="ml-2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            {rightIcon}
          </motion.span>
        )}
      </motion.button>
    );
  }
);

AppleButton.displayName = "AppleButton";

export { AppleButton, appleButtonVariants };