import { useState, useEffect } from 'react';

export interface IndustrialDataPoint {
  date: string;
  year: number;
  month: number;
  company: string;
  type: string;
  energy: {
    comb: number | null;
    prophet: number | null;
    gru: number | null;
    wavenet: number | null;
    gbr: number | null;
  };
  power: {
    comb: number | null;
    prophet: number | null;
    gbr: number | null;
    gru: number | null;
    wavenet: number | null;
  };
}

export interface IndustrialSummary {
  totalRecords: number;
  averageEnergy: number;
  averagePower: number;
  dateRange: {
    start: string;
    end: string;
  };
  companies: Array<{
    name: string;
    recordCount: number;
  }>;
}

export interface YearlyTrend {
  year: number;
  totalEnergy: number;
  avgPower: number;
  recordCount: number;
}

export interface UseIndustrialDataResult {
  data: IndustrialDataPoint[];
  summary: IndustrialSummary | null;
  yearlyTrends: YearlyTrend[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useIndustrialData(
  company?: string,
  startDate?: string,
  endDate?: string,
  limit?: number
): UseIndustrialDataResult {
  const [data, setData] = useState<IndustrialDataPoint[]>([]);
  const [summary, setSummary] = useState<IndustrialSummary | null>(null);
  const [yearlyTrends, setYearlyTrends] = useState<YearlyTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      if (company) params.append('company', company);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (limit) params.append('limit', limit.toString());

      const response = await fetch(`/api/industrial-data?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error fetching industrial data');
      }

      setData(result.data || []);
      setSummary(result.summary || null);
      setYearlyTrends(result.yearlyTrends || []);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching industrial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [company, startDate, endDate, limit]);

  const refetch = () => {
    fetchData();
  };

  return {
    data,
    summary,
    yearlyTrends,
    loading,
    error,
    refetch
  };
}