'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, User, Building, Shield } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Verificar si el usuario está autenticado
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getRoleDisplay = (role: string) => {
    const roles = {
      'administrador': 'Administrador del Sistema',
      'operador_empresa': 'Operador de Empresa',
      'consultor_mem': 'Consultor MEM',
    };
    return roles[role as keyof typeof roles] || role;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'administrador':
        return <Shield className="h-5 w-5 text-primary" />;
      case 'operador_empresa':
        return <Building className="h-5 w-5 text-accent" />;
      case 'consultor_mem':
        return <User className="h-5 w-5 text-neutral-600" />;
      default:
        return <User className="h-5 w-5 text-neutral-600" />;
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return null; // Se redirigirá al login
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-neutral-900">SISDAT-forecast</h1>
                <p className="text-xs text-neutral-600">Sistema de Proyección de Demanda Eléctrica</p>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-neutral-900">{user.name}</p>
                <p className="text-xs text-neutral-600">{user.company}</p>
              </div>
              <Button 
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
              {getRoleIcon(user.role)}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                ¡Bienvenido, {user.name}!
              </h2>
              <p className="text-neutral-600 mb-1">
                Ha ingresado exitosamente al sistema SISDAT-forecast
              </p>
              <div className="flex items-center gap-4 text-sm text-neutral-500">
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {getRoleDisplay(user.role)}
                </span>
                <span className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  {user.company}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Building className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium text-neutral-900">Proyecciones</h3>
            </div>
            <p className="text-sm text-neutral-600 mb-4">
              Acceda a las proyecciones de demanda eléctrica del sistema
            </p>
            <Link href="/">
              <Button className="w-full" size="sm">
                Ver Proyecciones
              </Button>
            </Link>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-medium text-neutral-900">Usuarios</h3>
            </div>
            <p className="text-sm text-neutral-600 mb-4">
              {user.role === 'administrador' 
                ? 'Gestione usuarios y permisos del sistema'
                : 'Ver información de usuarios autorizados'
              }
            </p>
            <Button 
              className="w-full" 
              size="sm"
              variant={user.role === 'administrador' ? 'default' : 'outline'}
            >
              {user.role === 'administrador' ? 'Gestionar Usuarios' : 'Ver Usuarios'}
            </Button>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-success" />
              </div>
              <h3 className="font-medium text-neutral-900">Reportes</h3>
            </div>
            <p className="text-sm text-neutral-600 mb-4">
              Genere y descargue reportes detallados del sistema
            </p>
            <Button className="w-full" size="sm" variant="outline">
              Generar Reportes
            </Button>
          </div>
        </div>

        {/* System Info */}
        <div className="mt-8 bg-neutral-100 rounded-lg p-4">
          <p className="text-sm text-neutral-600 text-center">
            Sistema desarrollado para el sector eléctrico ecuatoriano • 
            Versión 1.0.0 • 
            Soporte técnico: soporte@sisdat-forecast.com
          </p>
        </div>
      </main>
    </div>
  );
}