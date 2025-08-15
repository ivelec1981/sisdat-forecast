import { Suspense } from 'react';
import { Zap, Shield, Mail } from 'lucide-react';

import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Left Column - Branding and Information */}
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

          {/* Recovery Information */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-4 leading-tight">
              Recuperación Segura de Acceso
            </h2>
            <p className="text-lg text-primary-100 leading-relaxed">
              Su seguridad es nuestra prioridad. El proceso de recuperación está diseñado 
              para proteger el acceso a información crítica del sector eléctrico.
            </p>
          </div>

          {/* Security Features */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Verificación por Email</h3>
                <p className="text-primary-100 text-sm">
                  Enviaremos un enlace seguro a su correo electrónico institucional registrado
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Enlace Temporal</h3>
                <p className="text-primary-100 text-sm">
                  El enlace de recuperación tiene una validez limitada por seguridad
                </p>
              </div>
            </div>
          </div>

          {/* Process Steps */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <h3 className="font-semibold mb-4">Proceso de Recuperación:</h3>
            <div className="space-y-3 text-sm text-primary-100">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-medium">1</div>
                <span>Ingrese su correo electrónico institucional</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-medium">2</div>
                <span>Revise su bandeja de entrada</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-medium">3</div>
                <span>Haga clic en el enlace recibido</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-medium">4</div>
                <span>Cree su nueva contraseña segura</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />
        <div className="absolute top-1/3 right-0 w-16 h-16 bg-white/10 rounded-full translate-x-8" />
      </div>

      {/* Right Column - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-md">
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            <ForgotPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}