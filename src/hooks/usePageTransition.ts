import { useState, useEffect } from 'react';

export function usePageTransition() {
  const [isLoading, setIsLoading] = useState(false);
  const [previousTab, setPreviousTab] = useState<string | null>(null);

  const startTransition = (fromTab: string, toTab: string) => {
    setPreviousTab(fromTab);
    setIsLoading(true);
    
    // Simular un pequeño delay para transición suave
    setTimeout(() => {
      setIsLoading(false);
    }, 150);
  };

  return {
    isLoading,
    previousTab,
    startTransition,
  };
}

export function useGlobalLoading() {
  const [globalLoading, setGlobalLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Cargando...');

  const startLoading = (message?: string) => {
    if (message) setLoadingMessage(message);
    setGlobalLoading(true);
  };

  const stopLoading = () => {
    setGlobalLoading(false);
  };

  return {
    globalLoading,
    loadingMessage,
    startLoading,
    stopLoading,
  };
}