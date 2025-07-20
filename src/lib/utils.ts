import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number, decimals: number = 1): string {
  return value.toFixed(decimals);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('es-EC', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'operativo':
      return 'bg-green-100 text-green-800';
    case 'mantenimiento':
      return 'bg-yellow-100 text-yellow-800';
    case 'error':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
}