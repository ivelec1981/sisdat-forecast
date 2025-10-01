'use client'

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSimpleProjections } from '@/hooks/useSimpleProjections';
import { useMultiHorizonData } from '@/hooks/useMultiHorizonData';
import { useResidentialData } from '@/hooks/useResidentialData';
import { useCommercialData } from '@/hooks/useCommercialData';
import { TrendingUp, Zap, Clock } from 'lucide-react';

export default function ExampleUsageComponent() {
  // Hook existente para datos residenciales
  const { data: residentialData, loading: residentialLoading } = useResidentialData();
  
  // Hook existente para datos comerciales
  const { data: commercialData, loading: commercialLoading } = useCommercialData();

  // Hook simple para proyecciones rápidas
  const {
    loading: simpleLoading,
    error: simpleError,
    generateProjections: generateSimple,
    result: simpleResult,
    getTotalByYear,
    summary: simpleSummary
  } = useSimpleProjections();

  // Hook completo para funcionalidades avanzadas
  const {
    projections: advancedProjections,
    loading: advancedLoading,
    generateProjections: generateAdvanced,
    getAverageConfidence,
    technicalLosses,
    reconciliationSummary,
    exportProjections
  } = useMultiHorizonData({
    company: "E.E. Quito",
    region: "Sierra",
    autoGenerate: false
  });

  // Ejemplo 1: Uso simple con datos existentes
  const handleSimpleProjection = async () => {
    try {
      await generateSimple({
        company: "E.E. Quito",
        years: [2025, 2026, 2027],
        sectors: ['residential', 'commercial'],
        includeMonthly: false
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Ejemplo 2: Uso avanzado con todas las funcionalidades
  const handleAdvancedProjection = async () => {
    try {
      await generateAdvanced({
        company: "E.E. Quito",
        region: "Sierra",
        sectors: ['residential', 'commercial', 'industrial'],
        projectionYears: [2025, 2026, 2027, 2030],
        includeMonthlyData: true,
        reconcileWithIPF: true,
        generateTLP: false,
        includeTechnicalLosses: true
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Ejemplo 3: Combinar datos existentes con nuevas proyecciones
  const combinedAnalysis = React.useMemo(() => {
    if (!residentialData || !simpleResult) return null;

    // Obtener último año histórico
    const lastHistoricalYear = Math.max(...residentialData.map(d => d.year));
    const lastHistoricalValue = residentialData
      .filter(d => d.year === lastHistoricalYear)
      .reduce((sum, d) => sum + (d.energy.comb || 0), 0);

    // Comparar con primera proyección
    const firstProjectionYear = Math.min(...simpleResult.projections.map(p => p.year));
    const firstProjectionValue = getTotalByYear(firstProjectionYear);

    const growthRate = ((firstProjectionValue - lastHistoricalValue) / lastHistoricalValue) * 100;

    return {
      lastHistoricalYear,
      lastHistoricalValue: lastHistoricalValue / 1000, // Convertir a GWh
      firstProjectionYear,
      firstProjectionValue: firstProjectionValue / 1000, // Convertir a GWh
      growthRate
    };
  }, [residentialData, simpleResult, getTotalByYear]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Ejemplos de Uso - Sistema Multi-Horizonte</h2>
      
      {/* Estado de datos existentes */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Datos Existentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span>Datos Residenciales:</span>
              <span className={residentialData ? 'text-green-600' : 'text-gray-500'}>
                {residentialLoading ? 'Cargando...' : residentialData ? `${residentialData.length} registros` : 'No disponible'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Datos Comerciales:</span>
              <span className={commercialData ? 'text-green-600' : 'text-gray-500'}>
                {commercialLoading ? 'Cargando...' : commercialData ? `${commercialData.length} registros` : 'No disponible'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Sistema Multi-Horizonte:</span>
              <span className="text-blue-600">✓ Disponible</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ejemplo 1: Uso Simple */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Ejemplo 1: Uso Simple
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Generar proyecciones rápidas con configuración mínima
            </p>
            
            <Button 
              onClick={handleSimpleProjection} 
              disabled={simpleLoading}
              className="flex items-center space-x-2"
            >
              <span>{simpleLoading ? 'Generando...' : 'Generar Proyecciones Simple'}</span>
            </Button>

            {simpleError && (
              <div className="text-red-600 text-sm">Error: {simpleError}</div>
            )}

            {simpleResult && (
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Resultados Simple:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Total Proyecciones:</span>
                    <span className="ml-2 font-medium">{simpleSummary?.totalProjections}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Confianza Promedio:</span>
                    <span className="ml-2 font-medium">{((simpleSummary?.averageConfidence || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Tiempo Procesamiento:</span>
                    <span className="ml-2 font-medium">{simpleSummary?.processingTime.toFixed(0)}ms</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Reconciliado:</span>
                    <span className="ml-2 font-medium">{simpleSummary?.reconciled ? '✓ Sí' : '✗ No'}</span>
                  </div>
                </div>

                <div className="mt-3">
                  <h5 className="text-sm font-medium mb-2">Proyecciones por Año:</h5>
                  <div className="space-y-1">
                    {[2025, 2026, 2027].map(year => (
                      <div key={year} className="flex justify-between text-xs">
                        <span>{year}:</span>
                        <span>{(getTotalByYear(year) / 1000).toFixed(1)} GWh</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ejemplo 2: Uso Avanzado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Ejemplo 2: Uso Avanzado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Proyecciones completas con IPF, pérdidas técnicas y análisis detallado
            </p>
            
            <Button 
              onClick={handleAdvancedProjection} 
              disabled={advancedLoading}
              className="flex items-center space-x-2"
            >
              <span>{advancedLoading ? 'Generando...' : 'Generar Proyecciones Avanzadas'}</span>
            </Button>

            {advancedProjections && (
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Resultados Avanzados:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Proyecciones:</span>
                    <span className="ml-2 font-medium">{advancedProjections.projections.length}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Confianza:</span>
                    <span className="ml-2 font-medium">{(getAverageConfidence() * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-slate-600">IPF Convergencia:</span>
                    <span className="ml-2 font-medium">
                      {reconciliationSummary?.convergenceReached ? '✓ Sí' : '✗ No'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Pérdidas Técnicas:</span>
                    <span className="ml-2 font-medium">{technicalLosses?.length || 0} niveles</span>
                  </div>
                </div>

                <div className="mt-3">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => exportProjections('csv')}
                    className="text-xs"
                  >
                    Exportar CSV
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ejemplo 3: Análisis Combinado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Ejemplo 3: Análisis Combinado (Histórico + Proyecciones)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Combina tus datos históricos existentes con las nuevas proyecciones multi-horizonte
            </p>

            {combinedAnalysis && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium mb-3">Análisis de Continuidad:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Último año histórico:</span>
                    <div className="font-medium">{combinedAnalysis.lastHistoricalYear}</div>
                    <div className="text-xs text-slate-500">
                      {combinedAnalysis.lastHistoricalValue.toFixed(1)} GWh
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-600">Primera proyección:</span>
                    <div className="font-medium">{combinedAnalysis.firstProjectionYear}</div>
                    <div className="text-xs text-slate-500">
                      {combinedAnalysis.firstProjectionValue.toFixed(1)} GWh
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-slate-600 text-sm">Tasa de crecimiento proyectada:</span>
                  <div className={`text-lg font-bold ${combinedAnalysis.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {combinedAnalysis.growthRate > 0 ? '+' : ''}{combinedAnalysis.growthRate.toFixed(2)}%
                  </div>
                </div>
              </div>
            )}

            {!combinedAnalysis && (residentialLoading || simpleLoading) && (
              <div className="text-sm text-slate-500">Cargando análisis combinado...</div>
            )}

            {!combinedAnalysis && !residentialLoading && !simpleLoading && (
              <div className="text-sm text-slate-500">
                Genera proyecciones para ver el análisis combinado
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Código de ejemplo */}
      <Card>
        <CardHeader>
          <CardTitle>Código de Ejemplo</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
{`// Uso simple
import { useSimpleProjections } from '@/hooks/useSimpleProjections';

const { generateProjections, getTotalByYear } = useSimpleProjections();

await generateProjections({
  company: "E.E. Quito",
  years: [2025, 2026, 2027],
  sectors: ['residential', 'commercial']
});

const total2025 = getTotalByYear(2025);

// Uso avanzado
import { useMultiHorizonData } from '@/hooks/useMultiHorizonData';

const { generateProjections, exportProjections } = useMultiHorizonData();

await generateProjections({
  reconcileWithIPF: true,
  includeTechnicalLosses: true,
  generateTLP: true
});

exportProjections('csv');`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}