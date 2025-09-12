'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  showReload?: boolean;
  showHome?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to Sentry
    const errorId = Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      tags: {
        section: 'error-boundary',
      },
    });

    this.setState({ errorId });

    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorId: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              ¡Oops! Algo salió mal
            </h1>
            
            <p className="text-gray-600 mb-6">
              Se ha producido un error inesperado. Nuestro equipo ha sido notificado 
              y estamos trabajando para solucionarlo.
            </p>

            {this.state.errorId && (
              <div className="bg-gray-100 rounded-md p-3 mb-6">
                <p className="text-sm text-gray-700">
                  <strong>ID del error:</strong> {this.state.errorId}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Incluye este ID al contactar soporte
                </p>
              </div>
            )}

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="bg-red-50 border border-red-200 rounded-md p-3 mb-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-red-800 mb-2">
                  Detalles del error (desarrollo)
                </summary>
                <pre className="text-xs text-red-700 whitespace-pre-wrap break-all">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleRetry}
                className="flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Intentar de nuevo
              </Button>

              {this.props.showReload !== false && (
                <Button
                  variant="outline"
                  onClick={this.handleReload}
                  className="flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Recargar página
                </Button>
              )}

              {this.props.showHome !== false && (
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Ir al inicio
                </Button>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Si el problema persiste, contacta a{' '}
                <a 
                  href="mailto:soporte@sisdat-forecast.com" 
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  soporte@sisdat-forecast.com
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;