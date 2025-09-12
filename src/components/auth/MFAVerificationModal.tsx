'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Smartphone, AlertCircle, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import { AppleButton } from '@/components/ui/AppleButton';
import { AppleCard } from '@/components/ui/AppleCard';
import { mfaVerificationSchema, type MFAVerificationFormData } from '@/lib/validations/secureAuth';
import { useAuth } from '@/hooks/useAuth';

interface MFAVerificationModalProps {
  isOpen: boolean;
  sessionToken: string;
  userEmail?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MFAVerificationModal({
  isOpen,
  sessionToken,
  userEmail,
  onClose,
  onSuccess
}: MFAVerificationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [canResendCode, setCanResendCode] = useState(false);
  
  const router = useRouter();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset
  } = useForm<MFAVerificationFormData>({
    resolver: zodResolver(mfaVerificationSchema),
    mode: 'onChange',
    defaultValues: {
      code: '',
      sessionToken: sessionToken
    },
  });

  const watchedCode = watch('code');
  
  // Debug logging
  React.useEffect(() => {
    console.log('MFA State:', { 
      watchedCode, 
      codeLength: watchedCode?.length, 
      isValid, 
      isLoading,
      errors: errors.code 
    });
  }, [watchedCode, isValid, isLoading, errors.code]);

  // Timer for code expiration
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setCanResendCode(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  // Auto-focus and format code input
  useEffect(() => {
    if (watchedCode && watchedCode.length === 6) {
      console.log('Auto-submit would trigger for code:', watchedCode);
      // Temporarily disabled auto-submit for debugging
      // handleSubmit(onSubmit)();
    }
  }, [watchedCode, handleSubmit]);

  // Simulate MFA verification
  const verifyMFACode = async (data: MFAVerificationFormData): Promise<{
    success: boolean;
    error?: string;
  }> => {
    console.log('verifyMFACode called with:', data);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Valid test MFA codes for development/demo (avoiding sequential patterns)
    const validMFACodes = [
      '804216', // For admin@arconel.gob.ec (randomized, no patterns)
      '926374', // For director@mem.gob.ec  
      '713948', // For operador@celec.gob.ec
      '105827', // For analista@cenace.gob.ec
      '294631', // Additional valid code
      '680427'  // Additional valid code
    ];

    console.log('Valid codes:', validMFACodes);
    console.log('Submitted code:', data.code);
    console.log('Code length:', data.code.length);

    if (data.code.length !== 6) {
      console.log('Length validation failed');
      return { success: false, error: 'El código debe tener 6 dígitos.' };
    }

    // Check against only the most obvious prohibited patterns
    const invalidPatterns = [
      /000000|111111|222222|333333|444444|555555|666666|777777|888888|999999/,
    ];

    const hasInvalidPattern = invalidPatterns.some(pattern => pattern.test(data.code));
    if (hasInvalidPattern) {
      console.log('Pattern validation failed');
      return { success: false, error: 'Código de verificación inválido. Use su aplicación de autenticación.' };
    }

    // Check if code is in valid list
    const isValidCode = validMFACodes.includes(data.code);
    console.log('Is valid code?', isValidCode);
    
    if (!isValidCode) {
      console.log('Code not in valid list');
      return { success: false, error: 'Código de verificación incorrecto. Verifique su aplicación de autenticación.' };
    }

    // Simulate successful verification
    console.log('MFA verification successful!');
    return { success: true };
  };

  const { login } = useAuth();

  const onSubmit = async (data: MFAVerificationFormData) => {
    console.log('MFA onSubmit called with data:', data);
    try {
      setIsLoading(true);
      setMfaError(null);

      console.log('Calling verifyMFACode...');
      const result = await verifyMFACode(data);
      console.log('MFA verification result:', result);

      if (!result.success) {
        console.log('❌ MFA failed:', result.error);
        setMfaError(result.error || 'Código de verificación incorrecto');
        console.log('🔄 Resetting form due to MFA failure...');
        reset();
        return;
      }

      // Success - authenticate user in Zustand store
      console.log('✅ MFA successful! Setting authenticated user in store...');
      
      // Create user data based on the email from login context
      const getUserData = (email: string) => {
        const emailToUserMap: Record<string, any> = {
          'admin@arconel.gob.ec': {
            id: 'user_arconel_admin',
            email: 'admin@arconel.gob.ec',
            name: 'Administrador ARCONEL',
            role: 'administrador' as const,
            company: 'ARCONEL'
          },
          'director@mem.gob.ec': {
            id: 'user_mem_director',
            email: 'director@mem.gob.ec',
            name: 'Director MEM',
            role: 'administrador' as const,
            company: 'Ministerio de Energía'
          },
          'operador@celec.gob.ec': {
            id: 'user_celec_operator',
            email: 'operador@celec.gob.ec',
            name: 'Operador CELEC',
            role: 'operador_empresa' as const,
            company: 'CELEC EP'
          },
          'analista@cenace.gob.ec': {
            id: 'user_cenace_analyst',
            email: 'analista@cenace.gob.ec',
            name: 'Analista CENACE',
            role: 'consultor_mem' as const,
            company: 'CENACE'
          }
        };
        
        return emailToUserMap[email] || {
          id: 'user_default',
          email: email,
          name: 'Usuario del Sistema',
          role: 'consultor_mem' as const,
          company: 'Institución Gubernamental'
        };
      };
      
      const userData = getUserData(userEmail || 'admin@arconel.gob.ec');
      
      // Set user and token in Zustand store directly
      useAuth.setState({ 
        user: userData, 
        token: sessionToken, 
        isLoading: false, 
        error: null 
      });
      
      console.log('✅ User authenticated in store:', userData);
      
      // Verify the store was updated
      const currentState = useAuth.getState();
      console.log('🔍 Current Zustand state after setting:', currentState);
      
      // Check if localStorage was updated
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('sisdat-auth-storage');
          console.log('💾 localStorage after MFA success:', stored);
        }
      }, 100);
      
