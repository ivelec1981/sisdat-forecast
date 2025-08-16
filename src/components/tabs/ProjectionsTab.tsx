'use client'

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Brain, Target, TrendingUp, Filter, Download, RefreshCw } from 'lucide-react';
import MetricCard from '../dashboard/MetricCard';
import { useSimpleProjectionData, FilterState, ProcessedDataPoint, CategorySummary, ModelComparison } from '@/hooks/useSimpleProjectionData';
import { CATEGORY_LABELS, MODEL_LABELS } from '@/lib/data/realProjectionData';

export default function ProjectionsTab() {
  const { 
    filterOptions, 
    getProcessedData, 
    getModelComparison, 
    getCategorySummary,
    getCombinedTimeSeries,
    getModelAccuracy 
  } = useSimpleProjectionData();

  const [filters, setFilters] = useState<FilterState>({
    empresa: 'E.E. Quito',
    categoria: 'res',
    modelo: 'prophet'
  });

  const processedData = getProcessedData(filters);
  const modelComparison = getModelComparison(filters.empresa, filters.categoria);
  const categorySummary = getCategorySummary(filters.empresa);
  const combinedData = getCombinedTimeSeries(filters.empresa, filters.categoria, filters.modelo);

  // Calcular métricas
  const currentPrediction = processedData.predictions.find((p: ProcessedDataPoint) => p.year === 2025)?.value || 0;
  const lastHistorical = processedData.historical[processedData.historical.length - 1]?.value || 0;
  const growth = lastHistorical > 0 ? ((currentPrediction - lastHistorical) / lastHistorical) * 100 : 0;
  const modelAccuracy = getModelAccuracy(filters.modelo);

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev: FilterState) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Controles de filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center">
            <Filter className="mr-2" size={20} />
            Filtros de Análisis
          </h3>
          <div className="flex space-x-2">
            <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
              <RefreshCw size={16} />
            </button>
            <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
              <Download size={16} />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Empresa Distribuidora
            </label>
            <select 
              value={filters.empresa} 
              onChange={(e) => updateFilter('empresa', e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {filterOptions.empresas.map((empresa: string) => (
                <option key={empresa} value={empresa}>{empresa}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Sector de Consumo
            </label>
            <select 
              value={filters.categoria} 
              onChange={(e) => updateFilter('categoria', e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {filterOptions.categorias.map((categoria: string) => (
                <option key={categoria} value={categoria}>
                  {CATEGORY_LABELS[categoria] || categoria}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Modelo de Predicción
            </label>
            <select 
              value={filters.modelo} 
              onChange={(e) => updateFilter('modelo', e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {filterOptions.modelos.map((modelo: string) => (
                <option key={modelo} value={modelo}>
                  {MODEL_LABELS[modelo] || modelo}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Predicción 2025"
          value={`${(currentPrediction / 1000).toFixed(1)} GWh`}
          change={`${filters.empresa.replace('E.E.', 'EE').replace('CNEL-', '')}`}
          changeType="neutral"
          icon={Brain}
          color="blue"
        />
        <MetricCard
          title="Precisión del Modelo"
          value={`${modelAccuracy.toFixed(1)}%`}
          change={`${MODEL_LABELS[filters.modelo]}`}
          changeType="positive"
          icon={Target}
          color="green"
        />
        <MetricCard
          title="Crecimiento Proyectado"
          value={`${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`}
          change="2024 vs 2025"
          changeType={growth >= 0 ? "positive" : "negative"}
          icon={TrendingUp}
          color={growth >= 0 ? "green" : "red"}
        />
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolución temporal */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Evolución Temporal - {CATEGORY_LABELS[filters.categoria]} ({filters.empresa})
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="year" 
                domain={['dataMin', 'dataMax']}
                type="number"
                scale="linear"
              />
              <YAxis 
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number, name, props) => [
                  `${(value / 1000).toFixed(1)} GWh`, 
                  props.payload?.type === 'historical' ? 'Histórico' : `Predicción (${MODEL_LABELS[filters.modelo]})`
                ]} 
              />
              <Line 
                key="projection-line"
                type="monotone" 
                dataKey="value" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={(props) => {
                  const isHistorical = props.payload?.type === 'historical';
                  const uniqueKey = `dot-${props.payload?.year || 'unknown'}-${props.payload?.value || 'default'}-${isHistorical ? 'hist' : 'pred'}`;
                  return (
                    <circle 
                      key={uniqueKey}
                      cx={props.cx} 
                      cy={props.cy} 
                      r={4}
                      fill={isHistorical ? '#64748B' : '#3B82F6'}
                      stroke={isHistorical ? '#64748B' : '#3B82F6'}
                      strokeWidth={2}
                    />
                  );
                }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Comparación de modelos */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Comparación de Modelos (2025)
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={modelComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="modelo" 
                tickFormatter={(value) => MODEL_LABELS[value] || value}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value: number) => [`${(value / 1000).toFixed(1)} GWh`, 'Predicción']}
                labelFormatter={(label) => MODEL_LABELS[label] || label}
              />
              <Bar 
                key="comparison-bar"
                dataKey="value" 
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resumen por sectores */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Resumen por Sector - {filters.empresa}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {categorySummary.map((sector: CategorySummary) => (
            <div 
              key={sector.categoria}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                filters.categoria === sector.categoria
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => updateFilter('categoria', sector.categoria)}
            >
              <h4 className="font-medium text-slate-900 text-sm">{sector.label}</h4>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {(sector.totalPredicted / 1000).toFixed(1)}
                <span className="text-sm text-slate-600 ml-1">GWh</span>
              </p>
              <p className={`text-sm mt-1 ${
                sector.growth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {sector.growth >= 0 ? '+' : ''}{sector.growth.toFixed(1)}% vs 2024
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla detallada */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Predicciones Detalladas por Modelo (2025)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-900">Modelo</th>
                <th className="text-center py-3 px-4 font-medium text-slate-900">Predicción (GWh)</th>
                <th className="text-center py-3 px-4 font-medium text-slate-900">Precisión (%)</th>
                <th className="text-center py-3 px-4 font-medium text-slate-900">Diferencia vs Histórico</th>
              </tr>
            </thead>
            <tbody>
              {modelComparison.map((model: ModelComparison) => {
                const diff = lastHistorical > 0 ? ((model.value - lastHistorical) / lastHistorical) * 100 : 0;
                return (
                  <tr 
                    key={model.modelo} 
                    className={`border-b border-slate-100 ${
                      model.modelo === filters.modelo ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {MODEL_LABELS[model.modelo] || model.modelo}
                    </td>
                    <td className="text-center py-3 px-4 text-slate-600">
                      {(model.value / 1000).toFixed(2)}
                    </td>
                    <td className="text-center py-3 px-4 text-slate-600">
                      {model.accuracy?.toFixed(1) || 'N/A'}
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`font-medium ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {diff >= 0 ? '+' : ''}{diff.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}