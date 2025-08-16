'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  color?: string;
  loading?: boolean;
  animateValue?: boolean;
}

const CountUp = ({ end, duration = 2 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{count}</span>;
};

export default function MetricCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon,
  color = 'blue',
  loading = false,
  animateValue = false
}: MetricCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-emerald-600 dark:text-emerald-400';
      case 'negative': return 'text-red-600 dark:text-red-400';
      default: return 'text-slate-600 dark:text-slate-300';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive': return <TrendingUp className="w-3 h-3" />;
      case 'negative': return <TrendingDown className="w-3 h-3" />;
      default: return <Minus className="w-3 h-3" />;
    }
  };

  const getIconStyle = () => {
    switch (color) {
      case 'blue': 
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-950/50';
      case 'green': 
        return 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/50';
      case 'yellow': 
        return 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-950/50';
      case 'red': 
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-950/50';
      case 'purple':
        return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-950/50';
      default: 
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-950/50';
    }
  };

  const getGradientBorder = () => {
    switch (color) {
      case 'blue': return 'hover:border-blue-300 dark:hover:border-blue-700';
      case 'green': return 'hover:border-emerald-300 dark:hover:border-emerald-700';
      case 'yellow': return 'hover:border-amber-300 dark:hover:border-amber-700';
      case 'red': return 'hover:border-red-300 dark:hover:border-red-700';
      case 'purple': return 'hover:border-purple-300 dark:hover:border-purple-700';
      default: return 'hover:border-blue-300 dark:hover:border-blue-700';
    }
  };

  const numericValue = typeof value === 'string' 
    ? parseFloat(value.replace(/[^\d.-]/g, '')) 
    : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ 
        y: -2,
        transition: { duration: 0.2 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`
        relative overflow-hidden
        bg-white dark:bg-slate-800 
        rounded-xl border border-slate-200 dark:border-slate-700
        transition-all duration-300 ease-out
        hover:shadow-lg dark:hover:shadow-slate-900/50
        ${getGradientBorder()}
        group cursor-default
      `}
      style={{
        boxShadow: isHovered 
          ? `0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`
          : `0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)`
      }}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-50/30 dark:to-slate-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <motion.p 
              className="text-slate-600 dark:text-slate-300 text-sm font-medium tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {title}
            </motion.p>
            
            {loading ? (
              <div className="mt-2">
                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse-custom" />
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                className="mt-2"
              >
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {animateValue && typeof numericValue === 'number' ? (
                    <>
                      <CountUp end={numericValue} />
                      {typeof value === 'string' && value.replace(/[\d.-]/g, '')}
                    </>
                  ) : (
                    value
                  )}
                </p>
              </motion.div>
            )}
            
            {change && !loading && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className={`flex items-center gap-1 mt-3 text-xs font-medium ${getChangeColor()}`}
              >
                {getChangeIcon()}
                <span>{change}</span>
              </motion.div>
            )}
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
            whileHover={{ 
              scale: 1.1,
              rotate: 5,
              transition: { duration: 0.2 }
            }}
            className={`
              flex-shrink-0 p-3 rounded-xl transition-all duration-300
              ${getIconStyle()}
              ${isHovered ? 'shadow-lg' : 'shadow-sm'}
            `}
          >
            <Icon size={24} className="transition-transform duration-200" />
          </motion.div>
        </div>
        
        {/* Progress bar indicator (opcional) */}
        {changeType !== 'neutral' && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20"
            style={{
              color: changeType === 'positive' ? '#10b981' : changeType === 'negative' ? '#ef4444' : '#64748b'
            }}
          />
        )}
      </div>
    </motion.div>
  );
}