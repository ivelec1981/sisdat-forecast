import { useState, useEffect } from 'react';

interface SystemInfo {
  historicalCutoffDate: string;
  currentDate: string;
  mlModels: Array<{
    name: string;
    displayName: string;
  }>;
  categories: Array<{
    code: string;
    name: string;
  }>;
}

export function useSystemInfo() {
  const [data, setData] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSystemInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/system-info');
        
        if (!response.ok) {
          throw new Error('Error al obtener información del sistema');
        }
        
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSystemInfo();
  }, []);

  return { data, loading, error };
}