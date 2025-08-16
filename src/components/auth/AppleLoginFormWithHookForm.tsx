'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Shield, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AppleButton } from '@/components/ui/AppleButton';
import { AppleInput } from '@/components/ui/AppleInput';
import { AppleCard } from '@/components/ui/AppleCard';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';

export default function AppleLoginFormWithHookForm() {
  const [showDemo, setShowDemo] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid, isSubmitting, touchedFields },
    reset,
    clearErrors,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const watchedEmail = watch('email');
  const watchedPassword = watch('password');

  // Real-time validation feedback
  const getFieldStatus = (fieldName: keyof LoginFormData) => {
    const hasError = !!errors[fieldName];
    const isTouched = !!touchedFields[fieldName];
    const hasValue = fieldName === 'email' ? !!watchedEmail : !!watchedPassword;
    
    if (hasError) return 'error';
    if (isTouched && hasValue && !hasError) return 'success';
    return 'default';
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await login(data.email, data.password);
      
      // Success animation before redirect
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
      
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  // Auto-fill demo credentials with smooth animation
  const fillDemoCredentials = () => {
    clearErrors();
    
    // Animate the fill process
    setValue('email', 'admin@arconel.gob.ec', { 
      shouldValidate: true, 
      shouldTouch: true 
    });
    
    setTimeout(() => {
      setValue('password', 'Admin123@', { 
        shouldValidate: true, 
        shouldTouch: true 
      });
    }, 200);
    
    setShowDemo(false);
  };

  const clearForm = () => {
    reset();
    clearError();
    clearErrors();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      <AppleCard variant="glass" padding="xl" className="relative">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.div
            className="w-12 h-12 mx-auto mb-4 bg-sisdat-blue-primary rounded-apple-lg flex items-center justify-center"
            whileHover={{ 
              scale: 1.05, 
              rotate: 5,
              transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
            }}
          >
            <Shield className="w-6 h-6 text-white" />
          </motion.div>
          
          <h1 className="text-apple-2xl font-apple-semibold text-apple-text-primary mb-2 tracking-tight">
            Acceso Seguro
          </h1>
          
          <p className="text-apple-base text-apple-text-secondary font-apple-regular">
            Ingrese sus credenciales institucionales
          </p>
        </motion.div>

        {/* Demo Credentials Section */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <button
            type="button"
            onClick={() => setShowDemo(!showDemo)}
            className="w-full p-3 bg-sisdat-blue-light/10 hover:bg-sisdat-blue-light/20 rounded-apple text-apple-sm text-sisdat-blue-primary font-apple-medium apple-transition text-left"
          >
            <div className="flex items-center justify-between">
              <span>Credenciales de demostración</span>
              <motion.div
                animate={{ rotate: showDemo ? 180 : 0 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </div>
          </button>
          
          <AnimatePresence>
            {showDemo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className="mt-3 p-3 bg-apple-white rounded-apple border border-apple-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-apple-sm font-apple-medium text-apple-text-primary">
                      admin@arconel.gob.ec
                    </p>
                    <p className="text-apple-xs text-apple-text-tertiary">
                      Admin123@
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <AppleButton
                      variant="ghost"
                      size="sm"
                      onClick={clearForm}
                    >
                      Limpiar
                    </AppleButton>
                    <AppleButton
                      variant="ghost"
                      size="sm"
                      onClick={fillDemoCredentials}
                    >
                      Usar
                    </AppleButton>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="mb-6 p-3 bg-apple-red/5 border border-apple-red/20 rounded-apple flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 mt-0.5 text-apple-red flex-shrink-0" />
              <div>
                <p className="text-apple-sm font-apple-medium text-apple-red">
                  Error de Autenticación
                </p>
                <p className="text-apple-xs text-apple-red/80">
                  {error}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login Form */}
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
              placeholder="correo@institucion.gob.ec"
              label="Correo Electrónico Institucional"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              success={getFieldStatus('email') === 'success' ? 'Correo válido' : undefined}
              variant={getFieldStatus('email')}
              floatingLabel
              autoComplete="email"
              spellCheck={false}
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
              placeholder="Su contraseña segura"
              label="Contraseña"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              success={getFieldStatus('password') === 'success' ? 'Contraseña válida' : undefined}
              variant={getFieldStatus('password')}
              isPassword
              floatingLabel
              autoComplete="current-password"
            />
          </motion.div>

          {/* Remember Me */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="flex items-center justify-between"
          >
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                {...register('rememberMe')}
                type="checkbox"
                className="w-4 h-4 text-apple-blue bg-apple-gray-100 border-apple-gray-300 rounded focus:ring-apple-blue/20 focus:ring-2 apple-transition"
              />
              <span className="text-apple-sm text-apple-text-secondary font-apple-regular">
                Recordar sesión
              </span>
            </label>
            
            <button
              type="button"
              className="text-apple-sm text-apple-blue hover:text-apple-blue/80 font-apple-medium apple-transition"
            >
              ¿Olvidó su contraseña?
            </button>
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
              isLoading={isLoading || isSubmitting}
              disabled={!isValid || isLoading || isSubmitting}
              rightIcon={!isLoading && !isSubmitting && <ArrowRight className="w-4 h-4" />}
              loadingText="Verificando credenciales..."
            >
              Ingresar a SISDAT-forecast
            </AppleButton>
          </motion.div>

          {/* Form Validation Status */}
          {Object.keys(touchedFields).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.3 }}
              className="flex items-center justify-center gap-2 text-apple-xs"
            >
              {isValid ? (
                <>
                  <CheckCircle className="w-3 h-3 text-apple-green" />
                  <span className="text-apple-green font-apple-medium">
                    Formulario válido
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 text-apple-orange" />
                  <span className="text-apple-orange font-apple-medium">
                    Complete los campos requeridos
                  </span>
                </>
              )}
            </motion.div>
          )}
        </form>

        {/* Security Note */}
        <motion.div 
          className="text-center pt-6 mt-6 border-t border-apple-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <p className="text-apple-xs text-apple-text-tertiary font-apple-regular flex items-center justify-center gap-2">
            <Shield className="w-3 h-3" />
            Plataforma oficial del Gobierno del Ecuador
          </p>
        </motion.div>
      </AppleCard>
    </motion.div>
  );
}