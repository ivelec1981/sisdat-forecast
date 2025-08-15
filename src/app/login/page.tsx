'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, BarChart3, Users, Shield, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Left Column - Branding and Information */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex flex-col justify-center px-12 py-24 text-white">
          {/* Logo Placeholder */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">SISDAT-forecast</h1>
                <p className="text-primary-100 text-sm">Sistema de Proyección de Demanda Eléctrica</p>
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-4 leading-tight">
              Proyectando el futuro energético del Ecuador
            </h2>
            <p className="text-lg text-primary-100 leading-relaxed">
              Plataforma crítica para la proyección de demanda eléctrica, utilizada por entidades 
              gubernamentales y empresas del sector eléctrico ecuatoriano.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Análisis Predictivo</h3>
                <p className="text-primary-100 text-sm">
                  Proyecciones precisas basadas en datos históricos y algoritmos avanzados
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Colaboración Institucional</h3>
                <p className="text-primary-100 text-sm">
                  Herramienta utilizada por MEM, ARCONEL, CELEC y CENACE
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Seguridad Empresarial</h3>
                <p className="text-primary-100 text-sm">
                  Acceso seguro con autenticación institucional y roles diferenciados
                </p>
              </div>
            </div>
          </div>

          {/* Organizations */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-sm text-primary-100 mb-4">Utilizado por:</p>
            <div className="flex flex-wrap gap-4 text-sm font-medium">
              <span className="px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">MEM</span>
              <span className="px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">ARCONEL</span>
              <span className="px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">CELEC</span>
              <span className="px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">CENACE</span>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />
        <div className="absolute top-1/2 right-0 w-16 h-16 bg-white/10 rounded-full translate-x-8" />
      </div>

      {/* Right Column - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-md">
          <SimpleLoginForm />
        </div>
      </div>
    </div>
  );
}

function SimpleLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError('Credenciales incorrectas. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-neutral-900">
          Iniciar Sesión en SISDAT-forecast
        </h1>
        <p className="text-neutral-600">
          Accede a la plataforma de proyección de demanda eléctrica
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
            Correo Electrónico Institucional
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-neutral-400" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre.apellido@empresa.com"
              className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
            Contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-neutral-400" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              className="block w-full pl-10 pr-10 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-neutral-400 hover:text-neutral-600" />
              ) : (
                <Eye className="h-4 w-4 text-neutral-400 hover:text-neutral-600" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Iniciando sesión...' : 'Ingresar'}
        </button>
      </form>

      <div className="text-center text-sm text-neutral-600">
        <p>Credenciales de prueba:</p>
        <p><strong>Email:</strong> admin@arconel.gob.ec</p>
        <p><strong>Contraseña:</strong> Admin123@</p>
      </div>
    </div>
  );
}