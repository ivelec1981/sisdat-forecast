import { useState, useEffect } from 'react';

interface SectorDataItem {
  category: string;
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface SectorData {
  type: string;
  unit: string;
  historicalYear: number;
  projectedYear: number;
  historical: SectorDataItem[];
  projected: SectorDataItem[];
}

export function useSectorData(type: 'energy' | 'power' = 'energy') {
  const [data, setData] = useState<SectorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSectorData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/sector-data?type=${type}`);
        
        if (!response.ok) {
          throw new Error('Error al obtener datos por sector');
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

    fetchSectorData();
  }, [type]);

  return { data, loading, error };
}