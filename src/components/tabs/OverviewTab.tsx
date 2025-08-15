'use client'

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Zap, TrendingUp, Activity, Database } from 'lucide-react';
import MetricCard from '../dashboard/MetricCard';
import ModelAccuracyChart from '../metrics/ModelAccuracyChart';
import ModelComparisonTable from '../metrics/ModelComparisonTable';
import RealTimeMetrics from '../metrics/RealTimeMetrics';
import EnhancedTrendChart from '../charts/EnhancedTrendChart';
import { ProjectionData } from '@/types/dashboard';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { useModelMetrics } from '@/hooks/useModelMetrics';

interface OverviewTabProps {
  projectionData: ProjectionData;
}

export default function OverviewTab({ projectionData }: OverviewTabProps) {
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError } = useDashboardMetrics();
  const { data: modelData, loading: modelLoading, error: modelError } = useModelMetrics();

  // Fallback a datos estáticos si no hay datos de la BD
  const totalDemand = React.useMemo(() => {
    if (dashboardData && dashboardData.sectorData && dashboardData.sectorData.length > 0) {
      return dashboardData.sectorData
        .filter(s => s.model === 'prophet')
        .reduce((sum, sector) => sum + (sector._sum.energy || 0), 0) / 1000; // Convertir a MW
    }
    return Object.values(projectionData).reduce((sum, sector) => sum + sector.Prophet, 0);
  }, [dashboardData, projectionData]);
  
  const sectorData = React.useMemo(() => {
    if (dashboardData && dashboardData.sectorData && dashboardData.sectorData.length > 0) {
      const prophetData = dashboardData.sectorData.filter(s => s.model === 'prophet');
      if (prophetData.length > 0) {
        return prophetData.map(sector => ({
          name: sector.category === 'res' ? 'Residencial' : 
                sector.category === 'com' ? 'Comercial' :
                sector.category === 'ind' ? 'Industrial' :
                sector.category === 'ap' ? 'Alumbrado' : 'Otros',
          value: (sector._sum.energy || 0) / 1000, // Convertir a MW
          accuracy: sector._avg.accuracy || 90,
          color: sector.category === 'res' ? '#3B82F6' :
                 sector.category === 'com' ? '#10B981' :
                 sector.category === 'ind' ? '#F59E0B' :
                 sector.category === 'ap' ? '#EF4444' : '#8B5CF6'
        }));
      }
    }
    
    // Fallback a datos estáticos
    return [
      { name: 'Residencial', value: projectionData.residential.Prophet, color: '#3B82F6', accuracy: 94.5 },
      { name: 'Comercial', value: projectionData.commercial.Prophet, color: '#10B981', accuracy: 92.1 },
      { name: 'Industrial', value: projectionData.industrial.Prophet, color: '#F59E0B', accuracy: 96.2 },
      { name: 'Alumbrado', value: projectionData.publicLighting.Prophet, color: '#EF4444', accuracy: 89.8 },
      { name: 'Otros', value: projectionData.others.Prophet, color: '#8B5CF6', accuracy: 91.3 }
    ];
  }, [dashboardData, projectionData]);

  const trendData = React.useMemo(() => {
    if (dashboardData && dashboardData.monthlyTrends && dashboardData.monthlyTrends.length > 0) {
      const prophetTrends = dashboardData.monthlyTrends
        .filter(t => t.model === 'prophet' && t.month && t.month <= 12)
        .sort((a, b) => a.month - b.month);
        
      if (prophetTrends.length > 0) {
        return prophetTrends.map(trend => ({
          month: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][trend.month - 1],
          demand: (trend._sum.energy || 0) / 1000 // Convertir a MW
        }));
      }
    }
    
    // Fallback a datos estáticos
    return [
      { month: 'Ene', demand: 8500 },
      { month: 'Feb', demand: 8650 },
      { month: 'Mar', demand: 8800 },
      { month: 'Abr', demand: 8750 },
      { month: 'May', demand: 8900 },
      { month: 'Jun', demand: 9100 },
    ];
  }, [dashboardData]);

  // Preparar datos de precisión de modelos (excluyendo 'hist')
  const modelAccuracyData = React.useMemo(() => {
    if (modelData && modelData.modelConfigs) {
      return modelData.modelConfigs
        .filter(config => config.name !== 'hist')
        .map(config => ({
          model: config.name,
          accuracy: config.accuracy || 0,
          predictions: modelData.realTimeAccuracy[config.name]?.totalCount || 0,
          displayName: config.displayName
        }));
    }
    return [
      { model: 'prophet', accuracy: 94.5, predictions: 1250, displayName: 'Prophet' },
      { model: 'lstm', accuracy: 92.8, predictions: 980, displayName: 'LSTM' },
      { model: 'gru', accuracy: 91.2, predictions: 856, displayName: 'GRU' },
      { model: 'wavenet', accuracy: 89.6, predictions: 742, displayName: 'WaveNet' }
    ];
  }, [modelData]);

  const modelTableData = React.useMemo(() => {
    if (modelData && modelData.modelConfigs) {
      return modelData.modelConfigs
        .filter(config => config.name !== 'hist')
        .map(config => ({
          name: config.name,
          displayName: config.displayName,
          accuracy: config.accuracy,
          predictions: modelData.realTimeAccuracy[config.name]?.totalCount || 0,
          lastTrained: config.lastTrained,
          isActive: config.isActive,
          trend: 'stable' as const
        }));
    }
    return [
      { name: 'prophet', displayName: 'Prophet', accuracy: 94.5, predictions: 1250, lastTrained: '2024-08-15T10:30:00Z', isActive: true, trend: 'up' as const },
      { name: 'lstm', displayName: 'LSTM', accuracy: 92.8, predictions: 980, lastTrained: '2024-08-15T09:15:00Z', isActive: true, trend: 'stable' as const },
      { name: 'gru', displayName: 'GRU', accuracy: 91.2, predictions: 856, lastTrained: '2024-08-14T16:45:00Z', isActive: true, trend: 'down' as const },
      { name: 'wavenet', displayName: 'WaveNet', accuracy: 89.6, predictions: 742, lastTrained: '2024-08-14T14:20:00Z', isActive: false, trend: 'stable' as const }
    ];
  }, [modelData]);

  const averageAccuracy = modelAccuracyData.reduce((sum, model) => sum + model.accuracy, 0) / modelAccuracyData.length;

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Demanda Total"
          value={dashboardLoading ? "..." : `${totalDemand.toFixed(1)} MW`}
          change="+5.2% vs anterior"
          changeType="positive"
          icon={Zap}
          color="blue"
        />
        <MetricCard
          title="Precisión Promedio"
          value={modelLoading ? "..." : `${averageAccuracy.toFixed(1)}%`}
          change={averageAccuracy > 90 ? "+1.2% vs anterior" : "Requiere mejora"}
          changeType={averageAccuracy > 90 ? "positive" : "neutral"}
          icon={TrendingUp}
          color="green"
        />
        <MetricCard
          title="Estaciones Activas"
          value={dashboardLoading ? "..." : dashboardData?.summary.totalStations.toString() || "156"}
          change={dashboardData?.summary.stationsInMaintenance 
            ? `${dashboardData.summary.stationsInMaintenance} en mantenimiento`
            : "2 en mantenimiento"}
          changeType="neutral"
          icon={Activity}
          color="yellow"
        />
        <MetricCard
          title="Datos Procesados"
          value={dashboardLoading ? "..." : `${(dashboardData?.recentEnergyData.length || 240) / 100}M`}
          change={dashboardData?.summary.lastUpdate 
            ? `Actualizado: ${new Date(dashboardData.summary.lastUpdate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
            : "Última actualización: 10:30"}
          changeType="neutral"
          icon={Database}
          color="blue"
        />
      </div>

      {/* Gráfico de tendencias mejorado */}
      <EnhancedTrendChart title="Tendencia de Demanda - Histórico vs Proyectado" />

      {/* Distribución por sector */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Demanda por Sector (MW)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sectorData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-600" />
            <XAxis dataKey="name" className="text-slate-600 dark:text-slate-300" />
            <YAxis className="text-slate-600 dark:text-slate-300" />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgb(248, 250, 252)',
                border: '1px solid rgb(226, 232, 240)',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Métricas de precisión de modelos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ModelAccuracyChart 
          data={modelAccuracyData} 
          title="Precisión por Modelo de ML"
          type="bar"
        />
        <ModelAccuracyChart 
          data={modelAccuracyData} 
          title="Evolución de Precisión"
          type="line"
        />
      </div>

      {/* Tabla de comparación de modelos */}
      <ModelComparisonTable 
        models={modelTableData}
        title="Estado y Rendimiento de Modelos"
      />

      {/* Métricas en tiempo real */}
      {modelData?.predictionHistory && (
        <RealTimeMetrics 
          predictionHistory={modelData.predictionHistory}
        />
      )}

      {/* Resumen de predicciones por sector */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Precisión por Sector</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-600">
                <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Sector</th>
                <th className="text-center py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Demanda (MW)</th>
                <th className="text-center py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Precisión (%)</th>
                <th className="text-center py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Estado</th>
              </tr>
            </thead>
            <tbody>
              {sectorData.map((sector) => (
                <tr key={sector.name} className="border-b border-slate-100 dark:border-slate-700">
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                    {sector.name}
                  </td>
                  <td className="text-center py-3 px-4 text-slate-600 dark:text-slate-300">
                    {sector.value.toFixed(1)}
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className={`font-medium ${
                      sector.accuracy >= 95 ? 'text-green-600 dark:text-green-400' : 
                      sector.accuracy >= 90 ? 'text-yellow-600 dark:text-yellow-400' : 
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {sector.accuracy.toFixed(1)}%
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      sector.accuracy >= 95 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                      sector.accuracy >= 90 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {sector.accuracy >= 95 ? 'Excelente' : sector.accuracy >= 90 ? 'Bueno' : 'Requiere mejora'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}