'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SisdatForecastDashboard from '@/components/dashboard/SisdatDashboard';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Verificar si el usuario está autenticado
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return null; // Se redirigirá al login
  }

  return <SisdatForecastDashboard />;
}