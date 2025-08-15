'use client'

import React from 'react';
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
  
  const menuItems = [
    { id: 'overview', label: 'Resumen', icon: TrendingUp },
    { id: 'projections', label: 'Proyecciones', icon: BarChart3 },
    { id: 'transmission-map', label: 'Cargas Singulares', icon: Map },
    { id: 'single-line-diagram', label: 'Diagrama Unifilar', icon: Activity },
    { id: 'documentation', label: 'Documentación', icon: BookOpen },
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-slate-900 dark:bg-slate-950 text-white transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } ${mobile ? 'relative' : ''}`}>
      <div className={`${isCollapsed ? 'p-2' : 'p-6'} transition-all duration-300`}>
        {/* Header */}
        <div className={`mb-8 ${isCollapsed ? 'text-center' : ''}`}>
          {isCollapsed ? (
            <div className="w-12 h-12 flex items-center justify-center mx-auto">
              <Image 
                src="/logosisdat1.png" 
                alt="SISDAT Logo" 
                width={40} 
                height={40}
                className="object-contain"
              />
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center">
                <Image 
                  src="/logosisdat1.png" 
                  alt="SISDAT Logo" 
                  width={200} 
                  height={200}
                  className="object-contain"
                />
              </div>
            </>
          )}
        </div>
        
        {/* Toggle Button - Only show on desktop */}
        {!mobile && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="absolute top-6 -right-3 w-6 h-6 bg-slate-900 border-2 border-slate-700 rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight size={12} className="text-slate-300" />
            ) : (
              <ChevronLeft size={12} className="text-slate-300" />
            )}
          </button>
        )}
        
        {/* Navigation */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center rounded-lg transition-colors group relative ${
                  isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'
                } ${
                  activeTab === item.id
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                title={isCollapsed ? item.label : ''}
              >
                <Icon size={20} />
                {!isCollapsed && <span>{item.label}</span>}
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </button>
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
      </div>
    </div>
  );
}
