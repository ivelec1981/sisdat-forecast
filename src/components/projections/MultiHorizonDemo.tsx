'use client'

import React, { useState } from 'react';
import { TrendingUp, RefreshCw, BarChart3, Target, CheckCircle, Info } from 'lucide-react';

export default function MultiHorizonDemo() {
  const [loading, setLoading] = useState(false);
  const [projections, setProjections] = useState<any>(null);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    
    // Simular procesamiento
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generar datos de demostración
    const demoProjections = {
      projections: [
        { sector: 'residential', year: 2025, value: 1245.6, confidence: 0.89, model: 'Prophet' },
        { sector: 'commercial', year: 2025, value: 834.2, confidence: 0.85, model: 'GRU' },
        { sector: 'industrial', year: 2025, value: 1567.8, confidence: 0.92, model: 'Ensemble' },
        { sector: 'residential', year: 2026, value: 1289.3, confidence: 0.87, model: 'Prophet' },
        { sector: 'commercial', year: 2026, value: 863.7, confidence: 0.83, model: 'GRU' },
        { sector: 'industrial', year: 2026, value: 1621.4, confidence: 0.90, model: 'Ensemble' },
        { sector: 'residential', year: 2027, value: 1334.5, confidence: 0.84, model: 'Hybrid' },
        { sector: 'commercial', year: 2027, value: 894.8, confidence: 0.81, model: 'WaveNet' },
        { sector: 'industrial', year: 2027, value: 1677.2, confidence: 0.88, model: 'Econometric' },
      ],
      metadata: {
        processingTime: 3000,
        reconciled: true,
        technicalLosses: true,
        recommendations: [
          'Excelente calidad de datos históricos detectada',
          'Modelos convergieron exitosamente con IPF',
          'Se recomienda actualizar proyecciones trimestralmente'
        ]
      }
    };
    
    setProjections(demoProjections);
    setLastGenerated(new Date());
    setLoading(false);
  };

  const getAverageConfidence = () => {
    if (!projections?.projections) return 0;
    const total = projections.projections.reduce((sum: number, p: any) => sum + p.confidence, 0);
    return total / projections.projections.length;
  };

  const getTotalByYear = (year: number) => {
    if (!projections?.projections) return 0;
    return projections.projections
      .filter((p: any) => p.year === year)
      .reduce((sum: number, p: any) => sum + p.value, 0);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 text-white mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-white">
                Sistema Multi-Horizonte
              </h3>
              <p className="text-blue-100 text-sm">
                Metodología Oficial Ecuatoriana Integrada
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {lastGenerated && (
              <span className="text-xs text-blue-100">
                {lastGenerated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Generando...' : 'Demo Sistema'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-slate-700 mb-2">
                Ejecutando Sistema Multi-Horizonte
              </h4>
              <div className="text-sm text-slate-500 space-y-2">
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Seleccionando modelos óptimos por horizonte</span>
                </div>
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Ejecutando reconciliación IPF Bottom-Up/Top-Down</span>
                </div>
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Calculando pérdidas técnicas por nivel de tensión</span>
                </div>
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Generando perfiles típicos de carga (TLP)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {projections && !loading && (
          <div className="space-y-6">
            {/* Resumen General */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Proyecciones</p>
                    <p className="text-2xl font-bold text-blue-900">{projections.projections.length}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Confianza</p>
                    <p className="text-2xl font-bold text-green-900">
                      {(getAverageConfidence() * 100).toFixed(1)}%
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-green-500" />
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">IPF</p>
                    <p className="text-lg font-bold text-purple-900">Convergido</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-purple-500" />
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700">TLP</p>
                    <p className="text-lg font-bold text-orange-900">Generados</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Proyecciones por Año */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-slate-800">Resumen por Horizonte Temporal</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { year: 2025, horizon: 'Corto Plazo (0-2 años)', color: 'blue' },
                  { year: 2026, horizon: 'Corto Plazo (0-2 años)', color: 'blue' },
                  { year: 2027, horizon: 'Mediano Plazo (2-5 años)', color: 'green' }
                ].map(({ year, horizon, color }) => (
                  <div key={year} className={`border-2 border-${color}-200 rounded-lg p-4 bg-${color}-50`}>
                    <div className="flex items-center justify-between mb-3">
                      <h5 className={`font-medium text-lg text-${color}-800`}>{year}</h5>
                      <div className={`text-xs text-${color}-600 bg-${color}-100 px-2 py-1 rounded`}>
                        {horizon}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className={`text-${color}-700`}>Total Proyectado:</span>
                        <span className={`font-medium text-${color}-900`}>{getTotalByYear(year).toFixed(1)} GWh</span>
                      </div>
                      <div className={`text-xs text-${color}-600`}>
                        Crecimiento vs 2025: +{(((getTotalByYear(year) - getTotalByYear(2025)) / getTotalByYear(2025)) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Características del Sistema */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <h4 className="font-semibold mb-4 text-slate-800 flex items-center">
                <Info className="h-5 w-5 mr-2 text-blue-500" />
                Características Implementadas
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-slate-700">
                      <strong>Enhanced Model Registry:</strong> Selección automática de modelos por horizonte temporal
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-slate-700">
                      <strong>Reconciliación IPF:</strong> Bottom-Up y Top-Down con convergencia iterativa
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-slate-700">
                      <strong>Pérdidas Técnicas:</strong> Componentes fijas y variables por nivel de tensión
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-slate-700">
                      <strong>Perfiles TLP:</strong> Clustering K-means para patrones de carga típicos
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-slate-700">
                      <strong>Dashboard Multi-Actor:</strong> Interfaces específicas por institución
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-slate-700">
                      <strong>Integración Completa:</strong> Compatible con toda tu infraestructura existente
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recomendaciones */}
            {projections.metadata?.recommendations && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-medium text-blue-800 mb-3 flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Recomendaciones del Sistema
                </h5>
                <ul className="text-sm text-blue-700 space-y-2">
                  {projections.metadata.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Estado inicial */}
        {!projections && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">
              Sistema Multi-Horizonte Listo
            </h3>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Demostración completa del sistema de proyecciones multi-horizonte basado en la metodología oficial ecuatoriana. 
              Incluye todas las funcionalidades avanzadas integradas con tu infraestructura SISDAT existente.
            </p>
            <button 
              onClick={handleGenerate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 mx-auto"
            >
              <BarChart3 className="h-5 w-5" />
              <span>Ejecutar Demostración Completa</span>
            </button>
            
            <div className="mt-6 text-sm text-slate-500 space-y-1">
              <p>✨ Esta demostración simula el comportamiento del sistema completo</p>
              <p>🔧 Arquitectura implementada y lista para uso en producción</p>
              <p>🚀 Integración progresiva sin afectar funcionalidad existente</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}