import { useState, useEffect } from 'react';

interface DashboardMetrics {
  summary: {
    totalCompanies: number;
    totalStations: number;
    stationsInMaintenance: number;
    lastUpdate: string;
  };
  recentEnergyData: Array<{
    id: number;
    companyId: number;
    category: string;
    year: number;
    month: number | null;
    model: string;
    energy: number;
    accuracy: number | null;
    company: {
      name: string;
      region: string;
    };
  }>;
  residentialData: Array<{
    id: number;
    powerCompany: string;
    date: string;
    enerComb: number | null;
    enerProphet: number | null;
    enerGru: number | null;
    enerWavenet: number | null;
    enerGbr: number | null;
    potComb: number | null;
    potProphet: number | null;
    potGru: number | null;
    potWavenet: number | null;
    potGbr: number | null;
  }>;
  monthlyTrends: Array<{
    month: number;
    model: string;
    _sum: { energy: number | null };
  }>;
  sectorData: Array<{
    category: string;
    model: string;
    _sum: { energy: number | null };
    _avg: { accuracy: number | null };
  }>;
}

export function useDashboardMetrics() {
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard-metrics');
        
        if (!response.ok) {
          throw new Error('Error al obtener métricas del dashboard');
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
    
    // Actualizar cada 5 minutos
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error, refetch: () => fetchMetrics() };
}