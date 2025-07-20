'use client'

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Zap, TrendingUp, Activity, Database } from 'lucide-react';
import MetricCard from '../dashboard/MetricCard';
import { ProjectionData } from '@/types/dashboard';

interface OverviewTabProps {
  projectionData: ProjectionData;
}

export default function OverviewTab({ projectionData }: OverviewTabProps) {
  const totalDemand = Object.values(projectionData).reduce((sum, sector) => sum + sector.Prophet, 0);
  
  const sectorData = [
    { name: 'Residencial', value: projectionData.residential.Prophet, color: '#3B82F6' },
    { name: 'Comercial', value: projectionData.commercial.Prophet, color: '#10B981' },
    { name: 'Industrial', value: projectionData.industrial.Prophet, color: '#F59E0B' },
    { name: 'Alumbrado', value: projectionData.publicLighting.Prophet, color: '#EF4444' },
    { name: 'Otros', value: projectionData.others.Prophet, color: '#8B5CF6' }
  ];

  const trendData = [
    { month: 'Ene', demand: 8500 },
    { month: 'Feb', demand: 8650 },
    { month: 'Mar', demand: 8800 },
    { month: 'Abr', demand: 8750 },
    { month: 'May', demand: 8900 },
    { month: 'Jun', demand: 9100 },
  ];

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Demanda Total"
          value={`${totalDemand.toFixed(1)} MW`}
          change="+5.2% vs anterior"
          changeType="positive"
          icon={Zap}
          color="blue"
        />
        <MetricCard
          title="Precisión Modelo"
          value="94.5%"
          change="+1.2% vs anterior"
          changeType="positive"
          icon={TrendingUp}
          color="green"
        />
        <MetricCard
          title="Estaciones Activas"
          value="156"
          change="2 en mantenimiento"
          changeType="neutral"
          icon={Activity}
          color="yellow"
        />
        <MetricCard
          title="Datos Procesados"
          value="2.4M"
          change="Última actualización: 10:30"
          changeType="neutral"
          icon={Database}
          color="blue"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendencia mensual */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Tendencia de Demanda 2024</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="demand" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución por sector */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Demanda por Sector (MW)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sectorData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resumen de modelos */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Resumen de Predicciones por Modelo</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-900">Sector</th>
                <th className="text-center py-3 px-4 font-medium text-slate-900">Prophet</th>
                <th className="text-center py-3 px-4 font-medium text-slate-900">LSTM</th>
                <th className="text-center py-3 px-4 font-medium text-slate-900">Real 2024</th>
                <th className="text-center py-3 px-4 font-medium text-slate-900">Diferencia</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(projectionData).map(([sector, data]) => (
                <tr key={sector} className="border-b border-slate-100">
                  <td className="py-3 px-4 font-medium text-slate-900 capitalize">
                    {sector === 'publicLighting' ? 'Alumbrado Público' : sector}
                  </td>
                  <td className="text-center py-3 px-4 text-slate-600">{data.Prophet.toFixed(1)}</td>
                  <td className="text-center py-3 px-4 text-slate-600">{data.LSTM.toFixed(1)}</td>
                  <td className="text-center py-3 px-4 text-slate-600">{data.Real2024.toFixed(1)}</td>
                  <td className="text-center py-3 px-4">
                    <span className={`font-medium ${data.Prophet > data.Real2024 ? 'text-red-600' : 'text-green-600'}`}>
                      {((data.Prophet - data.Real2024) / data.Real2024 * 100).toFixed(1)}%
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