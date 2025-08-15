'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface ModelAccuracyData {
  model: string;
  accuracy: number;
  predictions: number;
  displayName?: string;
}

interface ModelAccuracyChartProps {
  data: ModelAccuracyData[];
  title?: string;
  type?: 'bar' | 'line';
  period?: string;
}

export default function ModelAccuracyChart({ 
  data, 
  title = "Precisión de Modelos",
  type = 'bar',
  period = "Período no especificado"
}: ModelAccuracyChartProps) {
  const formatTooltip = (value: any, name: string) => {
    if (name === 'accuracy') {
      return [`${value.toFixed(2)}%`, 'Precisión'];
    }
    if (name === 'predictions') {
      return [value, 'Predicciones'];
    }
    return [value, name];
  };

  const formatLabel = (label: string) => {
    const modelNames: Record<string, string> = {
      'prophet': 'Prophet',
      'lstm': 'LSTM',
      'gru': 'GRU',
      'wavenet': 'WaveNet',
      'gbr': 'GBR',
      'comb': 'Combinado'
    };
    return modelNames[label.toLowerCase()] || label;
  };

  if (type === 'line') {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full mt-2 lg:mt-0">
            {period}
          </span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-600" />
            <XAxis 
              dataKey="model" 
              className="text-slate-600 dark:text-slate-300"
              tickFormatter={formatLabel}
            />
            <YAxis 
              className="text-slate-600 dark:text-slate-300"
              domain={[0, 100]}
            />
            <Tooltip 
              formatter={formatTooltip}
              labelFormatter={formatLabel}
              contentStyle={{
                backgroundColor: 'rgb(248, 250, 252)',
                border: '1px solid rgb(226, 232, 240)',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="accuracy" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full mt-2 lg:mt-0">
          {period}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-600" />
          <XAxis 
            dataKey="model" 
            className="text-slate-600 dark:text-slate-300"
            tickFormatter={formatLabel}
          />
          <YAxis 
            className="text-slate-600 dark:text-slate-300"
            domain={[0, 100]}
          />
          <Tooltip 
            formatter={formatTooltip}
            labelFormatter={formatLabel}
            contentStyle={{
              backgroundColor: 'rgb(248, 250, 252)',
              border: '1px solid rgb(226, 232, 240)',
              borderRadius: '8px'
            }}
          />
          <Bar 
            dataKey="accuracy" 
            fill="#3B82F6"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}