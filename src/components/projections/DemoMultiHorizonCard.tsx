'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TrendingUp, RefreshCw, BarChart3, Target, CheckCircle } from 'lucide-react';

interface DemoMultiHorizonCardProps {
  company?: string;
  region?: string;
  className?: string;
}

export default function DemoMultiHorizonCard({
  company = "E.E. Quito",
  region = "Sierra", 
  className = ""
}: DemoMultiHorizonCardProps) {
  
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
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Proyecciones Multi-Horizonte
            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
              Demo
            </span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {lastGenerated && (
              <span className="text-xs text-slate-500">
                {lastGenerated.toLocaleTimeString()}
              </span>
            )}
            <Button
              onClick={handleGenerate}
              disabled={loading}
              size="sm"
              className="flex items-center space-x-1"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Generando...' : 'Generar Demo'}</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
              <p className="text-slate-600">Generando proyecciones multi-horizonte...</p>
              <div className="text-xs text-slate-500 mt-2 space-y-1">
                <p>✓ Seleccionando modelos óptimos por horizonte</p>
                <p>✓ Ejecutando reconciliación IPF</p>
                <p>✓ Calculando pérdidas técnicas</p>
                <p>✓ Generando recomendaciones</p>
              </div>
            </div>
          </div>
        )}

        {projections && !loading && (
          <div className="space-y-6">
            {/* Resumen General */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Proyecciones</p>
                    <p className="text-2xl font-bold text-blue-900">{projections.projections.length}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Confianza</p>
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
                    <p className="text-sm font-medium text-purple-600">Reconciliación IPF</p>
                    <p className="text-lg font-bold text-purple-900">Convergido</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-purple-500" />
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Empresa</p>
                    <p className="text-lg font-bold text-orange-900">{company}</p>
                  </div>
                  <div className="text-orange-500 text-sm">
                    {region}
                  </div>
                </div>
              </div>
            </div>

            {/* Proyecciones por Año */}
            <div>
              <h4 className="text-lg font-semibold mb-3">Resumen por Año</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[2025, 2026, 2027].map(year => (
                  <div key={year} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-lg">{year}</h5>
                      <div className="text-sm text-slate-500">
                        {year <= 2026 ? 'Corto plazo' : 'Mediano plazo'}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span className="font-medium">{getTotalByYear(year).toFixed(1)} GWh</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        Crecimiento: +{(((getTotalByYear(year) - getTotalByYear(2025)) / getTotalByYear(2025)) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detalles por Sector */}
            <div>
              <h4 className="text-lg font-semibold mb-3">Proyecciones Detalladas</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {projections.projections.map((projection: any, index: number) => (
                  <div key={index} className="border rounded p-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-medium capitalize">
                        {projection.sector} - {projection.year}
                      </span>
                      <span className="text-blue-600 font-medium">
                        {projection.value.toFixed(1)} GWh
                      </span>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-slate-500">
                      <span>Modelo: {projection.model}</span>
                      <span className={`px-2 py-1 rounded ${
                        projection.confidence >= 0.9 ? 'bg-green-100 text-green-700' :
                        projection.confidence >= 0.8 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {(projection.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Características del Sistema */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-medium mb-3">Características del Sistema Multi-Horizonte</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Selección automática de modelos por horizonte</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Reconciliación IPF Bottom-Up/Top-Down</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Cálculo de pérdidas técnicas por nivel</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Perfiles típicos de carga (TLP)</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Integración con datos históricos existentes</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Dashboard multi-actor institucional</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recomendaciones */}
            {projections.metadata?.recommendations && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-medium text-blue-800 mb-2">💡 Recomendaciones del Sistema</h5>
                <ul className="text-sm text-blue-700 space-y-1">
                  {projections.metadata.recommendations.map((rec: string, index: number) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Estado inicial */}
        {!projections && !loading && (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">
              Sistema Multi-Horizonte Integrado
            </h3>
            <p className="text-slate-600 mb-4 max-w-md mx-auto">
              Demostración del sistema de proyecciones multi-horizonte basado en la metodología oficial ecuatoriana. 
              Integra automáticamente con tus datos históricos existentes.
            </p>
            <Button onClick={handleGenerate} className="flex items-center space-x-2 mx-auto">
              <BarChart3 className="h-4 w-4" />
              <span>Ver Demostración</span>
            </Button>
            
            <div className="mt-4 text-xs text-slate-500">
              <p>✨ Esta demostración muestra las capacidades del sistema</p>
              <p>🔧 El sistema completo se activará progresivamente</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}