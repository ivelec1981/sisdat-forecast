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

// Secure login validation schema
export const secureLoginSchema = z.object({
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
        message: 'Debe utilizar un correo institucional ecuatoriano (.gob.ec, .edu.ec, etc.)'
      }
    )
    .refine(
      (email) => {
        // Additional security: check for common attack patterns
        const suspiciousPatterns = [
          /\+.*@/,  // Plus addressing
          /\.{2,}/, // Multiple consecutive dots
          /[<>]/,   // Angle brackets
        ];
        return !suspiciousPatterns.some(pattern => pattern.test(email));
      },
      {
        message: 'Formato de correo electrónico no válido'
      }
    ),
  
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña no puede exceder 128 caracteres')
    .refine(
      (password) => {
        // Comprehensive password security checks
        const hasLowercase = /[a-z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        return hasLowercase && hasUppercase && hasNumbers && hasSpecialChars;
      },
      {
        message: 'La contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número y 1 símbolo especial'
      }
    )
    .refine(
      (password) => {
        // Check for common weak patterns
        const commonPatterns = [
          /(.)\1{3,}/,        // 4+ repeated characters
          /123456|654321/,    // Sequential numbers
          /qwerty|asdfgh/,    // Keyboard patterns
          /password|admin/i,  // Common words
        ];
        return !commonPatterns.some(pattern => pattern.test(password));
      },
      {
        message: 'La contraseña no puede contener patrones comunes o repetitivos'
      }
    ),
});

// Multi-Factor Authentication validation schema
export const mfaVerificationSchema = z.object({
  code: z
    .string()
    .min(6, 'El código debe tener 6 dígitos')
    .max(6, 'El código debe tener 6 dígitos')
    .regex(/^\d{6}$/, 'El código debe contener solo números'),
    
  sessionToken: z
    .string()
    .min(1, 'Token de sesión requerido')
    .max(256, 'Token de sesión inválido'),
});

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Formato de correo electrónico inválido')
    .refine(
      (email) => ECUADORIAN_DOMAINS.some(domain => email.toLowerCase().includes(domain)),
      { message: 'Debe utilizar un correo institucional ecuatoriano' }
    ),
});

// Type exports
export type SecureLoginFormData = z.infer<typeof secureLoginSchema>;
export type MFAVerificationFormData = z.infer<typeof mfaVerificationSchema>;
export type PasswordResetRequestFormData = z.infer<typeof passwordResetRequestSchema>;

// Validation helpers
export const validateEcuadorianEmail = (email: string): boolean => {
  return ECUADORIAN_DOMAINS.some(domain => email.toLowerCase().includes(domain));
};

export const sanitizeInput = (input: string): string => {
  // Remove potential XSS vectors
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

export const validateSessionToken = (token: string): boolean => {
  // Basic session token validation
  if (!token || token.length < 10 || token.length > 256) {
    return false;
  }
  
  // Check for valid characters (alphanumeric and specific symbols)
  const validTokenPattern = /^[a-zA-Z0-9_-]+$/;
  return validTokenPattern.test(token);
};

// Rate limiting helper (for client-side tracking)
export class ClientRateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < this.windowMs);
    
    // Update the attempts list
    this.attempts.set(identifier, validAttempts);
    
    return validAttempts.length < this.maxAttempts;
  }

  recordAttempt(identifier: string): void {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    attempts.push(now);
    this.attempts.set(identifier, attempts);
  }

  getRemainingAttempts(identifier: string): number {
    const attempts = this.attempts.get(identifier) || [];
    const validAttempts = attempts.filter(time => Date.now() - time < this.windowMs);
    return Math.max(0, this.maxAttempts - validAttempts.length);
  }

  getTimeUntilReset(identifier: string): number {
    const attempts = this.attempts.get(identifier) || [];
    if (attempts.length === 0) return 0;
    
    const oldestAttempt = Math.min(...attempts);
    const resetTime = oldestAttempt + this.windowMs;
    return Math.max(0, resetTime - Date.now());
  }
}