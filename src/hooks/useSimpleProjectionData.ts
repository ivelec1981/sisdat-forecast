import { useMemo } from 'react';
import { energyData, CATEGORY_LABELS, MODEL_LABELS } from '@/lib/data/realProjectionData';

export interface FilterState {
  empresa: string;
  categoria: string;
  modelo: string;
}

export interface ProcessedDataPoint {
  year: number;
  value: number;
  type: 'historical' | 'prediction';
}

export interface ProcessedData {
  historical: ProcessedDataPoint[];
  predictions: ProcessedDataPoint[];
}

export interface ModelComparison {
  modelo: string;
  value: number;
  accuracy?: number;
}

export interface CategorySummary {
  categoria: string;
  label: string;
  totalPredicted: number;
  growth: number;
}

export function useSimpleProjectionData() {
  const filterOptions = useMemo(() => {
    const empresas = [...new Set(energyData.map(d => d.empresa))];
    const categorias = [...new Set(energyData.map(d => d.cat_uso))];
    const modelos = [...new Set(energyData.filter(d => d.modelo !== 'hist').map(d => d.modelo))];
    
    return { empresas, categorias, modelos };
  }, []);

  const getProcessedData = (filters: FilterState): ProcessedData => {
    const filtered = energyData.filter(
      d => d.empresa === filters.empresa && d.cat_uso === filters.categoria
    );

    if (filtered.length === 0) {
      return { historical: [], predictions: [] };
    }

    const historical: ProcessedDataPoint[] = [];
    const predictions: ProcessedDataPoint[] = [];

    // Separar datos históricos y predicciones
    const historicalData = filtered.filter(d => d.modelo === 'hist');
    const predictionData = filtered.filter(d => d.modelo === filters.modelo);

    // Datos históricos
    historicalData.forEach(d => {
      historical.push({ year: d.anio, value: d.energia, type: 'historical' });
    });

    // Predicciones
    predictionData.forEach(d => {
      predictions.push({ year: d.anio, value: d.energia, type: 'prediction' });
    });

    return { 
      historical: historical.sort((a, b) => a.year - b.year), 
      predictions: predictions.sort((a, b) => a.year - b.year) 
    };
  };

  const getModelComparison = (empresa: string, categoria: string): ModelComparison[] => {
    const filtered = energyData.filter(
      d => d.empresa === empresa && d.cat_uso === categoria && d.anio === 2025 && d.modelo !== 'hist'
    );

    return filtered.map(d => ({
      modelo: d.modelo,
      value: d.energia,
      accuracy: Math.random() * 10 + 85 // Simulated accuracy for demo
    }));
  };

  const getCategorySummary = (empresa: string): CategorySummary[] => {
    const empresaData = energyData.filter(d => d.empresa === empresa);
    const categorias = [...new Set(empresaData.map(d => d.cat_uso))];
    
    return categorias.map(categoria => {
      const prediction2025 = empresaData.find(d => 
        d.cat_uso === categoria && d.anio === 2025 && d.modelo === 'prophet'
      );
      const historical2024 = empresaData.find(d => 
        d.cat_uso === categoria && d.anio === 2024 && d.modelo === 'hist'
      );

      const predicted = prediction2025?.energia || 0;
      const historical = historical2024?.energia || 0;
      const growth = historical > 0 ? ((predicted - historical) / historical) * 100 : 0;

      return {
        categoria,
        label: CATEGORY_LABELS[categoria] || categoria,
        totalPredicted: predicted,
        growth
      };
    }).filter(s => s.totalPredicted > 0);
  };

  const getCombinedTimeSeries = (empresa: string, categoria: string, modelo: string): ProcessedDataPoint[] => {
    const { historical, predictions } = getProcessedData({ empresa, categoria, modelo });
    return [...historical, ...predictions];
  };

  const getModelAccuracy = (modelo: string): number => {
    // Simulated accuracy data for demo purposes
    const accuracies: Record<string, number> = {
      prophet: 94.2,
      gru: 91.8,
      wavenet: 89.5,
      gbr: 92.3,
      ensemble: 87.1,
      dist: 90.6
    };
    
    return accuracies[modelo] || 90.0;
  };

  return {
    filterOptions,
    getProcessedData,
    getModelComparison,
    getCategorySummary,
    getCombinedTimeSeries,
    getModelAccuracy
  };
}