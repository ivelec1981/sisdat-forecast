import { z } from 'zod';

// Ecuador institutional domains for validation
export const ECUADORIAN_DOMAINS = [
  '.gob.ec',
  '.edu.ec', 
  '.com.ec',
  '.mil.ec',
  '.org.ec',
  '.net.ec'
];

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Formato de correo electrónico inválido')
    .refine(
      (email) => {
        // Check if email contains any Ecuadorian domain
        return ECUADORIAN_DOMAINS.some(domain => email.toLowerCase().includes(domain));
      },
      {
        message: 'Se requiere un dominio institucional ecuatoriano (.gob.ec, .edu.ec, etc.)'
      }
    ),
  
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'La contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número y 1 símbolo'
    ),
    
  rememberMe: z.boolean().optional(),
});

// Registration validation schema
export const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras'),
    
  lastName: z
    .string()
    .min(1, 'El apellido es requerido')
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras'),
    
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Formato de correo electrónico inválido')
    .refine(
      (email) => ECUADORIAN_DOMAINS.some(domain => email.toLowerCase().includes(domain)),
      { message: 'Se requiere un dominio institucional ecuatoriano' }
    ),
    
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña no puede exceder 128 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'La contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número y 1 símbolo'
    ),
    
  confirmPassword: z.string().min(1, 'Confirme su contraseña'),
  
  institution: z
    .string()
    .min(1, 'La institución es requerida')
    .min(2, 'El nombre de la institución debe tener al menos 2 caracteres'),
    
  position: z
    .string()
    .min(1, 'El cargo es requerido')
    .min(2, 'El cargo debe tener al menos 2 caracteres'),
    
  department: z.string().optional(),
  
  phone: z
    .string()
    .optional()
    .refine(
      (phone) => !phone || /^(\+593|593|0)?[0-9]{8,9}$/.test(phone.replace(/\s|-/g, '')),
      { message: 'Formato de teléfono ecuatoriano inválido' }
    ),
    
  acceptTerms: z
    .boolean()
    .refine(val => val === true, { message: 'Debe aceptar los términos y condiciones' }),
    
  acceptPrivacy: z
    .boolean()
    .refine(val => val === true, { message: 'Debe aceptar la política de privacidad' }),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  }
);

// Password reset schema
export const passwordResetSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Formato de correo electrónico inválido')
    .refine(
      (email) => ECUADORIAN_DOMAINS.some(domain => email.toLowerCase().includes(domain)),
      { message: 'Se requiere un dominio institucional ecuatoriano' }
    ),
});

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'La contraseña actual es requerida'),
    
  newPassword: z
    .string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'La contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número y 1 símbolo'
    ),
    
  confirmNewPassword: z.string().min(1, 'Confirme la nueva contraseña'),
}).refine(
  (data) => data.newPassword === data.confirmNewPassword,
  {
    message: 'Las contraseñas no coinciden',
    path: ['confirmNewPassword'],
  }
).refine(
  (data) => data.currentPassword !== data.newPassword,
  {
    message: 'La nueva contraseña debe ser diferente a la actual',
    path: ['newPassword'],
  }
);

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type PasswordResetFormData = z.infer<typeof passwordResetSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// Validation helpers
export const validateEcuadorianEmail = (email: string): boolean => {
  return ECUADORIAN_DOMAINS.some(domain => email.toLowerCase().includes(domain));
};

export const validateEcuadorianPhone = (phone: string): boolean => {
  if (!phone) return true; // Optional field
  const cleanPhone = phone.replace(/\s|-/g, '');
  return /^(\+593|593|0)?[0-9]{8,9}$/.test(cleanPhone);
};

export const getPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
  level: 'weak' | 'fair' | 'good' | 'strong';
} => {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Debe tener al menos 8 caracteres');
  }

  if (password.length >= 12) {
    score += 1;
  }

  // Character variety checks
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Incluya letras minúsculas');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Incluya letras mayúsculas');
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Incluya números');
  }

  if (/[@$!%*?&]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Incluya símbolos (@$!%*?&)');
  }

  // Common patterns check
  if (!/(.)\1{2,}/.test(password)) {
    score += 1;
  } else {
    feedback.push('Evite repetir caracteres');
  }

  // Determine level
  let level: 'weak' | 'fair' | 'good' | 'strong';
  if (score <= 2) {
    level = 'weak';
  } else if (score <= 4) {
    level = 'fair';
  } else if (score <= 6) {
    level = 'good';
  } else {
    level = 'strong';
  }

  return { score, feedback, level };
};