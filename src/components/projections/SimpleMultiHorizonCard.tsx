'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useMultiHorizonData } from '@/hooks/useMultiHorizonData';
import { TrendingUp, RefreshCw, BarChart3, Target } from 'lucide-react';

interface SimpleMultiHorizonCardProps {
  company?: string;
  region?: string;
  className?: string;
}

export default function SimpleMultiHorizonCard({
  company = "E.E. Quito",
  region = "Sierra", 
  className = ""
}: SimpleMultiHorizonCardProps) {
  
  const {
    projections,
    loading,
    error,
    generateProjections,
    hasHistoricalData,
    dataSourcesAvailable,
    lastGenerated
  } = useMultiHorizonData({ 
    company, 
    region, 
    autoGenerate: false 
  });

  const handleGenerate = async () => {
    try {
      await generateProjections({
        sectors: ['residential', 'commercial', 'industrial'],
        projectionYears: [2025, 2026, 2027],
        includeMonthlyData: false,
        reconcileWithIPF: true,
        includeTechnicalLosses: true
      });
    } catch (err) {
      console.error('Error generando proyecciones:', err);
    }
  };

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
              <span>{loading ? 'Generando...' : 'Generar'}</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {/* Estado de datos históricos */}
        {!hasHistoricalData && !loading && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-orange-800 mb-2">Estado de Datos Históricos</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Residencial:</span>
                <span className={dataSourcesAvailable.residential ? 'text-green-600' : 'text-red-600'}>
                  {dataSourcesAvailable.residential ? '✓ Disponible' : '✗ No disponible'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Comercial:</span>
                <span className={dataSourcesAvailable.commercial ? 'text-green-600' : 'text-red-600'}>
                  {dataSourcesAvailable.commercial ? '✓ Disponible' : '✗ No disponible'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Industrial:</span>
                <span className={dataSourcesAvailable.industrial ? 'text-green-600' : 'text-red-600'}>
                  {dataSourcesAvailable.industrial ? '✓ Disponible' : '✗ No disponible'}
                </span>
              </div>
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
          <div className="space-y-4">
            {/* Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Proyecciones</p>
                    <p className="text-2xl font-bold text-blue-900">{projections.projections?.length || 0}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Confianza Promedio</p>
                    <p className="text-2xl font-bold text-green-900">
                      {projections.projections?.length > 0 
                        ? (projections.projections.reduce((sum: number, p: any) => sum + (p.confidence || 0), 0) / projections.projections.length * 100).toFixed(1)
                        : '0'
                      }%
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-green-500" />
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Empresa</p>
                    <p className="text-lg font-bold text-purple-900">{company}</p>
                  </div>
                  <div className="text-purple-500 text-sm">
                    {region}
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de proyecciones */}
            <div className="space-y-2">
              <h4 className="font-medium">Proyecciones Generadas:</h4>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {projections.projections?.map((projection: any, index: number) => (
                  <div key={index} className="border rounded p-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-medium capitalize">
                        {projection.sector} - {projection.year}
                      </span>
                      <span className="text-blue-600">
                        {(projection.value || 0).toFixed(1)} MWh
                      </span>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-slate-500">
                      <span>Modelo: {projection.model}</span>
                      <span>Confianza: {((projection.confidence || 0) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recomendaciones */}
            {projections.metadata?.recommendations && projections.metadata.recommendations.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h5 className="font-medium text-blue-800 mb-2">💡 Recomendaciones</h5>
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
        {!projections && !loading && !error && (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 mb-4">
              Genera proyecciones multi-horizonte basadas en la metodología oficial ecuatoriana
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