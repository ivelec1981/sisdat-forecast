'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Por favor, ingrese su correo electrónico');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        const data = await response.json();
        setError(data.error || 'Error al enviar el correo de recuperación');
      }
    } catch (err) {
      setError('Error de conexión. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Correo Enviado
          </h1>
          <p className="text-neutral-600">
            Hemos enviado las instrucciones de recuperación a tu correo electrónico.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-2">Instrucciones:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Revisa tu bandeja de entrada</li>
            <li>• Si no encuentras el correo, revisa tu carpeta de spam</li>
            <li>• El enlace expira en 15 minutos</li>
          </ul>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={() => setIsSubmitted(false)}
            variant="outline"
            className="w-full"
          >
            Enviar otro correo
          </Button>
          
          <Link href="/login">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio de sesión
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          Recuperar Contraseña
        </h1>
        <p className="text-neutral-600">
          Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
            Correo Electrónico
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            leftIcon={<Mail className="h-4 w-4 text-neutral-400" />}
            required
            disabled={isLoading}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Enviando...' : 'Enviar Instrucciones'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-sm text-neutral-600 hover:text-neutral-900 inline-flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
}