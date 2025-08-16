'use client';

import React from 'react';
import { CheckCircle, XCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface ModelData {
  name: string;
  displayName: string;
  accuracy: number | null;
  predictions: number;
  lastTrained: string | null;
  isActive: boolean;
  trend?: 'up' | 'down' | 'stable';
}

interface ModelComparisonTableProps {
  models: ModelData[];
  title?: string;
  period?: string;
}

export default function ModelComparisonTable({ 
  models, 
  title = "Comparación de Modelos",
  period = "Período no especificado"
}: ModelComparisonTableProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAccuracyColor = (accuracy: number | null) => {
    if (!accuracy) return 'text-slate-400';
    if (accuracy >= 95) return 'text-green-600 dark:text-green-400';
    if (accuracy >= 90) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full mt-2 lg:mt-0">
          {period}
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-600">
              <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Modelo</th>
              <th className="text-center py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Estado</th>
              <th className="text-center py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Precisión</th>
              <th className="text-center py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Predicciones</th>
              <th className="text-center py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Último Entrenamiento</th>
              <th className="text-center py-3 px-4 font-medium text-slate-900 dark:text-slate-100">Tendencia</th>
            </tr>
          </thead>
          <tbody>
            {models.map((model) => (
              <tr key={model.name} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <td className="py-3 px-4">
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {model.displayName}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {model.name}
                  </div>
                </td>
                <td className="text-center py-3 px-4">
                  <div className="flex justify-center">
                    {getStatusIcon(model.isActive)}
                  </div>
                </td>
                <td className={`text-center py-3 px-4 font-medium ${getAccuracyColor(model.accuracy)}`}>
                  {model.accuracy ? `${model.accuracy.toFixed(2)}%` : 'N/A'}
                </td>
                <td className="text-center py-3 px-4 text-slate-600 dark:text-slate-300">
                  {model.predictions.toLocaleString()}
                </td>
                <td className="text-center py-3 px-4 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDate(model.lastTrained)}
                  </div>
                </td>
                <td className="text-center py-3 px-4">
                  <div className="flex justify-center">
                    {getTrendIcon(model.trend)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {models.length === 0 && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          No hay datos de modelos disponibles
        </div>
      )}
    </div>
  );
}