'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showFeatures?: boolean;
}

export default function AuthLayout({ 
  children, 
  title = "SISDAT-forecast",
  subtitle = "Sistema de Proyección de Demanda Eléctrica del Ecuador",
  showFeatures = true 
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex">
      {/* Left Panel - Branding and Features */}
      <motion.div 
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Glassmorphism Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-indigo-600/90 to-purple-700/90 backdrop-blur-sm" />
        
        {/* Ecuador-inspired geometric patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-yellow-400 rounded-full animate-pulse" />
          <div className="absolute top-32 right-20 w-24 h-24 bg-yellow-400/20 rounded-lg rotate-45 animate-bounce" />
          <div className="absolute bottom-20 left-16 w-40 h-40 border-2 border-red-400 rounded-full animate-pulse" />
          <div className="absolute bottom-32 right-10 w-20 h-20 bg-blue-400/20 rounded-full animate-bounce" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 py-24 text-white">
          {/* Logo and Brand */}
          <motion.div 
            className="mb-12"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <motion.div 
                className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/30 shadow-lg"
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <Zap className="h-8 w-8 text-yellow-300" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                  {title}
                </h1>
                <p className="text-blue-100 text-sm font-medium">
                  {subtitle}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Main Tagline */}
          <motion.div 
            className="mb-12"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-6 leading-tight">
              Proyectando el futuro{' '}
              <span className="bg-gradient-to-r from-yellow-300 to-yellow-100 bg-clip-text text-transparent">
                energético
              </span>{' '}
              del Ecuador
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed max-w-lg">
              Plataforma oficial para la proyección de demanda eléctrica, utilizada por 
              entidades gubernamentales y empresas del sector eléctrico ecuatoriano.
            </p>
          </motion.div>

          {/* Features */}
          {showFeatures && (
            <motion.div 
              className="space-y-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              {features.map((feature, index) => (
                <FeatureItem key={feature.title} feature={feature} index={index} />
              ))}
            </motion.div>
          )}

          {/* Organizations */}
          <motion.div 
            className="mt-16 pt-8 border-t border-white/20"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            <p className="text-sm text-blue-200 mb-4 font-medium">Confiado por:</p>
            <div className="flex flex-wrap gap-3">
              {organizations.map((org, index) => (
                <motion.span
                  key={org}
                  className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-sm font-medium"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1 + index * 0.1, duration: 0.3 }}
                  whileHover={{ scale: 1.05, bg: "rgba(255,255,255,0.2)" }}
                >
                  {org}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Panel - Auth Form */}
      <motion.div 
        className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      >
        <div className="w-full max-w-md">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

// Feature data
const features = [
  {
    icon: '📊',
    title: 'Análisis Predictivo Avanzado',
    description: 'Proyecciones precisas basadas en datos históricos y algoritmos de machine learning de última generación.'
  },
  {
    icon: '🏛️',
    title: 'Colaboración Institucional',
    description: 'Plataforma unificada para MEM, ARCONEL, CELEC, CENACE y empresas distribuidoras.'
  },
  {
    icon: '🔒',
    title: 'Seguridad Empresarial',
    description: 'Acceso seguro con autenticación institucional, roles diferenciados y auditoría completa.'
  },
  {
    icon: '⚡',
    title: 'Tiempo Real',
    description: 'Monitoreo y proyecciones actualizadas en tiempo real para toma de decisiones ágil.'
  }
];

const organizations = ['MEM', 'ARCONEL', 'CELEC', 'CENACE', 'CNEL'];

// Feature Item Component
function FeatureItem({ feature, index }: { feature: typeof features[0], index: number }) {
  return (
    <motion.div
      className="flex items-start gap-4 group"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
      whileHover={{ x: 5 }}
    >
      <motion.div
        className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 flex-shrink-0 group-hover:bg-white/20 transition-colors"
        whileHover={{ rotate: 10, scale: 1.1 }}
      >
        <span className="text-2xl">{feature.icon}</span>
      </motion.div>
      <div>
        <h3 className="font-semibold mb-2 text-lg">{feature.title}</h3>
        <p className="text-blue-100 text-sm leading-relaxed">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}