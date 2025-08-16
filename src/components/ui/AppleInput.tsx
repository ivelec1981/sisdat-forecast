'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const appleInputVariants = cva(
  "flex w-full rounded-apple border apple-transition focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 font-sf",
  {
    variants: {
      variant: {
        default: "bg-apple-gray-100/60 border-transparent text-apple-text-primary placeholder:text-apple-text-tertiary focus:bg-apple-white focus:border-apple-blue focus:apple-focus",
        filled: "bg-apple-white border-apple-gray-200 text-apple-text-primary placeholder:text-apple-text-tertiary focus:border-apple-blue focus:apple-focus hover:border-apple-gray-300",
        error: "bg-apple-white border-apple-red text-apple-text-primary placeholder:text-apple-text-tertiary focus:border-apple-red focus:ring-apple-red/20",
        success: "bg-apple-white border-apple-green text-apple-text-primary placeholder:text-apple-text-tertiary focus:border-apple-green focus:ring-apple-green/20",
      },
      size: {
        sm: "h-9 px-3 text-apple-sm",
        default: "h-11 px-4 text-apple-base",
        lg: "h-12 px-4 text-apple-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface AppleInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof appleInputVariants> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
  floatingLabel?: boolean;
}

const AppleInput = React.forwardRef<HTMLInputElement, AppleInputProps>(
  ({ 
    className, 
    variant, 
    size, 
    type = 'text',
    label,
    error,
    success,
    helperText,
    leftIcon,
    rightIcon,
    isPassword = false,
    floatingLabel = false,
    placeholder,
    value,
    id,
    onFocus,
    onBlur,
    onChange,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!value);

    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
    
    // Determine if we should show the floating label
    const shouldFloat = floatingLabel && (isFocused || hasValue || value);
    
    // Determine variant based on validation state
    const currentVariant = error ? 'error' : success ? 'success' : variant;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      onChange?.(e);
    };

    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-2">
        {/* Traditional Label */}
        {label && !floatingLabel && (
          <motion.label 
            htmlFor={inputId}
            className="block text-apple-sm font-apple-medium text-apple-text-primary"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <motion.div 
              className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <div className="text-apple-text-tertiary">
                {leftIcon}
              </div>
            </motion.div>
          )}

          {/* Input Field */}
          <motion.input
            ref={ref}
            type={inputType}
            id={inputId}
            className={cn(
              appleInputVariants({ variant: currentVariant, size, className }),
              leftIcon && "pl-10",
              (rightIcon || isPassword) && "pr-10",
              floatingLabel && "placeholder-transparent"
            )}
            placeholder={floatingLabel ? " " : placeholder}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />

          {/* Floating Label */}
          {floatingLabel && label && (
            <motion.label
              htmlFor={inputId}
              className={cn(
                "absolute pointer-events-none apple-transition font-sf",
                leftIcon ? "left-10" : "left-4",
                shouldFloat 
                  ? "top-0 -translate-y-1/2 text-apple-xs bg-apple-white px-2 text-apple-blue font-apple-medium" 
                  : "top-1/2 -translate-y-1/2 text-apple-base text-apple-text-tertiary",
                currentVariant === 'error' && shouldFloat && "text-apple-red",
                currentVariant === 'success' && shouldFloat && "text-apple-green"
              )}
              animate={{
                scale: shouldFloat ? 0.85 : 1,
                y: shouldFloat ? -8 : 0,
              }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              {label}
            </motion.label>
          )}

          {/* Right Icon / Password Toggle / Validation Icons */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {isPassword ? (
              <motion.button
                type="button"
                className="text-apple-text-tertiary hover:text-apple-text-secondary focus:outline-none apple-transition"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </motion.button>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <AlertCircle className="h-4 w-4 text-apple-red" />
              </motion.div>
            ) : success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <CheckCircle className="h-4 w-4 text-apple-green" />
              </motion.div>
            ) : rightIcon ? (
              <motion.div 
                className="text-apple-text-tertiary"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                {rightIcon}
              </motion.div>
            ) : null}
          </div>
        </div>

        {/* Helper Text / Validation Messages */}
        <AnimatePresence mode="wait">
          {(error || success || helperText) && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <p className={cn(
                "text-apple-xs font-apple-regular",
                error && "text-apple-red",
                success && "text-apple-green",
                !error && !success && "text-apple-text-tertiary"
              )}>
                {error || success || helperText}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

AppleInput.displayName = "AppleInput";

export { AppleInput, appleInputVariants };