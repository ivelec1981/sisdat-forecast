'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'pulse' | 'ecuador';
  fullScreen?: boolean;
  text?: string;
}

export function LoadingSpinner({ 
  className, 
  size = 'md', 
  variant = 'default',
  fullScreen = false,
  text = 'Cargando...'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={cn(
                  'rounded-full bg-current',
                  size === 'sm' ? 'h-1 w-1' : 
                  size === 'md' ? 'h-2 w-2' :
                  size === 'lg' ? 'h-3 w-3' : 'h-4 w-4'
                )}
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5] 
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <motion.div
            className={cn(
              'rounded-full bg-current',
              sizeClasses[size]
            )}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5] 
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          />
        );

      case 'ecuador':
        return (
          <div className="relative">
            <motion.div
              className={cn(
                'rounded-full border-4 border-transparent',
                sizeClasses[size]
              )}
              style={{
                borderTopColor: '#FFD700', // Yellow
                borderRightColor: '#0066CC', // Blue  
                borderBottomColor: '#FF0000', // Red
              }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </div>
        );

      default:
        return (
          <motion.div
            className={cn(
              'rounded-full border-2 border-current border-t-transparent',
              sizeClasses[size]
            )}
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        );
    }
  };

  const spinner = (
    <div className={cn('flex flex-col items-center space-y-2', className)}>
      <div role="status" aria-label={text}>
        {renderSpinner()}
        <span className="sr-only">{text}</span>
      </div>
      {text && !fullScreen && (
        <motion.p 
          className="text-sm text-slate-600 dark:text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-8 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
          {renderSpinner()}
          {text && (
            <motion.p 
              className="mt-4 text-lg font-medium text-slate-700 dark:text-slate-300 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {text}
            </motion.p>
          )}
        </div>
      </motion.div>
    );
  }

  return spinner;
}

export default LoadingSpinner;