'use client'

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Brain, Target, TrendingUp } from 'lucide-react';
import MetricCard from '../dashboard/MetricCard';
import { ProjectionData } from '@/types/dashboard';

interface ProjectionsTabProps {
  projectionData: ProjectionData;
}

export default function ProjectionsTab({ projectionData }: ProjectionsTabProps) {
  const [selectedModel, setSelectedModel] = useState('Prophet');
  const [selectedSector, setSelectedSector] = useState('residential');

  const models = ['Prophet', 'LSTM', 'GRU', 'BiLSTM', 'Econometric'];
  const sectors = [
    { key: 'residential', label: 'Residencial' },
    { key: 'commercial', label: 'Comercial' },
    { key: 'industrial', label: 'Industrial' },
    { key: 'publicLighting', label: 'Alumbrado Público' },
    { key: 'others', label: 'Otros' }
  ];

  const getModelAccuracy = (model: string) => {
    const accuracies = {
      Prophet: 94.5,
      LSTM: 92.1,
      GRU: 91.8,
      BiLSTM: 93.2,
      Econometric: 87.6
    };
    return accuracies[model as keyof typeof accuracies] || 0;
  };

  const getProjectionTrend = () => {
    const currentValue = projectionData[selectedSector as keyof ProjectionData][selectedModel as keyof typeof projectionData.residential];
    return [
      { year: 2024, value: currentValue * 0.95 },
      { year: 2025, value: currentValue },
      { year: 2026, value: currentValue * 1.05 },
      { year: 2027, value: currentValue * 1.12 },
      { year: 2028, value: currentValue * 1.18 },
      { year: 2029, value: currentValue * 1.25 },
      { year: 2030, value: currentValue * 1.32 }
    ];
  };

  const getModelComparison = () => {
    return models.map(model => ({
      model,
      value: projectionData[selectedSector as keyof ProjectionData][model as keyof typeof projectionData.residential],
      accuracy: getModelAccuracy(model)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Controles de selección */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Modelo de Predicción</label>
            <select 
              value={selectedModel} 
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {models.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Sector</label>
            <select 
              value={selectedSector} 
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {sectors.map(sector => (
                <option key={sector.key} value={sector.key}>{sector.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Métricas del modelo seleccionado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Predicción Actual"
          value={`${projectionData[selectedSector as keyof ProjectionData][selectedModel as keyof typeof projectionData.residential].toFixed(1)} MW`}
          change="Para 2025"
          changeType="neutral"
          icon={Brain}
          color="blue"
        />
        <MetricCard
          title="Precisión del Modelo"
          value={`${getModelAccuracy(selectedModel)}%`}
          change="Validación cruzada"
          changeType="positive"
          icon={Target}
          color="green"
        />
        <MetricCard
          title="Tendencia"
          value="+5.2%"
          change="Crecimiento anual estimado"
          changeType="positive"
          icon={TrendingUp}
          color="yellow"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Proyección temporal */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Proyección {selectedModel} - {sectors.find(s => s.key === selectedSector)?.label}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getProjectionTrend()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} MW`, 'Demanda']} />
              <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Comparación de modelos */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Comparación de Modelos - {sectors.find(s => s.key === selectedSector)?.label}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getModelComparison()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="model" />
              <YAxis />
              <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} MW`, 'Predicción']} />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla detallada */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Matriz de Predicciones por Sector y Modelo</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-900">Sector</th>
                {models.map(model => (
                  <th key={model} className="text-center py-3 px-4 font-medium text-slate-900">{model}</th>
                ))}
                <th className="text-center py-3 px-4 font-medium text-slate-900">Real 2024</th>
              </tr>
            </thead>
            <tbody>
              {sectors.map(sector => (
                <tr key={sector.key} className="border-b border-slate-100">
                  <td className="py-3 px-4 font-medium text-slate-900">{sector.label}</td>
                  {models.map(model => (
                    <td key={model} className="text-center py-3 px-4 text-slate-600">
                      {projectionData[sector.key as keyof ProjectionData][model as keyof typeof projectionData.residential].toFixed(1)}
                    </td>
                  ))}
                  <td className="text-center py-3 px-4 font-medium text-blue-600">
                    {projectionData[sector.key as keyof ProjectionData].Real2024.toFixed(1)}
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