'use client'

import React from 'react';
import { Settings, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface HeaderProps {
  activeTab: string;
}

export default function Header({ activeTab }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };
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
          
          {/* User Info and Logout */}
          <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
            <div className="flex flex-col text-right">
              <span className="text-sm font-medium text-slate-900">{user?.name}</span>
              <span className="text-xs text-slate-600 capitalize">{user?.role?.replace('_', ' ')}</span>
            </div>
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <User size={16} className="text-primary-600" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              title="Cerrar sesión"
            >
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}