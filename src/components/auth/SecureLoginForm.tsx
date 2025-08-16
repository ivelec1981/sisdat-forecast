'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, AlertCircle, Loader2, Shield } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import { AppleButton } from '@/components/ui/AppleButton';
import { AppleInput } from '@/components/ui/AppleInput';
import { AppleCard } from '@/components/ui/AppleCard';
import { secureLoginSchema, type SecureLoginFormData } from '@/lib/validations/secureAuth';

interface SecureLoginFormProps {
  onMFARequired?: (sessionToken: string) => void;
  institutionalLogo?: React.ComponentType<{ className?: string }>;
}

export default function SecureLoginForm({ 
  onMFARequired,
  institutionalLogo: InstitutionalLogo 
}: SecureLoginFormProps) {
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showRecaptcha, setShowRecaptcha] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    reset,
  } = useForm<SecureLoginFormData>({
    resolver: zodResolver(secureLoginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Handle reCAPTCHA verification
  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

  // Simulate secure authentication API call
  const authenticateUser = async (credentials: SecureLoginFormData): Promise<{
    success: boolean;
    requiresMFA?: boolean;
    sessionToken?: string;
    error?: string;
  }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Valid test credentials that meet security requirements
    const validCredentials = [
      {
        email: 'admin@arconel.gob.ec',
        password: 'Arconel2025!#$' // Meets all requirements: uppercase, lowercase, numbers, special chars, no patterns
      },
      {
        email: 'director@mem.gob.ec', 
        password: 'MinEnergia2025@!'
      },
      {
        email: 'operador@celec.gob.ec',
        password: 'Celec2025$%&'
      },
      {
        email: 'analista@cenace.gob.ec',
        password: 'Cenace2025*()!'
      }
    ];

    // Check if credentials match any valid user
    const validUser = validCredentials.find(
      user => user.email.toLowerCase() === credentials.email.toLowerCase() && 
              user.password === credentials.password
    );

    if (!validUser) {
      return {
        success: false,
        error: 'Credenciales incorrectas. Verifique e intente de nuevo.'
      };
    }

    // Simulate successful first factor authentication
    return {
      success: true,
      requiresMFA: true,
      sessionToken: 'sisdat_session_' + Math.random().toString(36).substring(7) + '_' + Date.now()
    };
  };

  const onSubmit = async (data: SecureLoginFormData) => {
    try {
      setIsLoading(true);
      setAuthError(null);

      // Check if reCAPTCHA is required and verified
      if (showRecaptcha && !recaptchaToken) {
        setAuthError('Por favor complete la verificación de seguridad.');
        return;
      }

      const result = await authenticateUser(data);

      if (!result.success) {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        setAuthError(result.error || 'Error de autenticación');

        // Show reCAPTCHA after 2 failed attempts
        if (newAttempts >= 2) {
          setShowRecaptcha(true);
        }

        // Reset reCAPTCHA if shown
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
          setRecaptchaToken(null);
        }

        return;
      }

      // Successful first factor - proceed to MFA
      if (result.requiresMFA && result.sessionToken) {
        onMFARequired?.(result.sessionToken);
        return;
      }

      // Direct login (fallback)
      router.push('/dashboard');

    } catch (error) {
      console.error('Authentication error:', error);
      setAuthError('Error del sistema. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormReset = () => {
    reset();
    setAuthError(null);
    setRecaptchaToken(null);
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      <AppleCard variant="glass" padding="xl" className="relative">
        {/* Header with Institutional Branding */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.div
            className="w-16 h-16 mx-auto mb-4 bg-sisdat-blue-primary rounded-apple-lg flex items-center justify-center"
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
            }}
          >
            {InstitutionalLogo ? (
              <InstitutionalLogo className="w-10 h-10 text-white" />
            ) : (
              <div className="w-10 h-10 border-2 border-white border-dashed rounded flex items-center justify-center">
                <span className="text-white text-xs font-apple-medium">Logo</span>
              </div>
            )}
          </motion.div>
          
          <h1 className="text-apple-2xl font-apple-semibold text-apple-text-primary mb-2 tracking-tight">
            Acceso Seguro
          </h1>
          
          <p className="text-apple-base text-apple-text-secondary font-apple-regular">
            Ingrese sus credenciales institucionales
          </p>
        </motion.div>

        {/* Authentication Error Display */}
        <AnimatePresence>
          {authError && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="mb-6 p-4 bg-apple-red/5 border border-apple-red/20 rounded-apple"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 mt-0.5 text-apple-red flex-shrink-0" />
                <div>
                  <p className="text-apple-sm font-apple-medium text-apple-red">
                    Error de Autenticación
                  </p>
                  <p className="text-apple-xs text-apple-red/80 mt-1">
                    {authError}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Secure Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <AppleInput
              {...register('email')}
              type="email"
              placeholder="usuario@institucion.gob.ec"
              label="Correo Electrónico Institucional"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              floatingLabel
              autoComplete="email"
              spellCheck={false}
              aria-describedby="email-help"
              required
            />
          </motion.div>

          {/* Password Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <AppleInput
              {...register('password')}
              type="password"
              placeholder="Ingrese su contraseña"
              label="Contraseña"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              isPassword
              floatingLabel
              autoComplete="current-password"
              required
            />
          </motion.div>

          {/* reCAPTCHA Component */}
          <AnimatePresence>
            {showRecaptcha && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="flex justify-center"
              >
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"} // Test key
                  onChange={handleRecaptchaChange}
                  onExpired={() => setRecaptchaToken(null)}
                  theme="light"
                  size="normal"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Session Policy Information */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="p-3 bg-sisdat-blue-light/5 border border-sisdat-blue-light/20 rounded-apple"
          >
            <p className="text-apple-xs text-apple-text-tertiary font-apple-regular leading-relaxed">
              <Shield className="w-3 h-3 inline mr-1" />
              La sesión expirará automáticamente tras 15 minutos de inactividad por seguridad.
            </p>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <AppleButton
              type="submit"
              variant="energy"
              size="lg"
              fullWidth
              disabled={!isValid || isLoading || isSubmitting || (showRecaptcha && !recaptchaToken)}
              className="relative"
            >
              {isLoading || isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verificando credenciales...</span>
                </div>
              ) : (
                'Ingresar a SISDAT-forecast'
              )}
            </AppleButton>
          </motion.div>
        </form>

        {/* Security Footer */}
        <motion.div 
          className="text-center pt-6 mt-6 border-t border-apple-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <p className="text-apple-xs text-apple-text-tertiary font-apple-regular flex items-center justify-center gap-2">
            <Shield className="w-3 h-3" />
            Plataforma oficial del Gobierno del Ecuador
          </p>
          
          {loginAttempts > 0 && (
            <motion.p 
              className="text-apple-xs text-apple-text-tertiary mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Intentos de acceso: {loginAttempts}
            </motion.p>
          )}
        </motion.div>
      </AppleCard>
    </motion.div>
  );
}