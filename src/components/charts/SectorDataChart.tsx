'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, TrendingUp, Zap, BarChart3, Factory, Home, Filter, Store, Layers, Lightbulb } from 'lucide-react';
import { useResidentialData } from '@/hooks/useResidentialData';
import { useIndustrialData } from '@/hooks/useIndustrialData';
import { useCommercialData } from '@/hooks/useCommercialData';
import { useOthersData } from '@/hooks/useOthersData';
import { usePublicLightingData } from '@/hooks/usePublicLightingData';

interface SectorDataChartProps {
  title?: string;
  height?: number;
  company?: string;
}

type SectorType = 'residential' | 'industrial' | 'commercial' | 'others' | 'public_lighting';

export default function SectorDataChart({ 
  title = "Datos Reales - CNEL-Guayas Los Ríos", 
  height = 400,
  company = "CNEL-Guayas Los Ríos"
}: SectorDataChartProps) {
  const [selectedSector, setSelectedSector] = useState<SectorType>('residential');
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [viewMode, setViewMode] = useState<'energy' | 'power'>('energy');
  
  // Hooks para todos los sectores
  const { 
    data: residentialData, 
    summary: residentialSummary, 
    loading: residentialLoading 
  } = useResidentialData(company);
  
  const { 
    data: industrialData, 
    summary: industrialSummary, 
    loading: industrialLoading 
  } = useIndustrialData(company);
  
  const { 
    data: commercialData, 
    summary: commercialSummary, 
    loading: commercialLoading 
  } = useCommercialData(company);
  
  const { 
    data: othersData, 
    summary: othersSummary, 
    loading: othersLoading 
  } = useOthersData(company);
  
  const { 
    data: publicLightingData, 
    summary: publicLightingSummary, 
    loading: publicLightingLoading 
  } = usePublicLightingData(company);

  // Datos y estado según el sector seleccionado
  const currentData = selectedSector === 'residential' ? residentialData : 
                     selectedSector === 'industrial' ? industrialData : 
                     selectedSector === 'commercial' ? commercialData : 
                     selectedSector === 'others' ? othersData : publicLightingData;
  const currentSummary = selectedSector === 'residential' ? residentialSummary : 
                        selectedSector === 'industrial' ? industrialSummary : 
                        selectedSector === 'commercial' ? commercialSummary : 
                        selectedSector === 'others' ? othersSummary : publicLightingSummary;
  const currentLoading = selectedSector === 'residential' ? residentialLoading : 
                        selectedSector === 'industrial' ? industrialLoading : 
                        selectedSector === 'commercial' ? commercialLoading : 
                        selectedSector === 'others' ? othersLoading : publicLightingLoading;

  // Configuración visual por sector
  const sectorConfig = {
    residential: {
      icon: Home,
      color: 'blue',
      gradientClass: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
      borderClass: 'border-blue-200 dark:border-blue-700',
      iconColor: 'text-blue-500',
      name: 'Residencial'
    },
    industrial: {
      icon: Factory,
      color: 'amber',
      gradientClass: 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
      borderClass: 'border-amber-200 dark:border-amber-700',
      iconColor: 'text-amber-500',
      name: 'Industrial'
    },
    commercial: {
      icon: Store,
      color: 'emerald',
      gradientClass: 'from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20',
      borderClass: 'border-emerald-200 dark:border-emerald-700',
      iconColor: 'text-emerald-500',
      name: 'Comercial'
    },
    others: {
      icon: Layers,
      color: 'violet',
      gradientClass: 'from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20',
      borderClass: 'border-violet-200 dark:border-violet-700',
      iconColor: 'text-violet-500',
      name: 'Otros'
    },
    public_lighting: {
      icon: Lightbulb,
      color: 'orange',
      gradientClass: 'from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20',
      borderClass: 'border-orange-200 dark:border-orange-700',
      iconColor: 'text-orange-500',
      name: 'Alumbrado Público'
    }
  };

  const config = sectorConfig[selectedSector];
  const Icon = config.icon;

  if (currentLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Icon className={`w-5 h-5 ${config.iconColor} animate-pulse`} />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        </div>
        <div className="flex items-center justify-center h-64">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className={`rounded-full h-8 w-8 border-2 border-${config.color}-500 border-t-transparent`}
          />
        </div>
      </motion.div>
    );
  }

  if (!currentData || currentData.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        </div>
        <div className="text-center text-slate-500 py-8">
          No hay datos disponibles para el sector {config.name.toLowerCase()}
        </div>
      </motion.div>
    );
  }

  // Obtener años únicos para el selector
  const availableYears = Array.from(new Set(currentData.map(d => d.year))).sort((a, b) => b - a);
  
  // Filtrar datos por año seleccionado
  const yearData = currentData
    .filter(d => d.year === selectedYear)
    .sort((a, b) => a.month - b.month);

  // Preparar datos para el gráfico
  const chartData = yearData.map(item => ({
    month: new Date(2000, item.month - 1).toLocaleDateString('es-ES', { month: 'short' }),
    prophet: viewMode === 'energy' ? (item.energy.prophet || 0) / 1000 : item.power.prophet || 0,
    gru: viewMode === 'energy' ? (item.energy.gru || 0) / 1000 : item.power.gru || 0,
    wavenet: viewMode === 'energy' ? (item.energy.wavenet || 0) / 1000 : item.power.wavenet || 0,
    gbr: viewMode === 'energy' ? (item.energy.gbr || 0) / 1000 : item.power.gbr || 0,
    comb: viewMode === 'energy' ? (item.energy.comb || 0) / 1000 : item.power.comb || 0,
  }));

  const unit = viewMode === 'energy' ? 'GWh' : 'MW';
  const isHistorical = selectedYear <= 2024;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow duration-300"
    >
      {/* Header con controles mejorado */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 mb-4 lg:mb-0"
        >
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <Icon className={`w-5 h-5 ${config.iconColor}`} />
          </motion.div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            {title} - Sector {config.name}
          </h3>
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className={`text-xs px-3 py-1 rounded-full font-medium ${
              isHistorical 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            }`}
          >
            {isHistorical ? 'Histórico' : 'Proyectado'}
          </motion.span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-3"
        >
          {/* Selector de sector */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value as SectorType)}
              className={`pl-10 pr-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-${config.color}-500 focus:border-transparent transition-colors`}
            >
              <option value="residential">Residencial</option>
              <option value="industrial">Industrial</option>
              <option value="commercial">Comercial</option>
              <option value="others">Otros</option>
              <option value="public_lighting">Alumbrado Público</option>
            </select>
          </div>

          {/* Selector de año */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className={`pl-10 pr-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-${config.color}-500 focus:border-transparent transition-colors`}
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Selector de tipo de dato */}
          <div className="relative">
            <BarChart3 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'energy' | 'power')}
              className={`pl-10 pr-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-${config.color}-500 focus:border-transparent transition-colors`}
            >
              <option value="energy">Energía (GWh)</option>
              <option value="power">Potencia (MW)</option>
            </select>
          </div>
        </motion.div>
      </div>

      {/* Gráfico con animación */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={selectedSector}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="h-96 relative"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id={`prophetGradient${selectedSector}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id={`combinedGradient${selectedSector}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={selectedSector === 'residential' ? '#8B5CF6' : selectedSector === 'industrial' ? '#F97316' : selectedSector === 'commercial' ? '#10B981' : selectedSector === 'others' ? '#8B5CF6' : '#F97316'} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={selectedSector === 'residential' ? '#8B5CF6' : selectedSector === 'industrial' ? '#F97316' : selectedSector === 'commercial' ? '#10B981' : selectedSector === 'others' ? '#8B5CF6' : '#F97316'} stopOpacity={0}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="currentColor" 
                className="text-slate-200 dark:text-slate-600" 
                opacity={0.5}
              />
              
              <XAxis 
                dataKey="month" 
                stroke="currentColor"
                className="text-slate-600 dark:text-slate-300"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              
              <YAxis 
                stroke="currentColor"
                className="text-slate-600 dark:text-slate-300"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                label={{ 
                  value: unit, 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }}
              />
              
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                  color: '#f8fafc',
                  fontSize: '14px',
                  padding: '12px'
                }}
                formatter={(value: number, name: string) => [
                  `${value.toFixed(2)} ${unit}`,
                  name.charAt(0).toUpperCase() + name.slice(1)
                ]}
                labelStyle={{ color: '#94a3b8', marginBottom: '8px' }}
              />
              
              <Legend 
                wrapperStyle={{ 
                  paddingTop: '20px',
                  fontSize: '14px'
                }}
              />
              
              <Line 
                type="monotone" 
                dataKey="prophet" 
                stroke="#3B82F6" 
                strokeWidth={3}
                name="Prophet"
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: '#3B82F6', strokeWidth: 2, fill: '#ffffff' }}
                fill={`url(#prophetGradient${selectedSector})`}
              />
              
              <Line 
                type="monotone" 
                dataKey="gru" 
                stroke="#10B981" 
                strokeWidth={2}
                name="GRU"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#ffffff' }}
              />
              
              <Line 
                type="monotone" 
                dataKey="wavenet" 
                stroke="#F59E0B" 
                strokeWidth={2}
                name="WaveNet"
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2, fill: '#ffffff' }}
              />
              
              <Line 
                type="monotone" 
                dataKey="gbr" 
                stroke="#EF4444" 
                strokeWidth={2}
                name="GBR"
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#EF4444', strokeWidth: 2, fill: '#ffffff' }}
              />
              
              <Line 
                type="monotone" 
                dataKey="comb" 
                stroke={selectedSector === 'residential' ? '#8B5CF6' : selectedSector === 'industrial' ? '#F97316' : selectedSector === 'commercial' ? '#10B981' : selectedSector === 'others' ? '#8B5CF6' : '#F97316'}
                strokeWidth={4}
                name="Combinado"
                dot={{ fill: selectedSector === 'residential' ? '#8B5CF6' : selectedSector === 'industrial' ? '#F97316' : selectedSector === 'commercial' ? '#10B981' : selectedSector === 'others' ? '#8B5CF6' : '#F97316', strokeWidth: 3, r: 6 }}
                activeDot={{ r: 8, stroke: selectedSector === 'residential' ? '#8B5CF6' : selectedSector === 'industrial' ? '#F97316' : selectedSector === 'commercial' ? '#10B981' : selectedSector === 'others' ? '#8B5CF6' : '#F97316', strokeWidth: 3, fill: '#ffffff' }}
                fill={`url(#combinedGradient${selectedSector})`}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>

      {/* Información adicional mejorada */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`mt-6 p-4 ${config.gradientClass} rounded-xl border ${config.borderClass}`}
      >
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Calendar className={`w-4 h-4 ${config.iconColor}`} />
            <span className="font-medium">Año {selectedYear}</span>
            <span className="text-slate-400">•</span>
            <span>{company}</span>
          </div>
          
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>{chartData.length} registros mensuales</span>
          </div>
          
          {currentSummary && (
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Icon className={`w-4 h-4 ${config.iconColor}`} />
              <span className="font-medium">
                Promedio: {viewMode === 'energy' 
                  ? `${(currentSummary.averageEnergy / 1000).toFixed(1)} GWh` 
                  : `${currentSummary.averagePower.toFixed(1)} MW`}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}