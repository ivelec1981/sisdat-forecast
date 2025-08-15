import { useState, useEffect } from 'react';

interface ModelConfig {
  id: number;
  name: string;
  displayName: string;
  isActive: boolean;
  accuracy: number | null;
  lastTrained: string | null;
  description: string | null;
}

interface ModelMetrics {
  modelConfigs: ModelConfig[];
  energyRecordsAccuracy: Array<{
    model: string;
    _avg: { accuracy: number | null };
    _count: { accuracy: number };
  }>;
  realTimeAccuracy: Record<string, {
    predictions: number[];
    totalCount: number;
    avgAccuracy: number;
  }>;
  predictionHistory: Array<{
    id: number;
    model: string;
    category: string;
    targetYear: number;
    predictedValue: number;
    actualValue: number | null;
    accuracy: number | null;
    predictionDate: string;
  }>;
}

export function useModelMetrics(model?: string, category?: string) {
  const [data, setData] = useState<ModelMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (model) params.append('model', model);
        if (category) params.append('category', category);
        
        const response = await fetch(`/api/model-metrics?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Error al obtener métricas de modelos');
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

    fetchMetrics();
  }, [model, category]);

  return { data, loading, error, refetch: () => fetchMetrics() };
}