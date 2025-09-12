import { useState, useEffect, useCallback } from 'react';
// Importaciones temporales hasta que se implemente el sistema completo
// import { multiHorizonIntegrator, MultiHorizonResult, MultiHorizonRequest } from '@/lib/forecasting/MultiHorizonIntegrator';
import { useResidentialData } from './useResidentialData';
import { useCommercialData } from './useCommercialData';
import { useIndustrialData } from './useIndustrialData';

// Tipos temporales
interface MultiHorizonResult {
  projections: any[];
  metadata: any;
  reconciliationSummary?: any;
  technicalLosses?: any[];
  typicalLoadProfiles?: any[];
}

interface MultiHorizonRequest {
  company: string;
  region: string;
  sectors: string[];
  projectionYears: number[];
  includeMonthlyData?: boolean;
  reconcileWithIPF?: boolean;
  generateTLP?: boolean;
  includeTechnicalLosses?: boolean;
}

interface UseMultiHorizonDataProps {
  company?: string;
  region?: string;
  autoGenerate?: boolean;
}

export function useMultiHorizonData({ 
  company = "E.E. Quito", 
  region = "Sierra",
  autoGenerate = false 
}: UseMultiHorizonDataProps = {}) {
  // Estados
  const [projections, setProjections] = useState<MultiHorizonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

  // Hooks existentes para obtener datos históricos
  const { data: residentialData, loading: loadingResidential } = useResidentialData();
  const { data: commercialData, loading: loadingCommercial } = useCommercialData();
  const { data: industrialData, loading: loadingIndustrial } = useIndustrialData();

  // Función para convertir datos existentes al formato multi-horizonte
  const convertExistingData = useCallback(() => {
    const historicalData = [];

    // Convertir datos residenciales
    if (residentialData) {
      residentialData.forEach(item => {
        historicalData.push({
          company: item.powerCompany,
          sector: 'residential',
          year: item.date.getFullYear(),
          month: item.date.getMonth() + 1,
          energy: item.enerComb || item.enerProphet || 0,
          models: {
            prophet: item.enerProphet,
            gru: item.enerGru,
            wavenet: item.enerWavenet,
            gbr: item.enerGbr,
            ensemble: item.enerComb
          }
        });
      });
    }

    // Convertir datos comerciales
    if (commercialData) {
      commercialData.forEach(item => {
        historicalData.push({
          company: item.powerCompany,
          sector: 'commercial',
          year: item.date.getFullYear(),
          month: item.date.getMonth() + 1,
          energy: item.enerComb || item.enerProphet || 0,
          models: {
            prophet: item.enerProphet,
            gru: item.enerGru,
            wavenet: item.enerWavenet,
            gbr: item.enerGbr,
            ensemble: item.enerComb
          }
        });
      });
    }

    // Convertir datos industriales
    if (industrialData) {
      industrialData.forEach(item => {
        historicalData.push({
          company: item.powerCompany,
          sector: 'industrial',
          year: item.date.getFullYear(),
          month: item.date.getMonth() + 1,
          energy: item.enerComb || item.enerProphet || 0,
          models: {
            prophet: item.enerProphet,
            gru: item.enerGru,
            wavenet: item.enerWavenet,
            gbr: item.enerGbr,
            ensemble: item.enerComb
          }
        });
      });
    }

    return historicalData;
  }, [residentialData, commercialData, industrialData]);

  // Función para generar proyecciones multi-horizonte
  const generateProjections = useCallback(async (options?: Partial<MultiHorizonRequest>) => {
    setLoading(true);
    setError(null);

    try {
      // Determinar sectores disponibles basado en datos existentes
      const availableSectors = [];
      if (residentialData?.length) availableSectors.push('residential');
      if (commercialData?.length) availableSectors.push('commercial');  
      if (industrialData?.length) availableSectors.push('industrial');

      if (availableSectors.length === 0) {
        throw new Error('No hay datos históricos disponibles para generar proyecciones');
      }

      // Configuración por defecto
      const defaultRequest: MultiHorizonRequest = {
        company,
        region,
        sectors: availableSectors,
        projectionYears: [2025, 2026, 2027, 2028, 2029, 2030],
        includeMonthlyData: true,
        reconcileWithIPF: true,
        generateTLP: false, // Deshabilitado por defecto para mejor rendimiento
        includeTechnicalLosses: true
      };

      // Combinar con opciones personalizadas
      const request = { ...defaultRequest, ...options };

      console.log(`🚀 Generando proyecciones multi-horizonte para ${company}...`);
      console.log(`📊 Sectores: ${request.sectors.join(', ')}`);
      console.log(`📅 Años: ${request.projectionYears.join(', ')}`);

      // Simulación temporal hasta que el sistema completo esté disponible
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simular procesamiento
      
      const result: MultiHorizonResult = {
        projections: request.projectionYears.flatMap(year => 
          request.sectors.map(sector => ({
            id: `${sector}-${year}`,
            sector,
            year,
            value: Math.random() * 1000 + 500, // Valor simulado
            confidence: 0.75 + Math.random() * 0.2,
            model: 'prophet'
          }))
        ),
        metadata: {
          processingTime: 2000,
          warnings: [],
          recommendations: ['Datos simulados - Sistema en desarrollo']
        }
      };
      
      setProjections(result);
      setLastGenerated(new Date());

      // Log de resultados
      console.log(`✅ Proyecciones generadas: ${result.projections.length}`);
      console.log(`⏱️ Tiempo de procesamiento: ${result.metadata.processingTime.toFixed(2)}ms`);
      
      if (result.metadata.warnings.length > 0) {
        console.warn('⚠️ Advertencias:', result.metadata.warnings);
      }

      if (result.metadata.recommendations.length > 0) {
        console.info('💡 Recomendaciones:', result.metadata.recommendations);
      }

      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('❌ Error generando proyecciones:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [company, region, residentialData, commercialData, industrialData]);

  // Auto-generar si está habilitado y hay datos disponibles
  useEffect(() => {
    if (autoGenerate && !loading && !projections && 
        (residentialData || commercialData || industrialData) &&
        !loadingResidential && !loadingCommercial && !loadingIndustrial) {
      generateProjections();
    }
  }, [autoGenerate, generateProjections, projections, loading, 
      residentialData, commercialData, industrialData,
      loadingResidential, loadingCommercial, loadingIndustrial]);

  // Funciones de utilidad para analizar proyecciones
  const getProjectionsByHorizon = useCallback((horizon: string) => {
    return projections?.projections.filter(p => p.timeHorizon === horizon) || [];
  }, [projections]);

  const getProjectionsBySector = useCallback((sector: string) => {
    return projections?.projections.filter(p => p.sector === sector) || [];
  }, [projections]);

  const getProjectionsByYear = useCallback((year: number) => {
    return projections?.projections.filter(p => p.targetYear === year) || [];
  }, [projections]);

  const getAverageConfidence = useCallback(() => {
    if (!projections?.projections.length) return 0;
    const total = projections.projections.reduce((sum, p) => sum + p.confidence, 0);
    return total / projections.projections.length;
  }, [projections]);

  const getReconciledTotal = useCallback((year: number, sector?: string) => {
    let yearProjections = getProjectionsByYear(year);
    if (sector) {
      yearProjections = yearProjections.filter(p => p.sector === sector);
    }
    return yearProjections.reduce((sum, p) => sum + (p.reconciledValue || 0), 0);
  }, [getProjectionsByYear]);

  // Función para exportar datos
  const exportProjections = useCallback((format: 'json' | 'csv' = 'json') => {
    if (!projections) return null;

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(projections, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proyecciones_${company}_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      // Convertir a CSV
      const headers = ['Sector', 'Horizonte', 'Año', 'Mes', 'Modelo', 'Valor Original', 'Valor Reconciliado', 'Confianza'];
      const rows = projections.projections.map(p => [
        p.sector,
        p.timeHorizon,
        p.targetYear,
        p.targetMonth || '',
        p.selectedModel,
        Object.values(p.predictions).find(v => v !== undefined) || '',
        p.reconciledValue || '',
        p.confidence
      ]);
      
      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proyecciones_${company}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [projections, company]);

  return {
    // Datos
    projections,
    historicalData: convertExistingData(),
    lastGenerated,
    
    // Estados
    loading: loading || loadingResidential || loadingCommercial || loadingIndustrial,
    error,
    
    // Funciones principales
    generateProjections,
    exportProjections,
    
    // Funciones de análisis
    getProjectionsByHorizon,
    getProjectionsBySector, 
    getProjectionsByYear,
    getAverageConfidence,
    getReconciledTotal,
    
    // Metadatos
    metadata: projections?.metadata,
    reconciliationSummary: projections?.reconciliationSummary,
    technicalLosses: projections?.technicalLosses,
    typicalLoadProfiles: projections?.typicalLoadProfiles,
    
    // Estado de datos existentes
    hasHistoricalData: !!(residentialData?.length || commercialData?.length || industrialData?.length),
    dataSourcesAvailable: {
      residential: !!residentialData?.length,
      commercial: !!commercialData?.length,
      industrial: !!industrialData?.length
    }
  };
}