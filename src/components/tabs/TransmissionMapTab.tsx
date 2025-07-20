'use client'

import React from 'react';
import { MapPin, Power, Factory, Gauge } from 'lucide-react';
import MetricCard from '../dashboard/MetricCard';
import { Station, IndustrialLoad } from '@/types/dashboard';

interface TransmissionMapTabProps {
  transmissionData: {
    stations: Station[];
    industrialLoads: IndustrialLoad[];
  };
  selectedStation: Station | null;
  setSelectedStation: (station: Station | null) => void;
}

export default function TransmissionMapTab({ transmissionData, selectedStation, setSelectedStation }: TransmissionMapTabProps) {
  return (
    <div className="space-y-6">
      {/* Métricas del sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Estaciones Activas"
          value={transmissionData?.stations?.length || 5}
          change="2 en mantenimiento"
          changeType="neutral"
          icon={MapPin}
          color="blue"
        />
        <MetricCard
          title="Capacidad Total"
          value="2,450 MW"
          change="+50 MW vs anterior"
          changeType="positive"
          icon={Power}
          color="green"
        />
        <MetricCard
          title="Cargas Industriales"
          value={transmissionData?.industrialLoads?.length || 4}
          change="Monitoreando"
          changeType="neutral"
          icon={Factory}
          color="yellow"
        />
        <MetricCard
          title="Factor de Carga"
          value="78.5%"
          change="+2.1% vs mes anterior"
          changeType="positive"
          icon={Gauge}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mapa placeholder */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Mapa de Transmisión del Ecuador</h3>
          <div className="h-96 bg-slate-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin size={48} className="text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Mapa Interactivo</p>
              <p className="text-slate-500 text-sm">El mapa se cargará dinámicamente en producción</p>
            </div>
          </div>
        </div>

        {/* Panel de información */}
        <div className="space-y-6">
          {/* Estación seleccionada */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Información de Estación</h4>
            {selectedStation ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600">Nombre</p>
                  <p className="font-medium text-slate-900">{selectedStation.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Voltaje</p>
                  <p className="font-medium text-slate-900">{selectedStation.voltage} kV</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Demanda Actual</p>
                  <p className="font-medium text-slate-900">{selectedStation.demand} MW</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Estado</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    selectedStation.status === 'Operativo' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedStation.status}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">Selecciona una estación en el mapa</p>
            )}
          </div>

          {/* Lista de estaciones */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Estaciones de Transmisión</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {transmissionData?.stations?.map((station: Station) => (
                <button
                  key={station.id}
                  onClick={() => setSelectedStation(station)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedStation?.id === station.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-medium text-slate-900 text-sm">{station.name}</div>
                  <div className="text-xs text-slate-600">{station.voltage} kV • {station.demand} MW</div>
                </button>
              )) || (
                <p className="text-slate-500 text-sm">Cargando estaciones...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}