      console.log('📍 Calling onSuccess callback...');
      onSuccess();
      console.log('🚀 Attempting navigation to /dashboard...');
      router.push('/dashboard');

    } catch (error) {
      console.error('❌ MFA verification error:', error);
      console.error('❌ Error details:', { 
        message: error instanceof Error ? error.message : 'No message', 
        stack: error instanceof Error ? error.stack : 'No stack',
        type: typeof error,
        stringified: JSON.stringify(error, null, 2)
      });
      setMfaError('Error del sistema. Intente nuevamente.');
    } finally {
      console.log('🔄 MFA onSubmit finally block - setting isLoading to false');
      setIsLoading(false);
    }
  };

  const handleCodeInput = (value: string, index: number) => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, '');
    
    // Update the full code
    const currentCode = watchedCode || '';
    const newCode = currentCode.substring(0, index) + numericValue + currentCode.substring(index + 1);
    const finalCode = newCode.substring(0, 6);
    setValue('code', finalCode);
    
    console.log('Code updated:', finalCode, 'Length:', finalCode.length);

    // Auto-focus next input
    if (numericValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !watchedCode?.[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = async () => {
    setCanResendCode(false);
    setTimeRemaining(30);
    setMfaError(null);
    reset();
    
    // Simulate resend API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Show success message
    setMfaError('Nuevo código enviado a su aplicación de autenticación.');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <AppleCard variant="glass" padding="xl" className="relative">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                className="w-16 h-16 mx-auto mb-4 bg-sisdat-blue-primary rounded-apple-lg flex items-center justify-center"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <Shield className="w-8 h-8 text-white" />
              </motion.div>
              
              <h2 className="text-apple-2xl font-apple-semibold text-apple-text-primary mb-2">
                Verificación de Seguridad
              </h2>
              
              <p className="text-apple-base text-apple-text-secondary leading-relaxed">
                Ingrese el código de 6 dígitos de su aplicación de autenticación
              </p>
            </div>

            {/* MFA Error Display */}
            <AnimatePresence>
              {mfaError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  className="mb-6 p-4 bg-apple-red/5 border border-apple-red/20 rounded-apple"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 mt-0.5 text-apple-red flex-shrink-0" />
                    <p className="text-apple-sm text-apple-red">{mfaError}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* MFA Code Input */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <label className="block text-apple-sm font-apple-medium text-apple-text-primary text-center">
                  Código de Autenticación
                </label>
                
                <div className="flex justify-center gap-3">
                  {Array.from({ length: 6 }, (_, index) => (
                    <motion.input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={watchedCode?.[index] || ''}
                      onChange={(e) => handleCodeInput(e.target.value, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="w-12 h-12 text-center text-apple-lg font-apple-semibold bg-apple-gray-100 border border-apple-gray-200 rounded-apple focus:bg-white focus:border-sisdat-blue-primary focus:ring-2 focus:ring-sisdat-blue-primary/20 apple-transition"
                      placeholder="•"
                      disabled={isLoading}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                    />
                  ))}
                </div>

                {errors.code && (
                  <motion.p 
                    className="text-center text-apple-sm text-apple-red"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {errors.code.message}
                  </motion.p>
                )}
              </div>

              {/* Timer and Resend */}
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-apple-sm text-apple-text-tertiary">
                  <Smartphone className="w-4 h-4" />
                  <span>
                    {timeRemaining > 0 
                      ? `Código válido por ${formatTime(timeRemaining)}`
                      : 'Código expirado'
                    }
                  </span>
                </div>

                {canResendCode && (
                  <motion.button
                    type="button"
                    onClick={handleResendCode}
                    className="flex items-center justify-center gap-2 text-apple-sm text-sisdat-blue-primary hover:text-sisdat-blue-dark font-apple-medium apple-transition"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Solicitar nuevo código
                  </motion.button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <AppleButton
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </AppleButton>

                <button
                  type="button"
                  className="flex-1 h-12 px-8 bg-gradient-to-r from-sisdat-blue-primary to-sisdat-blue-light text-white font-apple-medium rounded-apple-lg shadow-apple-button hover:shadow-[0_4px_12px_rgba(46,124,214,0.25)] hover:-translate-y-0.5 active:translate-y-0 focus:apple-focus transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none"
                  disabled={isLoading || watchedCode?.length !== 6}
                  onClick={() => {
                    console.log('Manual button click triggered');
                    console.log('Current code:', watchedCode);
                    console.log('isLoading:', isLoading);
                    console.log('Code length:', watchedCode?.length);
                    
                    if (!watchedCode || watchedCode.length !== 6) {
                      console.log('Button should be disabled - code length invalid');
                      return;
                    }
                    
                    console.log('Calling onSubmit directly...');
                    onSubmit({ code: watchedCode, sessionToken });
                  }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verificando...</span>
                    </div>
                  ) : (
                    'Verificar'
                  )}
                </button>
              </div>
            </form>

            {/* Help Text */}
            <div className="mt-6 p-3 bg-sisdat-blue-light/5 border border-sisdat-blue-light/20 rounded-apple">
              <p className="text-apple-xs text-apple-text-tertiary leading-relaxed text-center">
                Utilice aplicaciones como Google Authenticator, Authy o Microsoft Authenticator para obtener el código de verificación.
              </p>
            </div>
          </AppleCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}