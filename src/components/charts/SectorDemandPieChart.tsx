'use client';

import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, Zap, Calendar } from 'lucide-react';
import { useSectorData } from '@/hooks/useSectorData';

interface SectorDemandPieChartProps {
  title?: string;
  height?: number;
}

export default function SectorDemandPieChart({ 
  title = "Participación por Sector",
  height = 400 
}: SectorDemandPieChartProps) {
  const [dataType, setDataType] = useState<'energy' | 'power'>('energy');
  const [viewMode, setViewMode] = useState<'pie' | 'bar'>('pie');
  const [yearMode, setYearMode] = useState<'historical' | 'projected'>('historical');
  
  const { data: sectorData, loading } = useSectorData(dataType);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!sectorData) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">{title}</h3>
        <div className="text-center text-slate-500 py-8">
          No hay datos disponibles
        </div>
      </div>
    );
  }

  const currentData = yearMode === 'historical' ? sectorData.historical : sectorData.projected;
  const currentYear = yearMode === 'historical' ? sectorData.historicalYear : sectorData.projectedYear;

  const formatTooltip = (value: number, name: string, props: any) => {
    const percentage = props.payload.percentage;
    const unit = sectorData.unit;
    return [
      `${value.toFixed(1)} ${unit} (${percentage.toFixed(1)}%)`,
      name
    ];
  };

  const CustomLabel = (entry: any) => {
    return `${entry.name}: ${entry.percentage.toFixed(1)}%`;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      {/* Header con controles */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="flex items-center gap-2 mb-4 lg:mb-0">
          <Zap className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {yearMode === 'historical' ? `Histórico ${currentYear}` : `Proyección ${currentYear}`}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Selector de tipo de dato */}
          <select
            value={dataType}
            onChange={(e) => setDataType(e.target.value as 'energy' | 'power')}
            className="px-3 py-1 text-sm border border-slate-300 rounded-md bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
          >
            <option value="energy">Energía (MWh)</option>
            <option value="power">Potencia (MW)</option>
          </select>

          {/* Selector de vista */}
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as 'pie' | 'bar')}
            className="px-3 py-1 text-sm border border-slate-300 rounded-md bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
          >
            <option value="pie">Gráfico Circular</option>
            <option value="bar">Gráfico de Barras</option>
          </select>

          {/* Selector de período */}
          <select
            value={yearMode}
            onChange={(e) => setYearMode(e.target.value as 'historical' | 'projected')}
            className="px-3 py-1 text-sm border border-slate-300 rounded-md bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
          >
            <option value="historical">Último Histórico ({sectorData.historicalYear})</option>
            <option value="projected">Última Proyección ({sectorData.projectedYear})</option>
          </select>
        </div>
      </div>

      {/* Gráfico */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'pie' ? (
            <PieChart>
              <Pie
                data={currentData}
                cx="50%"
                cy="50%"
                outerRadius={120}
                innerRadius={40}
                dataKey="value"
                label={CustomLabel}
                labelLine={false}
              >
                {currentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={formatTooltip} />
              <Legend />
            </PieChart>
          ) : (
            <BarChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-600" />
              <XAxis 
                dataKey="name" 
                className="text-slate-600 dark:text-slate-300"
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis className="text-slate-600 dark:text-slate-300" />
              <Tooltip formatter={formatTooltip} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {currentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Resumen estadístico */}
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-5 gap-4">
        {currentData.map((sector, index) => (
          <div key={index} className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: sector.color }}
              ></div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {sector.name}
              </span>
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {sector.percentage.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {sector.value.toFixed(0)} {sectorData.unit}
            </div>
          </div>
        ))}
      </div>

      {/* Información adicional */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>
            {yearMode === 'historical' ? `Datos históricos ${currentYear}` : `Proyección para ${currentYear}`}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          <span>
            Total: {currentData.reduce((sum, item) => sum + item.value, 0).toFixed(0)} {sectorData.unit}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3" />
          <span>
            {dataType === 'energy' ? 'Suma anual por sector' : 'Máxima potencia por sector'}
          </span>
        </div>
      </div>
    </div>
  );
}