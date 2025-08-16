import { Suspense } from 'react';
import { Zap, Lock, Shield, CheckCircle } from 'lucide-react';

import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Left Column - Branding and Security Information */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex flex-col justify-center px-12 py-24 text-white">
          {/* Logo */}
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

          {/* Security Message */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-4 leading-tight">
              Establezca una Contraseña Segura
            </h2>
            <p className="text-lg text-primary-100 leading-relaxed">
              Proteja el acceso a información crítica del sector eléctrico con una 
              contraseña robusta que cumpla con nuestros estándares de seguridad.
            </p>
          </div>

          {/* Security Requirements */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Criterios de Seguridad</h3>
                <p className="text-primary-100 text-sm">
                  Mínimo 8 caracteres con mayúsculas, minúsculas, números y símbolos
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Protección de Datos</h3>
                <p className="text-primary-100 text-sm">
                  Su nueva contraseña se almacena de forma segura y encriptada
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Activación Inmediata</h3>
                <p className="text-primary-100 text-sm">
                  Podrá acceder inmediatamente después de establecer su nueva contraseña
                </p>
              </div>
            </div>
          </div>

          {/* Password Tips */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <h3 className="font-semibold mb-4">Recomendaciones para una Contraseña Segura:</h3>
            <div className="space-y-2 text-sm text-primary-100">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                <span>Use una combinación única que solo usted conozca</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                <span>Evite información personal fácil de adivinar</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                <span>No reutilice contraseñas de otras cuentas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                <span>Considere usar un gestor de contraseñas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />
        <div className="absolute top-1/4 right-0 w-16 h-16 bg-white/10 rounded-full translate-x-8" />
        <div className="absolute bottom-1/4 right-1/4 w-12 h-12 bg-white/10 rounded-full" />
      </div>

      {/* Right Column - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-md">
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}