'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Shield, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AppleButton } from '@/components/ui/AppleButton';
import { AppleInput } from '@/components/ui/AppleInput';
import { AppleCard } from '@/components/ui/AppleCard';

export default function AppleLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [showDemo, setShowDemo] = useState(false);
  
  const { login, isLoading, error, clearError } = useAuth();
  const router = useRouter();

  // Real-time email validation
  const validateEmail = (email: string) => {
    if (!email) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Formato de correo electrónico inválido';
    }
    // Ecuador institutional domains validation
    const ecuadorianDomains = ['.gob.ec', '.edu.ec', '.com.ec', '.mil.ec'];
    const hasEcuadorianDomain = ecuadorianDomains.some(domain => email.includes(domain));
    if (!hasEcuadorianDomain) {
      return 'Se recomienda usar un dominio institucional ecuatoriano';
    }
    return '';
  };

  // Real-time password validation
  const validatePassword = (password: string) => {
    if (!password) return '';
    if (password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    return '';
  };

  // Handle input changes with validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    const emailError = validateEmail(value);
    setErrors(prev => ({ ...prev, email: emailError }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    const passwordError = validatePassword(value);
    setErrors(prev => ({ ...prev, password: passwordError }));
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    // Final validation
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      return;
    }

    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      setErrors({ general: 'Credenciales incorrectas. Verifique su correo y contraseña.' });
    }
  };

  // Auto-fill demo credentials
  const fillDemoCredentials = () => {
    setEmail('admin@arconel.gob.ec');
    setPassword('Admin123@');
    setErrors({});
    setShowDemo(false);
  };

  const isFormValid = email && password && !errors.email && !errors.password;

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
            className="w-12 h-12 mx-auto mb-4 bg-apple-blue rounded-apple-lg flex items-center justify-center"
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

        {/* Demo Credentials Toggle */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <button
            type="button"
            onClick={() => setShowDemo(!showDemo)}
            className="w-full p-3 bg-apple-gray-100/60 hover:bg-apple-gray-100 rounded-apple text-apple-sm text-apple-text-secondary font-apple-medium apple-transition text-left"
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
                  <AppleButton
                    variant="ghost"
                    size="sm"
                    onClick={fillDemoCredentials}
                  >
                    Usar
                  </AppleButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {(error || errors.general) && (
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
                  {error || errors.general}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <AppleInput
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="correo@institucion.gob.ec"
              label="Correo Electrónico Institucional"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email}
              floatingLabel
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <AppleInput
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Su contraseña segura"
              label="Contraseña"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password}
              isPassword
              floatingLabel
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <AppleButton
              type="submit"
              variant="energy"
              size="lg"
              fullWidth
              isLoading={isLoading}
              disabled={!isFormValid || isLoading}
              rightIcon={!isLoading && <ArrowRight className="w-4 h-4" />}
              loadingText="Verificando credenciales..."
            >
              Ingresar a SISDAT-forecast
            </AppleButton>
          </motion.div>
        </form>

        {/* Security Note */}
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
        </motion.div>
      </AppleCard>
    </motion.div>
  );
}