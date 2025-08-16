import { useState, useEffect } from 'react';

interface TrendData {
  historicalCutoffDate: string;
  monthlyTrends: {
    historical: Array<{
      year: number;
      month: number;
      value: number;
      type: 'historical';
    }>;
    projected: Array<{
      year: number;
      month: number;
      model: string;
      value: number;
      type: 'projected';
    }>;
  };
  annualTrends: {
    historical: Array<{
      year: number;
      value: number;
      type: 'historical';
    }>;
    projected: Array<{
      year: number;
      model: string;
      value: number;
      type: 'projected';
    }>;
  };
  last12Months: Array<{
    year: number;
    month: number;
    date: string;
    value: number;
    type: 'historical' | 'projected';
    model?: string;
  }>;
  category: string;
  type: string;
}

export function useTrends(category?: string, type?: string) {
  const [data, setData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (type) params.append('type', type);
        
        const response = await fetch(`/api/trends?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Error al obtener tendencias');
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

    fetchTrends();
  }, [category, type]);

  return { data, loading, error, refetch: () => fetchTrends() };
}