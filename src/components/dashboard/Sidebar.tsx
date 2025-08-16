'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, BarChart3, Map, Activity, BookOpen, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobile?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, mobile = false, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  const menuItems = [
    { id: 'overview', label: 'Resumen', icon: TrendingUp, gradient: 'from-blue-500 to-blue-600' },
    { id: 'projections', label: 'Proyecciones', icon: BarChart3, gradient: 'from-emerald-500 to-emerald-600' },
    { id: 'transmission-map', label: 'Cargas Singulares', icon: Map, gradient: 'from-amber-500 to-amber-600' },
    { id: 'single-line-diagram', label: 'Diagrama Unifilar', icon: Activity, gradient: 'from-purple-500 to-purple-600' },
    { id: 'documentation', label: 'Documentación', icon: BookOpen, gradient: 'from-cyan-500 to-cyan-600' },
  ];

  return (
    <motion.div 
      initial={{ x: -300 }}
      animate={{ 
        x: 0,
        width: isCollapsed ? 64 : 256 
      }}
      transition={{ 
        x: { type: "spring", stiffness: 120, damping: 25 },
        width: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
      }}
      className={`fixed left-0 top-0 h-full backdrop-blur-xl border-r border-slate-200/10 text-white ${
        mobile ? 'relative' : ''
      }`}
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)'
      }}
    >
      <motion.div 
        animate={{
          padding: isCollapsed ? '8px' : '24px'
        }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="h-full flex flex-col"
      >
        {/* Header */}
        <motion.div 
          className={`mb-8 ${isCollapsed ? 'text-center' : ''}`}
          animate={{ 
            scale: isCollapsed ? 0.8 : 1,
            opacity: 1
          }}
          transition={{ duration: 0.2 }}
        >
          <AnimatePresence mode="wait">
            {isCollapsed ? (
              <motion.div 
                key="collapsed"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-12 h-12 flex items-center justify-center mx-auto"
              >
                <Image 
                  src="/logosisdat1.png" 
                  alt="SISDAT Logo" 
                  width={40} 
                  height={40}
                  className="object-contain"
                />
              </motion.div>
            ) : (
              <motion.div 
                key="expanded"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col items-center"
              >
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex items-center justify-center"
                >
                  <Image 
                    src="/logosisdat1.png" 
                    alt="SISDAT Logo" 
                    width={180} 
                    height={180}
                    className="object-contain"
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Toggle Button - Only show on desktop */}
        {!mobile && onToggleCollapse && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleCollapse}
            className="absolute top-6 -right-3 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 border-2 border-white/20 rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-200"
            title={isCollapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronRight size={12} className="text-white" />
            </motion.div>
          </motion.button>
        )}
        
        {/* Navigation */}
        <nav className="flex-1 space-y-3">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isHovered = hoveredItem === item.id;
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <motion.button
                  onClick={() => setActiveTab(item.id)}
                  onHoverStart={() => setHoveredItem(item.id)}
                  onHoverEnd={() => setHoveredItem(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center rounded-xl transition-all duration-300 group relative overflow-hidden ${
                    isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'
                  } ${
                    isActive
                      ? 'bg-gradient-to-r ' + item.gradient + ' text-white shadow-lg'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                  title={isCollapsed ? item.label : ''}
                >
                  {/* Background glow effect */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                    />
                  )}
                  
                  {/* Icon with animation */}
                  <motion.div
                    animate={{ 
                      rotate: isActive ? 360 : 0,
                      scale: isHovered ? 1.1 : 1
                    }}
                    transition={{ duration: 0.3 }}
                    className="relative z-10"
                  >
                    <Icon size={20} />
                  </motion.div>
                  
                  {/* Label with slide animation */}
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        className="font-medium relative z-10 overflow-hidden whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"
                    />
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  <AnimatePresence>
                    {isCollapsed && isHovered && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, x: -10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, x: -10 }}
                        className="absolute left-full ml-3 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg shadow-xl whitespace-nowrap z-50 border border-white/10"
                      >
                        {item.label}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-800 rotate-45 border-l border-b border-white/10" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>
            );
          })}
          
          {/* Theme Toggle */}
          <div className="pt-4 mt-4 border-t border-slate-700">
            <button
              onClick={toggleTheme}
              className={`w-full flex items-center rounded-lg transition-colors group relative ${
                isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'
              } text-slate-300 hover:bg-slate-800 hover:text-white`}
              title={isCollapsed ? (theme === 'dark' ? 'Modo claro' : 'Modo oscuro') : ''}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              {!isCollapsed && <span>{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
                </div>
              )}
            </button>
          </div>
        </nav>
      </motion.div>
    </motion.div>
  );
}
