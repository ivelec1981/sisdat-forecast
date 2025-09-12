'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setError('Token de recuperación no válido o expirado');
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasNonAlphas = /\W/.test(password);

    if (password.length < minLength) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    if (!hasUpperCase) {
      return 'La contraseña debe contener al menos una letra mayúscula';
    }
    if (!hasLowerCase) {
      return 'La contraseña debe contener al menos una letra minúscula';
    }
    if (!hasNumbers) {
      return 'La contraseña debe contener al menos un número';
    }
    if (!hasNonAlphas) {
      return 'La contraseña debe contener al menos un carácter especial';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError('Por favor, complete todos los campos');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!token) {
      setError('Token de recuperación no válido');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Error al restablecer la contraseña');
      }
    } catch (err) {
      setError('Error de conexión. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token && !error) {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-neutral-600">Verificando token...</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          ¡Contraseña Restablecida!
        </h1>
        <p className="text-neutral-600 mb-6">
          Tu contraseña ha sido restablecida exitosamente. Serás redirigido al inicio de sesión en unos momentos.
        </p>
        <Link href="/login">
          <Button className="w-full">
            Ir al Inicio de Sesión
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          Nueva Contraseña
        </h1>
        <p className="text-neutral-600">
          Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
            Nueva Contraseña
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu nueva contraseña"
              leftIcon={<Lock className="h-4 w-4 text-neutral-400" />}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-neutral-400" />
              ) : (
                <Eye className="h-4 w-4 text-neutral-400" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
            Confirmar Contraseña
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirma tu nueva contraseña"
              leftIcon={<Lock className="h-4 w-4 text-neutral-400" />}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-neutral-400" />
              ) : (
                <Eye className="h-4 w-4 text-neutral-400" />
              )}
            </button>
          </div>
        </div>

        {/* Password requirements */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-neutral-900 mb-2">Requisitos de contraseña:</h4>
          <ul className="text-xs text-neutral-600 space-y-1">
            <li className={`flex items-center ${password.length >= 8 ? 'text-green-600' : ''}`}>
              <span className="mr-2">•</span>
              Al menos 8 caracteres
            </li>
            <li className={`flex items-center ${/[A-Z]/.test(password) ? 'text-green-600' : ''}`}>
              <span className="mr-2">•</span>
              Una letra mayúscula
            </li>
            <li className={`flex items-center ${/[a-z]/.test(password) ? 'text-green-600' : ''}`}>
              <span className="mr-2">•</span>
              Una letra minúscula
            </li>
            <li className={`flex items-center ${/\d/.test(password) ? 'text-green-600' : ''}`}>
              <span className="mr-2">•</span>
              Un número
            </li>
            <li className={`flex items-center ${/\W/.test(password) ? 'text-green-600' : ''}`}>
              <span className="mr-2">•</span>
              Un carácter especial
            </li>
          </ul>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !token}
        >
          {isLoading ? 'Restableciendo...' : 'Restablecer Contraseña'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-sm text-neutral-600 hover:text-neutral-900"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
}