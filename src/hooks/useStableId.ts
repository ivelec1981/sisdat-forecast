'use client';

import { useId } from 'react';

/**
 * Hook que genera un ID estable que no cambia entre servidor y cliente
 * Resuelve problemas de hidratación de React
 */
export function useStableId(prefix?: string): string {
  const reactId = useId();
  
  // El useId de React ya es estable entre servidor y cliente
  // Solo necesitamos añadir un prefijo si se proporciona
  return prefix ? `${prefix}${reactId}` : reactId;
}