import { useState, useEffect, useMemo } from 'react';

// Tipos para la API response
interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  error?: string;
}

interface Company {
  id: number;
  name: string;
  code: string;
  region: string;
  population?: number;
  area?: number;
}

interface EnergyRecord {
  id: number;
  companyId: number;
  category: string;
  year: number;
  month?: number;
  model: string;
  energy: number;
  accuracy?: number;
  company: Company;
  createdAt: string;
  updatedAt: string;
}

interface TransmissionStation {
  id: number;
  companyId: number;
  name: string;
  lat: number;
  lng: number;
  voltage: number;
  demand: number;
  maxDemand: number;
  stationType: string;
  status: string;
  sector: string;
  tariff: string;
  yearsRange: string;
  company: Company;
}

// Hook para obtener empresas
export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/companies');
        const result: ApiResponse<Company[]> = await response.json();
        
        if (result.success) {
          setCompanies(result.data);
        } else {
          setError(result.error || 'Error fetching companies');
        }
      } catch (err) {
        setError('Network error fetching companies');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  return { companies, loading, error };
}

// Hook para obtener datos energéticos
export function useEnergyData(filters: {
  companyId?: number;
  category?: string;
  year?: number;
  model?: string;
} = {}) {
  const [energyData, setEnergyData] = useState<EnergyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnergyData = async () => {
      setLoading(true);
      try {
        const searchParams = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString());
          }
        });

        const response = await fetch(`/api/energy-data?${searchParams}`);
        const result: ApiResponse<EnergyRecord[]> = await response.json();
        
        if (result.success) {
          setEnergyData(result.data);
        } else {
          setError(result.error || 'Error fetching energy data');
        }
      } catch (err) {
        setError('Network error fetching energy data');
      } finally {
        setLoading(false);
      }
    };

    fetchEnergyData();
  }, [filters.companyId, filters.category, filters.year, filters.model]);

  return { energyData, loading, error };
}

// Hook para obtener estaciones de transmisión
export function useTransmissionStations(companyId?: number) {
  const [stations, setStations] = useState<TransmissionStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const url = companyId 
          ? `/api/transmission-stations?companyId=${companyId}`
          : '/api/transmission-stations';
        
        const response = await fetch(url);
        const result: ApiResponse<TransmissionStation[]> = await response.json();
        
        if (result.success) {
          setStations(result.data);
        } else {
          setError(result.error || 'Error fetching transmission stations');
        }
      } catch (err) {
        setError('Network error fetching transmission stations');
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, [companyId]);

  return { stations, loading, error };
}

// Hook combinado con datos procesados para gráficos
export function useProcessedProjectionData(companyId?: number, category?: string) {
  const { energyData, loading, error } = useEnergyData({ companyId, category });

  const processedData = useMemo(() => {
    if (!energyData.length) return { historical: [], predictions: [], modelComparison: [] };

    // Separar datos históricos y predicciones
    const historical = energyData
      .filter(record => record.model === 'hist')
      .map(record => ({
        year: record.year,
        value: record.energy,
        type: 'historical' as const
      }))
      .sort((a, b) => a.year - b.year);

    const predictions = energyData
      .filter(record => record.model !== 'hist')
      .map(record => ({
        year: record.year,
        value: record.energy,
        model: record.model,
        type: 'prediction' as const
      }))
      .sort((a, b) => a.year - b.year);

    // Comparación de modelos para el año más reciente de predicciones
    const latestYear = Math.max(...predictions.map(p => p.year));
    const modelComparison = energyData
      .filter(record => record.year === latestYear && record.model !== 'hist')
      .map(record => ({
        modelo: record.model,
        value: record.energy,
        accuracy: record.accuracy || 0
      }));

    return {
      historical,
      predictions,
      modelComparison
    };
  }, [energyData]);

  return {
    ...processedData,
    loading,
    error,
    rawData: energyData
  };
}