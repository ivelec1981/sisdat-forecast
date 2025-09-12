import { useCallback } from 'react';
import * as Sentry from '@sentry/nextjs';

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  additional?: Record<string, any>;
}

interface UseErrorReportingReturn {
  reportError: (error: Error, context?: ErrorContext) => string;
  reportMessage: (message: string, level?: 'info' | 'warning' | 'error', context?: ErrorContext) => void;
  setUserContext: (user: { id: string; email?: string; name?: string }) => void;
  addBreadcrumb: (message: string, category?: string, data?: Record<string, any>) => void;
}

export function useErrorReporting(): UseErrorReportingReturn {
  const reportError = useCallback((error: Error, context?: ErrorContext): string => {
    return Sentry.captureException(error, {
      tags: {
        component: context?.component,
        action: context?.action,
      },
      user: context?.userId ? { id: context.userId } : undefined,
      extra: context?.additional,
    });
  }, []);

  const reportMessage = useCallback((
    message: string, 
    level: 'info' | 'warning' | 'error' = 'info',
    context?: ErrorContext
  ) => {
    Sentry.captureMessage(message, {
      level: level,
      tags: {
        component: context?.component,
        action: context?.action,
      },
      user: context?.userId ? { id: context.userId } : undefined,
      extra: context?.additional,
    });
  }, []);

  const setUserContext = useCallback((user: { id: string; email?: string; name?: string }) => {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
    });
  }, []);

  const addBreadcrumb = useCallback((
    message: string, 
    category: string = 'user-action',
    data?: Record<string, any>
  ) => {
    Sentry.addBreadcrumb({
      message,
      category,
      level: 'info',
      data,
      timestamp: Date.now() / 1000,
    });
  }, []);

  return {
    reportError,
    reportMessage,
    setUserContext,
    addBreadcrumb,
  };
}