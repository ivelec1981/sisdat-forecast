'use client'

import React from 'react';
import { Settings, Bell, User } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
}

export default function Header({ activeTab }: HeaderProps) {
  const getTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Resumen General';
      case 'projections': return 'Proyecciones de Demanda';
      case 'transmission-map': return 'Cargas Singulares';
      case 'single-line-diagram': return 'Diagrama Unifilar';
      case 'documentation': return 'Documentación';
      default: return 'Dashboard';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{getTitle()}</h2>
          <p className="text-slate-600">Sistema de Predicción de Demanda Eléctrica</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
            <Bell size={20} />
          </button>
          <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
            <Settings size={20} />
          </button>
          <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}