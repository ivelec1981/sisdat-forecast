'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle, CheckCircle, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface LoginFormProps {
  variant?: 'default' | 'glassmorphism';
}

export default function LoginForm({ variant = 'default' }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isValidating, setIsValidating] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  
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
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Debe incluir al menos una letra minúscula';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Debe incluir al menos una letra mayúscula';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Debe incluir al menos un número';
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return 'Debe incluir al menos un carácter especial (@$!%*?&)';
    }
    return '';
  };

  // Handle input changes with validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setIsValidating(true);
    
    setTimeout(() => {
      setErrors(prev => ({ ...prev, email: validateEmail(value) }));
      setIsValidating(false);
    }, 300);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setIsValidating(true);
    
    setTimeout(() => {
      setErrors(prev => ({ ...prev, password: validatePassword(value) }));
      setIsValidating(false);
    }, 300);
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
  };

  const isFormValid = email && password && !errors.email && !errors.password;
  const isGlass = variant === 'glassmorphism';

  return (
    <motion.div 
      className={`w-full max-w-md space-y-8 ${
        isGlass 
          ? 'bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl' 
          : 'bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-700'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Header */}
      <motion.div 
        className="text-center space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <motion.div
          className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center ${
            isGlass 
              ? 'bg-white/20 backdrop-blur-md border border-white/30' 
              : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg'
          }`}
          whileHover={{ rotate: 5, scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <Shield className={`w-8 h-8 ${isGlass ? 'text-white' : 'text-white'}`} />
        </motion.div>
        
        <h1 className={`text-2xl font-bold ${
          isGlass ? 'text-white' : 'text-slate-900 dark:text-slate-100'
        }`}>
          Acceso Seguro
        </h1>
        
        <p className={`text-sm ${
          isGlass 
            ? 'text-white/80' 
            : 'text-slate-600 dark:text-slate-400'
        }`}>
          Ingrese sus credenciales institucionales para acceder a SISDAT-forecast
        </p>
      </motion.div>

      {/* Demo Credentials Banner */}
      <motion.div 
        className={`p-4 rounded-xl border ${
          isGlass 
            ? 'bg-yellow-400/20 border-yellow-400/30 backdrop-blur-sm' 
            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
        }`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xs font-medium ${
              isGlass ? 'text-yellow-100' : 'text-yellow-800 dark:text-yellow-200'
            }`}>
              Credenciales de Demostración
            </p>
            <p className={`text-xs ${
              isGlass ? 'text-yellow-200' : 'text-yellow-700 dark:text-yellow-300'
            }`}>
              admin@arconel.gob.ec / Admin123@
            </p>
          </div>
          <Button
            variant={isGlass ? "glassmorphism" : "outline"}
            size="sm"
            onClick={fillDemoCredentials}
            className="text-xs"
          >
            Usar Demo
          </Button>
        </div>
      </motion.div>

      {/* Error Message */}
      {(error || errors.general) && (
        <motion.div 
          className={`p-4 rounded-xl border flex items-start gap-3 ${
            isGlass 
              ? 'bg-red-500/20 border-red-400/30 backdrop-blur-sm' 
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AlertCircle className={`w-5 h-5 mt-0.5 ${
            isGlass ? 'text-red-200' : 'text-red-600 dark:text-red-400'
          }`} />
          <div>
            <p className={`text-sm font-medium ${
              isGlass ? 'text-red-100' : 'text-red-800 dark:text-red-200'
            }`}>
              Error de Autenticación
            </p>
            <p className={`text-xs ${
              isGlass ? 'text-red-200' : 'text-red-700 dark:text-red-300'
            }`}>
              {error || errors.general}
            </p>
          </div>
        </motion.div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="correo@institucion.gob.ec"
            label="Correo Electrónico Institucional"
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            variant={isGlass ? "glassmorphism" : "default"}
            error={errors.email}
            floatingLabel
            required
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Su contraseña segura"
            label="Contraseña"
            leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
            variant={isGlass ? "glassmorphism" : "default"}
            error={errors.password}
            isPassword
            floatingLabel
            required
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Button
            type="submit"
            variant={isGlass ? "glassmorphism" : "ecuador"}
            size="lg"
            fullWidth
            isLoading={isLoading}
            disabled={!isFormValid || isLoading}
            rightIcon={!isLoading && <ArrowRight className="w-4 h-4" />}
            animationVariant="glow"
          >
            {isLoading ? 'Verificando credenciales...' : 'Ingresar a SISDAT-forecast'}
          </Button>
        </motion.div>
      </form>

      {/* Security Note */}
      <motion.div 
        className={`text-center pt-4 border-t ${
          isGlass 
            ? 'border-white/20 text-white/60' 
            : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <p className="text-xs flex items-center justify-center gap-2">
          <Shield className="w-3 h-3" />
          Acceso seguro garantizado - Plataforma oficial del Gobierno del Ecuador
        </p>
      </motion.div>
    </motion.div>
  );
}