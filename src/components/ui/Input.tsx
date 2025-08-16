'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const inputVariants = cva(
  "flex w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500",
        error: "border-red-500 bg-white text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:ring-red-500",
        success: "border-green-500 bg-white text-slate-900 placeholder:text-slate-400 focus:border-green-500 focus:ring-green-500",
        glassmorphism: "border-white/20 bg-white/10 backdrop-blur-md text-white placeholder:text-white/70 focus:border-white/50 focus:ring-white/50",
      },
      size: {
        sm: "h-9 px-3 text-xs",
        default: "h-11 px-4 py-2 text-sm",
        lg: "h-12 px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  success?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
  floatingLabel?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    size, 
    type = 'text',
    label,
    error,
    success,
    leftIcon,
    rightIcon,
    isPassword = false,
    floatingLabel = false,
    placeholder,
    value,
    id,
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
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-2">
        {/* Traditional Label */}
        {label && !floatingLabel && (
          <label 
            htmlFor={inputId} 
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              {leftIcon}
            </div>
          )}

          {/* Input Field */}
          <motion.input
            ref={ref}
            type={inputType}
            id={inputId}
            className={cn(
              inputVariants({ variant: currentVariant, size, className }),
              leftIcon && "pl-10",
              (rightIcon || isPassword) && "pr-10",
              floatingLabel && "placeholder-transparent"
            )}
            placeholder={floatingLabel ? " " : placeholder}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            whileFocus={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            {...props}
          />

          {/* Floating Label */}
          {floatingLabel && label && (
            <motion.label
              htmlFor={inputId}
              className={cn(
                "absolute left-3 text-slate-400 pointer-events-none transition-all duration-200",
                leftIcon && "left-10",
                shouldFloat 
                  ? "top-0 -translate-y-1/2 text-xs bg-white px-1 text-blue-600" 
                  : "top-1/2 -translate-y-1/2 text-sm",
                currentVariant === 'glassmorphism' && shouldFloat && "bg-transparent text-white"
              )}
              animate={{
                scale: shouldFloat ? 0.85 : 1,
                y: shouldFloat ? -8 : 0,
              }}
              transition={{ duration: 0.2 }}
            >
              {label}
            </motion.label>
          )}

          {/* Right Icon / Password Toggle */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {isPassword ? (
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            ) : rightIcon ? (
              <div className="text-slate-400">
                {rightIcon}
              </div>
            ) : null}
          </div>
        </div>

        {/* Validation Messages */}
        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "text-xs font-medium",
              error && "text-red-600",
              success && "text-green-600"
            )}
          >
            {error || success}
          </motion.div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input, inputVariants };