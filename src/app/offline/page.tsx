'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { WifiOff, RefreshCw, Zap } from 'lucide-react';
import { AppleButton } from '@/components/ui/AppleButton';

export default function OfflinePage() {
  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-apple-white flex items-center justify-center p-6 apple-safe-area">
      <motion.div
        className="text-center max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* App Icon */}
        <motion.div
          className="w-20 h-20 bg-sisdat-blue-primary rounded-apple-xl flex items-center justify-center mx-auto mb-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Zap className="w-10 h-10 text-white" />
        </motion.div>

        {/* App Name */}
        <h1 className="text-apple-lg font-apple-semibold text-apple-text-primary mb-2">
          SISDAT-forecast
        </h1>

        {/* Offline Icon and Message */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 bg-apple-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <WifiOff className="w-8 h-8 text-apple-text-secondary" />
          </motion.div>

          <h2 className="text-apple-xl font-apple-semibold text-apple-text-primary mb-3">
            Sin conexión
          </h2>
          
          <p className="text-apple-base text-apple-text-secondary leading-relaxed font-apple-regular">
            No hay conexión a internet disponible. Verifique su conexión de red 
            e intente nuevamente.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <AppleButton
            variant="energy"
            size="lg"
            fullWidth
            onClick={handleRetry}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Reintentar conexión
          </AppleButton>

          <AppleButton
            variant="secondary"
            size="lg"
            fullWidth
            onClick={handleGoHome}
          >
            Ir al inicio
          </AppleButton>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          className="mt-8 p-4 bg-apple-gray-50 rounded-apple text-left"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <h3 className="text-apple-sm font-apple-semibold text-apple-text-primary mb-2">
            Funcionalidad sin conexión
          </h3>
          
          <ul className="text-apple-xs text-apple-text-secondary space-y-1">
            <li>• Acceso a datos guardados previamente</li>
            <li>• Navegación entre páginas visitadas</li>
            <li>• Sincronización automática al reconectar</li>
          </ul>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-apple-xs text-apple-text-tertiary mt-6 font-apple-regular"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          SISDAT-forecast funciona mejor con conexión a internet
        </motion.p>
      </motion.div>
    </div>
  );
}