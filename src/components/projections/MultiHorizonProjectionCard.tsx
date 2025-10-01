'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useMultiHorizonData } from '@/hooks/useMultiHorizonData';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Download,
  RefreshCw,
  BarChart3,
  Zap,
  Settings,
  Eye,
  Calendar,
  Building2
} from 'lucide-react';

interface MultiHorizonProjectionCardProps {
  company?: string;
  region?: string;
  className?: string;
  showAdvancedOptions?: boolean;
  defaultSectors?: string[];
  autoGenerate?: boolean;
}

export default function MultiHorizonProjectionCard({
  company = "E.E. Quito",
  region = "Sierra", 
  className = "",
  showAdvancedOptions = false,
  defaultSectors = ['residential', 'commercial', 'industrial'],
  autoGenerate = false
}: MultiHorizonProjectionCardProps) {
  
  const [expandedView, setExpandedView] = useState(false);
  const [selectedHorizon, setSelectedHorizon] = useState<string>('all');
  const [advancedOptions, setAdvancedOptions] = useState({
    includeMonthlyData: true,
    reconcileWithIPF: true,
    generateTLP: false,
    includeTechnicalLosses: true,
    projectionYears: [2025, 2026, 2027, 2028, 2029, 2030]
  });

  const {
    projections,
    loading,
    error,
    generateProjections,
    exportProjections,
    getProjectionsByHorizon,
    getProjectionsBySector,
    getAverageConfidence,
    getReconciledTotal,
    hasHistoricalData,
    dataSourcesAvailable,
    metadata,
    reconciliationSummary,
    technicalLosses,
    lastGenerated
  } = useMultiHorizonData({ 
    company, 
    region, 
    autoGenerate 
  });

  const handleGenerate = async () => {
    try {
      await generateProjections({
        sectors: defaultSectors,
        projectionYears: advancedOptions.projectionYears,
        includeMonthlyData: advancedOptions.includeMonthlyData,
        reconcileWithIPF: advancedOptions.reconcileWithIPF,
        generateTLP: advancedOptions.generateTLP,
        includeTechnicalLosses: advancedOptions.includeTechnicalLosses
      });
    } catch (err) {
      console.error('Error generando proyecciones:', err);
    }
  };

  const getHorizonStats = () => {
    if (!projections) return {};

    const shortTerm = getProjectionsByHorizon('short_term');
    const mediumTerm = getProjectionsByHorizon('medium_term');
    const longTerm = getProjectionsByHorizon('long_term');

    return {
      short_term: {
        count: shortTerm.length,
        avgConfidence: shortTerm.reduce((sum, p) => sum + p.confidence, 0) / shortTerm.length || 0,
        totalEnergy: shortTerm.reduce((sum, p) => sum + (p.reconciledValue || 0), 0)
      },
      medium_term: {
        count: mediumTerm.length,
        avgConfidence: mediumTerm.reduce((sum, p) => sum + p.confidence, 0) / mediumTerm.length || 0,
        totalEnergy: mediumTerm.reduce((sum, p) => sum + (p.reconciledValue || 0), 0)
      },
      long_term: {
        count: longTerm.length,
        avgConfidence: longTerm.reduce((sum, p) => sum + p.confidence, 0) / longTerm.length || 0,
        totalEnergy: longTerm.reduce((sum, p) => sum + (p.reconciledValue || 0), 0)
      }
    };
  };

  const horizonStats = getHorizonStats();

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (!hasHistoricalData) {
    return (
      <Card className={`border-orange-200 bg-orange-50 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center text-orange-700">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Datos Históricos Requeridos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-600 mb-4">
            Se necesitan datos históricos para generar proyecciones multi-horizonte.
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Datos Residenciales:</span>
              <span className={dataSourcesAvailable.residential ? 'text-green-600' : 'text-red-600'}>
                {dataSourcesAvailable.residential ? '✓ Disponible' : '✗ No disponible'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Datos Comerciales:</span>
              <span className={dataSourcesAvailable.commercial ? 'text-green-600' : 'text-red-600'}>
                {dataSourcesAvailable.commercial ? '✓ Disponible' : '✗ No disponible'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Datos Industriales:</span>
              <span className={dataSourcesAvailable.industrial ? 'text-green-600' : 'text-red-600'}>
                {dataSourcesAvailable.industrial ? '✓ Disponible' : '✗ No disponible'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Proyecciones Multi-Horizonte
          </CardTitle>
          <div className="flex items-center space-x-2">
            {lastGenerated && (
              <span className="text-xs text-slate-500">
                Actualizado: {lastGenerated.toLocaleTimeString()}
              </span>
            )}
            <Button
              onClick={handleGenerate}
              disabled={loading}
              size="sm"
              className="flex items-center space-x-1"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Generando...' : 'Generar'}</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
              <p className="text-slate-600">Generando proyecciones multi-horizonte...</p>
              <p className="text-xs text-slate-500 mt-1">
                Esto puede tomar unos momentos
              </p>
            </div>
          </div>
        )}

        {projections && !loading && (
          <div className="space-y-6">
            {/* Resumen General */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Proyecciones</p>
                    <p className="text-2xl font-bold text-blue-900">{projections.projections.length}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Confianza Promedio</p>
                    <p className="text-2xl font-bold text-green-900">
                      {(getAverageConfidence() * 100).toFixed(1)}%
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-green-500" />
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Tiempo Procesamiento</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {metadata?.processingTime.toFixed(0)}ms
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Proyecciones por Horizonte */}
            <div>
              <h4 className="text-lg font-semibold mb-3">Proyecciones por Horizonte Temporal</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(horizonStats).map(([horizon, stats]) => (
                  <div key={horizon} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium capitalize">
                        {horizon.replace('_', ' ')}
                      </h5>
                      <div className={`px-2 py-1 rounded-full text-xs ${getConfidenceColor(stats.avgConfidence)}`}>
                        {(stats.avgConfidence * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Proyecciones:</span>
                        <span className="font-medium">{stats.count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Energía Total:</span>
                        <span className="font-medium">{stats.totalEnergy.toFixed(0)} MWh</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reconciliación IPF */}
            {reconciliationSummary && (
              <div className="border rounded-lg p-4">
                <h4 className="text-lg font-semibold mb-3 flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Reconciliación IPF
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Estado:</span>
                    <div className="flex items-center mt-1">
                      {reconciliationSummary.convergenceReached ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />
                      )}
                      <span className={reconciliationSummary.convergenceReached ? 'text-green-600' : 'text-yellow-600'}>
                        {reconciliationSummary.convergenceReached ? 'Convergido' : 'No convergido'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-600">Iteraciones:</span>
                    <p className="font-medium">{reconciliationSummary.totalIterations}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Error Final:</span>
                    <p className="font-medium">{reconciliationSummary.finalError.toExponential(2)}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Tiempo:</span>
                    <p className="font-medium">{reconciliationSummary.processingTime.toFixed(0)}ms</p>
                  </div>
                </div>
              </div>
            )}

            {/* Pérdidas Técnicas */}
            {technicalLosses && technicalLosses.length > 0 && (
              <div className="border rounded-lg p-4">
                <h4 className="text-lg font-semibold mb-3 flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Pérdidas Técnicas Proyectadas
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {technicalLosses.slice(0, 4).map((loss, index) => (
                    <div key={index} className="border rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium capitalize">
                          {loss.voltageLevel.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          loss.compliance ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {loss.compliance ? 'Cumple' : 'No cumple'}
                        </span>
                      </div>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Pérdidas Totales:</span>
                          <span className="font-medium">{loss.totalLossPercentage.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Límite Regulatorio:</span>
                          <span>{loss.regulatoryLimit?.toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Advertencias y Recomendaciones */}
            {metadata && (metadata.warnings.length > 0 || metadata.recommendations.length > 0) && (
              <div className="space-y-3">
                {metadata.warnings.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <h5 className="font-medium text-yellow-800 mb-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Advertencias
                    </h5>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {metadata.warnings.map((warning: string, index: number) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {metadata.recommendations.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h5 className="font-medium text-blue-800 mb-2">💡 Recomendaciones</h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {metadata.recommendations.map((recommendation: string, index: number) => (
                        <li key={index}>• {recommendation}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Acciones */}
            <div className="flex flex-wrap gap-2 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportProjections('json')}
                className="flex items-center space-x-1"
              >
                <Download className="h-4 w-4" />
                <span>Exportar JSON</span>
              </Button>
              
              <Button
                variant="outline" 
                size="sm"
                onClick={() => exportProjections('csv')}
                className="flex items-center space-x-1"
              >
                <Download className="h-4 w-4" />
                <span>Exportar CSV</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpandedView(!expandedView)}
                className="flex items-center space-x-1"
              >
                <Eye className="h-4 w-4" />
                <span>{expandedView ? 'Vista Simple' : 'Vista Detallada'}</span>
              </Button>

              {showAdvancedOptions && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {/* Abrir modal de configuración */}}
                  className="flex items-center space-x-1"
                >
                  <Settings className="h-4 w-4" />
                  <span>Configurar</span>
                </Button>
              )}
            </div>

            {/* Vista Expandida */}
            <AnimatePresence>
              {expandedView && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t pt-4"
                >
                  <h4 className="text-lg font-semibold mb-3">Detalle de Proyecciones</h4>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {projections.projections.map((projection, index) => (
                      <div key={projection.id} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">
                            {projection.sector} - {projection.targetYear}
                            {projection.targetMonth && ` (${projection.targetMonth})`}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                              {projection.selectedModel}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${getConfidenceColor(projection.confidence)}`}>
                              {(projection.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span>Valor Original:</span>
                            <span>{(Object.values(projection.predictions).find(v => v !== undefined) as number | undefined)?.toFixed(2) ?? 'N/A'} MWh</span>
                          </div>
                          {projection.reconciledValue && (
                            <div className="flex justify-between">
                              <span>Valor Reconciliado:</span>
                              <span className="font-medium">{projection.reconciledValue.toFixed(2)} MWh</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Estado inicial */}
        {!projections && !loading && !error && (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 mb-4">
              Genera proyecciones multi-horizonte basadas en tus datos históricos
            </p>
            <Button onClick={handleGenerate} className="flex items-center space-x-2 mx-auto">
              <BarChart3 className="h-4 w-4" />
              <span>Generar Proyecciones</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}