'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, BarChart3, Users, Shield } from 'lucide-react';
import FeatureCard from './FeatureCard';
import { useDeviceCapabilities } from '@/hooks/useAppleGestures';

interface AppleAuthLayoutCompleteProps {
  children: React.ReactNode;
}

const features = [
  {
    icon: BarChart3,
    title: 'Análisis Predictivo',
    description: 'IA de última generación',
  },
  {
    icon: Users,
    title: 'Colaboración Institucional',
    description: 'Plataforma unificada',
  },
  {
    icon: Shield,
    title: 'Seguridad Empresarial',
    description: 'Acceso garantizado',
  },
];

const institutions = ['MEM', 'ARCONEL', 'CELEC', 'CENACE'];

export default function AppleAuthLayoutComplete({ children }: AppleAuthLayoutCompleteProps) {
  const [mounted, setMounted] = useState(false);
  const { isMobile, isTablet } = useDeviceCapabilities();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div className="min-h-screen bg-apple-white font-sf apple-safe-area">
      {/* Desktop Layout - 60/40 proportion */}
      <div className="hidden lg:flex min-h-screen">
        {/* Left Panel - 60% Content */}
        <motion.div 
          className="w-3/5 p-16 xl:p-24 flex flex-col justify-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="max-w-lg xl:max-w-xl">
            {/* Logo SISDAT corporativo */}
            <motion.div 
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
              <motion.img
                src="/logosisdat1.png"
                alt="SISDAT-forecast"
                className="h-24 w-auto"
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
                }}
              />
              <p className="text-apple-sm text-apple-text-tertiary font-apple-regular mt-2">
                Sistema de Proyección de Demanda Eléctrica
              </p>
            </motion.div>

            {/* Hero Content - Extreme minimalism */}
            <motion.div 
              className="mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
              <h2 className="text-apple-4xl font-apple-light text-apple-text-primary mb-6 tracking-tight leading-tight">
                Proyectando el futuro{' '}
                <span className="font-apple-medium text-sisdat-blue-primary">
                  energético
                </span>{' '}
                del Ecuador
              </h2>
              
              <p className="text-apple-xl text-apple-text-secondary leading-relaxed max-w-md font-apple-regular">
                Plataforma oficial para la proyección de demanda eléctrica 
                del sector energético ecuatoriano.
              </p>
            </motion.div>

            {/* Features - Minimalist cards */}
            <motion.div 
              className="space-y-8 mb-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              {features.map((feature, index) => (
                <FeatureCard key={feature.title} {...feature} index={index} />
              ))}
            </motion.div>

            {/* Institutional trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
              <p className="text-apple-sm text-apple-text-tertiary mb-4 font-apple-medium">
                Confiado por instituciones líderes:
              </p>
              <div className="flex flex-wrap gap-3">
                {institutions.map((org, index) => (
                  <motion.span
                    key={org}
                    className="px-4 py-2 bg-apple-gray-100 text-apple-text-secondary text-apple-sm font-apple-medium rounded-apple-lg"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      delay: 0.9 + index * 0.1, 
                      duration: 0.3,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      backgroundColor: 'var(--apple-gray-200)',
                      transition: { duration: 0.15 }
                    }}
                  >
                    {org}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Panel - 40% Login Form */}
        <motion.div 
          className="flex-1 lg:w-2/5 bg-apple-gray-50 flex items-center justify-center p-6 lg:p-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
        >
          <div className="w-full max-w-sm">
            {children}
          </div>
        </motion.div>
      </div>

      {/* Mobile & Tablet Layout - Stack vertical */}
      <div className="lg:hidden min-h-screen flex flex-col apple-safe-area">
        {/* Mobile Header - Minimal */}
        <motion.div 
          className="px-6 py-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="flex justify-center mb-6"
            whileHover={{ scale: 1.02 }}
          >
            <motion.img
              src="/logosisdat1.png"
              alt="SISDAT-forecast"
              className="h-20 w-auto"
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
              }}
            />
          </motion.div>

          <h2 className="text-apple-2xl md:text-apple-3xl font-apple-light text-apple-text-primary mb-4 leading-tight tracking-tight">
            Proyectando el futuro{' '}
            <span className="font-apple-medium text-sisdat-blue-primary">energético</span>
          </h2>
          
          <p className="text-apple-lg text-apple-text-secondary leading-relaxed font-apple-regular">
            Plataforma oficial para la proyección de demanda eléctrica del Ecuador.
          </p>
        </motion.div>

        {/* Mobile Login Form - Priority */}
        <motion.div 
          className="flex-1 px-6 pb-8 flex items-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="w-full max-w-sm">
            {children}
          </div>
        </motion.div>

        {/* Mobile Features - Collapsible */}
        <motion.div 
          className="px-6 pb-8 bg-apple-gray-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <FeatureCard 
                key={feature.title} 
                {...feature} 
                compact 
                index={index} 
              />
            ))}
          </div>
          
          {/* Mobile institutions */}
          <div className="mt-6 text-center">
            <p className="text-apple-xs text-apple-text-tertiary mb-3 font-apple-medium">
              Confiado por:
            </p>
            <div className="flex justify-center flex-wrap gap-2">
              {institutions.map((org) => (
                <span
                  key={org}
                  className="px-3 py-1 bg-apple-gray-100 text-apple-text-secondary text-apple-xs font-apple-medium rounded-apple"
                >
                  {org}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}