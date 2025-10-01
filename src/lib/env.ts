import { z } from 'zod';

/**
 * Environment Variables Validation
 * Ensures all required environment variables are present and valid
 */

// Define schema for server-side environment variables
const serverSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

  // Authentication
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters').optional(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters').optional(),

  // Sentry
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_ENVIRONMENT: z.enum(['development', 'staging', 'production']).optional(),

  // External APIs
  ARCONEL_API_KEY: z.string().optional(),

  // Email (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().optional(),

  // Redis (optional)
  REDIS_URL: z.string().url().optional(),

  // Security
  RECAPTCHA_SECRET_KEY: z.string().optional(),

  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Define schema for client-side environment variables (NEXT_PUBLIC_*)
const clientSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default('SISDAT Forecast'),
  NEXT_PUBLIC_APP_VERSION: z.string().default('2.1.0'),
  NEXT_PUBLIC_COMPANY: z.string().default('ARCONEL'),
  NEXT_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']).optional(),

  NEXT_PUBLIC_API_BASE_URL: z.string().url('API_BASE_URL must be a valid URL').optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),

  // Map configuration
  NEXT_PUBLIC_DEFAULT_MAP_CENTER_LAT: z.string().default('-1.8312'),
  NEXT_PUBLIC_DEFAULT_MAP_CENTER_LNG: z.string().default('-78.1834'),
  NEXT_PUBLIC_DEFAULT_MAP_ZOOM: z.string().default('6'),

  // Analytics
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),

  // Sentry
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),

  // reCAPTCHA
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: z.string().optional(),
});

// Type for validated environment variables
export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;

/**
 * Validate and parse environment variables
 * Throws error if validation fails
 */
function validateEnv() {
  // Only validate server-side env on server
  const isServer = typeof window === 'undefined';

  if (isServer) {
    try {
      serverSchema.parse(process.env);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const zodError = error as z.ZodError;
        const errorMessages = zodError.issues.map(
          (err) => `${err.path.join('.')}: ${err.message}`
        );
        throw new Error(
          `❌ Invalid environment variables:\n${errorMessages.join('\n')}`
        );
      }
      throw error;
    }
  }

  // Validate client-side env
  try {
    clientSchema.parse({
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
      NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
      NEXT_PUBLIC_COMPANY: process.env.NEXT_PUBLIC_COMPANY,
      NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NEXT_PUBLIC_DEFAULT_MAP_CENTER_LAT: process.env.NEXT_PUBLIC_DEFAULT_MAP_CENTER_LAT,
      NEXT_PUBLIC_DEFAULT_MAP_CENTER_LNG: process.env.NEXT_PUBLIC_DEFAULT_MAP_CENTER_LNG,
      NEXT_PUBLIC_DEFAULT_MAP_ZOOM: process.env.NEXT_PUBLIC_DEFAULT_MAP_ZOOM,
      NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
      NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError = error as z.ZodError;
      const errorMessages = zodError.issues.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      );
      console.warn(
        `⚠️  Invalid public environment variables:\n${errorMessages.join('\n')}`
      );
    }
  }
}

// Run validation
if (process.env.NODE_ENV !== 'test') {
  validateEnv();
}

/**
 * Type-safe environment variables
 * Use these instead of process.env directly
 */
export const env = {
  // Server-only
  server: {
    DATABASE_URL: process.env.DATABASE_URL!,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
    SESSION_SECRET: process.env.SESSION_SECRET,
    JWT_SECRET: process.env.JWT_SECRET,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT,
    ARCONEL_API_KEY: process.env.ARCONEL_API_KEY,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    SMTP_FROM: process.env.SMTP_FROM,
    REDIS_URL: process.env.REDIS_URL,
    RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,
    NODE_ENV: process.env.NODE_ENV as 'development' | 'production' | 'test',
  },

  // Client-safe (can be used in browser)
  client: {
    APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'SISDAT Forecast',
    APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '2.1.0',
    COMPANY: process.env.NEXT_PUBLIC_COMPANY || 'ARCONEL',
    APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    MAP_CENTER_LAT: process.env.NEXT_PUBLIC_DEFAULT_MAP_CENTER_LAT || '-1.8312',
    MAP_CENTER_LNG: process.env.NEXT_PUBLIC_DEFAULT_MAP_CENTER_LNG || '-78.1834',
    MAP_ZOOM: process.env.NEXT_PUBLIC_DEFAULT_MAP_ZOOM || '6',
    GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
  },
};

/**
 * Check if running in production
 */
export const isProd = process.env.NODE_ENV === 'production';

/**
 * Check if running in development
 */
export const isDev = process.env.NODE_ENV === 'development';

/**
 * Check if running in test environment
 */
export const isTest = process.env.NODE_ENV === 'test';

/**
 * Get current environment name
 */
export const getEnvironment = (): 'development' | 'staging' | 'production' => {
  return (process.env.NEXT_PUBLIC_APP_ENV as any) || (isProd ? 'production' : 'development');
};
