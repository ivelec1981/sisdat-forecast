'use client'

import React from 'react';
import { TrendingUp, BarChart3, Map, Activity, BookOpen } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'overview', label: 'Resumen', icon: TrendingUp },
    { id: 'projections', label: 'Proyecciones', icon: BarChart3 },
    { id: 'transmission-map', label: 'Mapa de Transmisión', icon: Map },
    { id: 'single-line-diagram', label: 'Diagrama Unifilar', icon: Activity },
    { id: 'documentation', label: 'Documentación', icon: BookOpen },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white p-6">
      <div className="mb-8">
        <h1 className="text-xl font-bold">SISDAT Forecast</h1>
        <p className="text-slate-400 text-sm">ARCONEL</p>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
