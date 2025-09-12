import { useState, useCallback } from 'react';

interface SimpleProjectionRequest {
  company?: string;
  region?: string;
  years?: number[];
  sectors?: string[];
  includeMonthly?: boolean;
}

interface SimpleProjectionResult {
  projections: Array<{
    sector: string;
    year: number;
    month?: number;
    value: number;
    confidence: number;
    horizon: string;
    model: string;
  }>;
  summary: {
    totalProjections: number;
    averageConfidence: number;
    processingTime: number;
    reconciled: boolean;
  };
}

export function useSimpleProjections() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<SimpleProjectionResult | null>(null);

  const generateProjections = useCallback(async (request: SimpleProjectionRequest = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/multi-horizon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company: request.company || 'E.E. Quito',
          region: request.region || 'Sierra',
          sectors: request.sectors || ['residential', 'commercial', 'industrial'],
          projectionYears: request.years || [2025, 2026, 2027, 2030],
          includeMonthlyData: request.includeMonthly || false,
          reconcileWithIPF: true,
          includeTechnicalLosses: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en la API');
      }

      const data = await response.json();
      
      // Simplificar la respuesta para uso fácil
      const simplified: SimpleProjectionResult = {
        projections: data.projections.map((p: any) => ({
          sector: p.sector,
          year: p.targetYear,
          month: p.targetMonth,
          value: p.reconciledValue || Object.values(p.predictions).find((v: any) => v !== undefined) || 0,
          confidence: p.confidence,
          horizon: p.timeHorizon,
          model: p.selectedModel
        })),
        summary: {
          totalProjections: data.projections.length,
          averageConfidence: data.projections.reduce((sum: number, p: any) => sum + p.confidence, 0) / data.projections.length,
          processingTime: data.metadata.processingTime,
          reconciled: !!data.reconciliationSummary?.convergenceReached
        }
      };

      setLastResult(simplified);
      return simplified;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProjectionsByYear = useCallback((year: number) => {
    return lastResult?.projections.filter(p => p.year === year) || [];
  }, [lastResult]);

  const getProjectionsBySector = useCallback((sector: string) => {
    return lastResult?.projections.filter(p => p.sector === sector) || [];
  }, [lastResult]);

  const getTotalByYear = useCallback((year: number) => {
    return getProjectionsByYear(year).reduce((sum, p) => sum + p.value, 0);
  }, [getProjectionsByYear]);

  const getTotalBySector = useCallback((sector: string) => {
    return getProjectionsBySector(sector).reduce((sum, p) => sum + p.value, 0);
  }, [getProjectionsBySector]);

  return {
    // Estado
    loading,
    error,
    result: lastResult,

    // Función principal
    generateProjections,

    // Funciones de análisis
    getProjectionsByYear,
    getProjectionsBySector,
    getTotalByYear,
    getTotalBySector,

    // Datos útiles
    hasResults: !!lastResult,
    summary: lastResult?.summary
  };
}