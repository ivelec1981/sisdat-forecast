'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface SisdatLogoProps {
  variant?: 'full' | 'compact';
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  animated?: boolean;
}

const SisdatLogo: React.FC<SisdatLogoProps> = ({ 
  variant = 'full', 
  className = '', 
  style = {},
  priority = false,
  animated = true
}) => {
  const logoConfig = {
    full: {
      width: 180,
      height: 59, // Respeta el ratio 970:319 ≈ 3.04:1
      maxWidth: '180px',
      maxHeight: '60px',
      containerClass: 'w-full max-w-[180px]'
    },
    compact: {
      width: 48,
      height: 16, // Respeta el ratio 970:319 ≈ 3.04:1  
      maxWidth: '48px',
      maxHeight: '16px',
      containerClass: 'w-12 h-8'
    }
  };

  const config = logoConfig[variant];

  const LogoComponent = (
    <div className={`flex items-center justify-center overflow-hidden ${config.containerClass}`}>
      <Image 
        src="/logosisdat1.png" 
        alt="SISDAT Forecast - Sistema de Proyección de Demanda Eléctrica" 
        width={config.width} 
        height={config.height}
        className={`object-contain w-full h-auto ${variant === 'full' ? 'drop-shadow-lg' : 'drop-shadow-sm'} ${className}`}
        style={{ 
          width: "auto", 
          height: "auto", 
          maxWidth: config.maxWidth, 
          maxHeight: config.maxHeight,
          filter: variant === 'full' 
            ? "brightness(1.1) contrast(1.05) drop-shadow(0 2px 8px rgba(0,0,0,0.3))"
            : "brightness(1.1) contrast(1.1)",
          ...style
        }}
        priority={priority}
        unoptimized={false}
        sizes={variant === 'full' ? "(max-width: 768px) 100vw, 180px" : "48px"}
      />
    </div>
  );

  if (!animated) {
    return LogoComponent;
  }

  return (
    <motion.div
      whileHover={{ 
        scale: variant === 'full' ? 1.05 : 1.1,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {LogoComponent}
    </motion.div>
  );
};

export default SisdatLogo;