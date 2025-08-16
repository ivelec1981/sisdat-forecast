'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  compact?: boolean;
  index?: number;
}

export default function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  compact = false,
  index = 0 
}: FeatureCardProps) {
  return (
    <motion.div
      className={cn(
        "group flex items-start transition-all duration-300 ease-out",
        compact ? "space-x-3" : "space-x-4"
      )}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.4, 0, 0.2, 1] 
      }}
      whileHover={{ 
        x: 8,
        transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
      }}
    >
      {/* Icon Container */}
      <motion.div
        className={cn(
          "flex-shrink-0 rounded-apple flex items-center justify-center",
          "bg-apple-gray-100 group-hover:bg-apple-gray-200 apple-transition",
          compact ? "w-10 h-10" : "w-12 h-12"
        )}
        whileHover={{ 
          scale: 1.05,
          transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] }
        }}
      >
        <Icon 
          className={cn(
            "text-apple-text-secondary group-hover:text-sisdat-blue-primary apple-transition",
            compact ? "w-5 h-5" : "w-6 h-6"
          )} 
        />
      </motion.div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className={cn(
          "font-apple-semibold text-apple-text-primary mb-1 tracking-tight",
          compact ? "text-apple-base" : "text-apple-lg"
        )}>
          {title}
        </h3>
        <p className={cn(
          "text-apple-text-secondary font-apple-regular leading-relaxed",
          compact ? "text-apple-sm" : "text-apple-base"
        )}>
          {description}
        </p>
      </div>
    </motion.div>
  );
}

// Preset configurations for common use cases
export const FeatureCardPresets = {
  security: {
    icon: '🔒',
    title: 'Seguridad Empresarial',
    description: 'Acceso seguro con autenticación institucional, roles diferenciados y auditoría completa.'
  },
  analytics: {
    icon: '📊',
    title: 'Análisis Predictivo',
    description: 'Proyecciones precisas basadas en datos históricos y algoritmos de machine learning.'
  },
  collaboration: {
    icon: '🏛️',
    title: 'Colaboración Institucional',
    description: 'Plataforma unificada para MEM, ARCONEL, CELEC, CENACE y empresas distribuidoras.'
  },
  realtime: {
    icon: '⚡',
    title: 'Tiempo Real',
    description: 'Monitoreo y proyecciones actualizadas en tiempo real para toma de decisiones ágil.'
  },
  ecuador: {
    icon: '🇪🇨',
    title: 'Hecho en Ecuador',
    description: 'Desarrollado específicamente para las necesidades del sector eléctrico ecuatoriano.'
  },
  government: {
    icon: '🏛️',
    title: 'Plataforma Oficial',
    description: 'Herramienta oficial del Gobierno del Ecuador para el sector eléctrico nacional.'
  }
};