'use client';

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Filter, Calendar, TrendingUp } from 'lucide-react';
import { useTrends } from '@/hooks/useTrends';
import { useSystemInfo } from '@/hooks/useSystemInfo';

interface EnhancedTrendChartProps {
  title?: string;
  height?: number;
}

export default function EnhancedTrendChart({ 
  title = "Tendencia de Demanda",
  height = 400 
}: EnhancedTrendChartProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dataType, setDataType] = useState<'energy' | 'power'>('energy');
  const [viewMode, setViewMode] = useState<'monthly' | 'annual' | 'evolution'>('monthly');
  
  const { data: systemInfo } = useSystemInfo();
  const { data: trendsData, loading } = useTrends(
    selectedCategory === 'all' ? undefined : selectedCategory,
    dataType
  );

  const formatValue = (value: number) => {
    if (dataType === 'energy') {
      return `${(value / 1000).toFixed(1)} MW`;
    } else {
      return `${value.toFixed(1)} MW`;
    }
  };

  const getChartData = () => {
    if (!trendsData) return [];

    switch (viewMode) {
      case 'monthly':
        if (dataType === 'power') {
          // Para potencia, mostrar datos anuales (no hay granularidad mensual)
          const allAnnualData = [];
          
          // Agregar todos los datos históricos
          trendsData.monthlyTrends.historical.forEach(item => {
            allAnnualData.push({
              period: item.year.toString(),
              demanda: item.value / 1000,
              type: 'historical',
              sortKey: item.year,
              isHistorical: true
            });
          });

          // Agregar todos los datos proyectados (usar prophet por defecto)
          trendsData.monthlyTrends.projected
            .filter(item => item.model === 'prophet')
            .forEach(item => {
              allAnnualData.push({
                period: item.year.toString(),
                demanda: item.value / 1000,
                type: 'projected',
                sortKey: item.year,
                isHistorical: false
              });
            });

          return allAnnualData.sort((a, b) => a.sortKey - b.sortKey);
        } else {
          // Para energía, usar datos mensuales como antes
          const allMonthlyData = [];
          
          // Agregar todos los datos históricos
          trendsData.monthlyTrends.historical.forEach(item => {
            if (item.month) { // Solo procesar si tiene mes (energía)
              const monthName = new Date(item.year, item.month - 1).toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'short' 
              });
              allMonthlyData.push({
                period: monthName,
                demanda: item.value / 1000,
                type: 'historical',
                sortKey: item.year * 100 + item.month,
                isHistorical: true
              });
            }
          });

          // Agregar todos los datos proyectados (usar prophet por defecto)
          trendsData.monthlyTrends.projected
            .filter(item => item.model === 'prophet' && item.month)
            .forEach(item => {
              const monthName = new Date(item.year, item.month - 1).toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'short' 
              });
              allMonthlyData.push({
                period: monthName,
                demanda: item.value / 1000,
                type: 'projected',
                sortKey: item.year * 100 + item.month,
                isHistorical: false
              });
            });

          return allMonthlyData
            .sort((a, b) => a.sortKey - b.sortKey)
            .slice(-36); // Últimos 36 meses para mayor contexto
        }

      case 'annual':
        // Combinar datos históricos y proyectados como una serie continua
        const allAnnualData = [];
        
        // Agregar todos los datos históricos
        trendsData.annualTrends.historical.forEach(item => {
          allAnnualData.push({
            period: item.year.toString(),
            demanda: item.value / 1000,
            type: 'historical',
            sortKey: item.year,
            isHistorical: true
          });
        });

        // Agregar todos los datos proyectados (usar prophet por defecto)
        trendsData.annualTrends.projected
          .filter(item => item.model === 'prophet')
          .forEach(item => {
            allAnnualData.push({
              period: item.year.toString(),
              demanda: item.value / 1000,
              type: 'projected',
              sortKey: item.year,
              isHistorical: false
            });
          });

        return allAnnualData.sort((a, b) => a.sortKey - b.sortKey);

      case 'evolution':
        return trendsData.last12Months.map(item => ({
          period: dataType === 'power' 
            ? item.year.toString() 
            : new Date(item.year, (item.month || 1) - 1).toLocaleDateString('es-ES', { 
                month: 'short', 
                year: '2-digit' 
              }),
          demanda: item.value / 1000,
          type: item.type,
          sortKey: dataType === 'power' 
            ? item.year 
            : item.year * 100 + (item.month || 1),
          isHistorical: item.type === 'historical'
        })).sort((a, b) => a.sortKey - b.sortKey);

      default:
        return [];
    }
  };

  const chartData = getChartData();

  const formatTooltip = (value: any, name: string, props: any) => {
    const isHistorical = props.payload?.isHistorical;
    const label = isHistorical ? 'Histórico' : 'Proyectado';
    return [`${value.toFixed(1)} MW`, label];
  };

  // Función para crear puntos de datos con colores condicionales
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const color = payload.isHistorical ? '#10B981' : '#3B82F6';
    return <circle cx={cx} cy={cy} r={3} fill={color} stroke={color} strokeWidth={2} />;
  };

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

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      {/* Header con controles */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="flex items-center gap-2 mb-4 lg:mb-0">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          {trendsData && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Corte: {new Date(trendsData.historicalCutoffDate).toLocaleDateString('es-ES')}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Selector de categoría */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1 text-sm border border-slate-300 rounded-md bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
          >
            <option value="all">Todas las categorías</option>
            {systemInfo?.categories.map(cat => (
              <option key={cat.code} value={cat.code}>{cat.name}</option>
            ))}
          </select>

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
            onChange={(e) => setViewMode(e.target.value as 'monthly' | 'annual' | 'evolution')}
            className="px-3 py-1 text-sm border border-slate-300 rounded-md bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
          >
            <option value="monthly">Vista Mensual</option>
            <option value="annual">Vista Anual</option>
            <option value="evolution">Últimos 12 Meses</option>
          </select>
        </div>
      </div>

      {/* Gráfico */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-600" />
            <XAxis 
              dataKey="period" 
              className="text-slate-600 dark:text-slate-300"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              className="text-slate-600 dark:text-slate-300"
              tickFormatter={(value) => `${value.toFixed(0)}`}
            />
            <Tooltip 
              formatter={formatTooltip}
              contentStyle={{
                backgroundColor: 'rgb(248, 250, 252)',
                border: '1px solid rgb(226, 232, 240)',
                borderRadius: '8px'
              }}
            />
            <Legend />
            
            <Line
              type="monotone"
              dataKey="demanda"
              stroke="#10B981"
              strokeWidth={3}
              dot={<CustomDot />}
              name="Demanda"
              connectNulls={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Información adicional */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-green-500"></div>
          <span>Datos Históricos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-blue-500 border-dashed border-t-2"></div>
          <span>Proyecciones (Prophet)</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>Datos hasta: {trendsData && new Date(trendsData.historicalCutoffDate).toLocaleDateString('es-ES')}</span>
        </div>
      </div>
    </div>
  );
}