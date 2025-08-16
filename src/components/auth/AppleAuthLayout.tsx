'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, BarChart3, Shield, Users, ArrowRight } from 'lucide-react';

interface AppleAuthLayoutProps {
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

const organizations = ['MEM', 'ARCONEL', 'CELEC', 'CENACE'];

export default function AppleAuthLayout({ children }: AppleAuthLayoutProps) {
  return (
    <div className="min-h-screen bg-apple-white flex font-sf">
      {/* Left Panel - Content */}
      <motion.div 
        className="hidden lg:flex lg:w-3/5 p-16 xl:p-24 flex-col justify-center"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="max-w-lg xl:max-w-xl">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <motion.div 
              className="w-10 h-10 bg-energy-primary rounded-apple-lg flex items-center justify-center"
              whileHover={{ 
                scale: 1.1, 
                rotate: 5,
                transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
              }}
            >
              <Zap className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-apple-lg font-apple-semibold text-apple-text-primary tracking-tight">
                SISDAT-forecast
              </h1>
              <p className="text-apple-sm text-apple-text-tertiary font-apple-regular">
                Sistema de Proyección Eléctrica
              </p>
            </div>
          </motion.div>

          {/* Hero Content */}
          <motion.div 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <h2 className="text-apple-4xl font-apple-light text-apple-text-primary mb-6 tracking-tight leading-tight">
              Proyectando el futuro{' '}
              <span className="font-apple-medium text-energy-primary">
                energético
              </span>{' '}
              del Ecuador
            </h2>
            
            <p className="text-apple-xl text-apple-text-secondary leading-relaxed max-w-md font-apple-regular">
              Plataforma oficial para la proyección de demanda eléctrica 
              del sector energético ecuatoriano.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div 
            className="space-y-8 mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            {features.map((feature, index) => (
              <FeatureItem key={feature.title} feature={feature} index={index} />
            ))}
          </motion.div>

          {/* Organizations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <p className="text-apple-sm text-apple-text-tertiary mb-4 font-apple-medium">
              Confiado por instituciones líderes:
            </p>
            <div className="flex flex-wrap gap-3">
              {organizations.map((org, index) => (
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

      {/* Right Panel - Login Form */}
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
  );
}

// Feature Item Component
function FeatureItem({ 
  feature, 
  index 
}: { 
  feature: typeof features[0], 
  index: number 
}) {
  const Icon = feature.icon;
  
  return (
    <motion.div
      className="flex items-start gap-4 group"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        delay: 0.7 + index * 0.1, 
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }}
      whileHover={{ 
        x: 8,
        transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
      }}
    >
      <motion.div
        className="w-10 h-10 bg-apple-gray-100 rounded-apple-lg flex items-center justify-center flex-shrink-0 group-hover:bg-apple-gray-200 apple-transition"
        whileHover={{ 
          scale: 1.1,
          transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] }
        }}
      >
        <Icon className="h-5 w-5 text-apple-text-secondary" />
      </motion.div>
      
      <div>
        <h3 className="text-apple-lg font-apple-semibold text-apple-text-primary mb-1 tracking-tight">
          {feature.title}
        </h3>
        <p className="text-apple-base text-apple-text-secondary font-apple-regular">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}