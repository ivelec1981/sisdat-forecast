'use client'

import React from 'react';
import { Activity, Zap, Settings, AlertTriangle } from 'lucide-react';
import MetricCard from '../dashboard/MetricCard';

export default function SingleLineDiagramTab() {
  return (
    <div className="space-y-6">
      {/* Métricas del sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Generación Total"
          value="1,275 MW"
          change="+125 MW disponible"
          changeType="positive"
          icon={Zap}
          color="green"
        />
        <MetricCard
          title="Carga del Sistema"
          value="1,150 MW"
          change="90.2% de capacidad"
          changeType="neutral"
          icon={Activity}
          color="blue"
        />
        <MetricCard
          title="Transformadores"
          value="8/10"
          change="2 en mantenimiento"
          changeType="neutral"
          icon={Settings}
          color="yellow"
        />
        <MetricCard
          title="Alertas Activas"
          value="3"
          change="1 crítica"
          changeType="negative"
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Diagrama unifilar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Diagrama Unifilar del Sistema Nacional Interconectado</h3>
        
        {/* Placeholder del diagrama */}
        <div className="h-96 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
          <div className="text-center">
            <Activity size={48} className="text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Diagrama Unifilar Interactivo</p>
            <p className="text-slate-500 text-sm">Sistema de visualización en desarrollo</p>
            <p className="text-slate-500 text-xs mt-2">Mostrará: Generadores • Transformadores • Líneas de Transmisión • Cargas</p>
          </div>
        </div>
      </div>

      {/* Componentes del sistema */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generadores */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h4 className="text-lg font-semibold text-slate-900 mb-4">Generadores Principales</h4>
          <div className="space-y-3">
            {[
              { name: 'Hidroeléctrica Paute', capacity: 1075, status: 'Operativo', type: 'Hidro' },
              { name: 'Termoeléctrica Trinitaria', capacity: 130, status: 'Operativo', type: 'Térmica' },
              { name: 'Eólica Villonaco', capacity: 16.5, status: 'Operativo', type: 'Eólica' },
              { name: 'Solar El Aromo', capacity: 50, status: 'Mantenimiento', type: 'Solar' }
            ].map((gen, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">{gen.name}</p>
                  <p className="text-sm text-slate-600">{gen.capacity} MW • {gen.type}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  gen.status === 'Operativo' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {gen.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cargas principales */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h4 className="text-lg font-semibold text-slate-900 mb-4">Cargas Principales</h4>
          <div className="space-y-3">
            {[
              { name: 'Carga Quito', demand: 450, type: 'Urbana', voltage: 138 },
              { name: 'Carga Guayaquil', demand: 380, type: 'Urbana', voltage: 138 },
              { name: 'Carga Cuenca', demand: 120, type: 'Urbana', voltage: 69 },
              { name: 'Carga Industrial', demand: 200, type: 'Industrial', voltage: 138 }
            ].map((load, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">{load.name}</p>
                  <p className="text-sm text-slate-600">{load.demand} MW • {load.voltage} kV</p>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {load.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Estado de líneas de transmisión */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h4 className="text-lg font-semibold text-slate-900 mb-4">Líneas de Transmisión</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-900">Línea</th>
                <th className="text-center py-3 px-4 font-medium text-slate-900">Voltaje</th>
                <th className="text-center py-3 px-4 font-medium text-slate-900">Longitud</th>
                <th className="text-center py-3 px-4 font-medium text-slate-900">Capacidad</th>
                <th className="text-center py-3 px-4 font-medium text-slate-900">Estado</th>
              </tr>
            </thead>
            <tbody>
              {[
                { from: 'Paute', to: 'Quito', voltage: 230, length: 400, capacity: 600, status: 'Operativo' },
                { from: 'Quito', to: 'Guayaquil', voltage: 230, length: 420, capacity: 800, status: 'Operativo' },
                { from: 'Guayaquil', to: 'Cuenca', voltage: 138, length: 180, capacity: 300, status: 'Mantenimiento' }
              ].map((line, idx) => (
                <tr key={idx} className="border-b border-slate-100">
                  <td className="py-3 px-4 font-medium text-slate-900">{line.from} - {line.to}</td>
                  <td className="text-center py-3 px-4 text-slate-600">{line.voltage} kV</td>
                  <td className="text-center py-3 px-4 text-slate-600">{line.length} km</td>
                  <td className="text-center py-3 px-4 text-slate-600">{line.capacity} MW</td>
                  <td className="text-center py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      line.status === 'Operativo' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {line.status}
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