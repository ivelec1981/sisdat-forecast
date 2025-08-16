'use client'

import React, { useState } from 'react';
import { MapPin, Power, Factory, Gauge } from 'lucide-react';
import MetricCard from '../dashboard/MetricCard';
import { Station, IndustrialLoad } from '@/types/dashboard';
import dynamic from 'next/dynamic'; // ✅ IMPORTACIÓN DINÁMICA

// ✅ IMPORTACIÓN DINÁMICA CON SSR DESACTIVADO
const SimpleMap = dynamic(() => import('../map/SimpleMap'), {
  ssr: false, // Deshabilita el renderizado en el servidor
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-slate-100 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-slate-600">Cargando mapa...</p>
      </div>
    </div>
  )
});

// ✅ DATOS REALES DEL EXCEL - 10 CARGAS PRINCIPALES
const cargasReales = [
  {
    empresa: "CNEL-Bolivar",
    id_cliente_ext: "Curimining S.A",
    lat: -1.3112,
    lng: -79.2442,
    s_e_asociada: "Las Naves",
    nivel_voltaje_kv: 69,
    sector: "D",
    tarifa: "AT_IND",
    demanda_total: 618319.5,
    demanda_maxima: 100764.0,
    years_range: "2027-2035"
  },
  {
    empresa: "E.E. Centro Sur",
    id_cliente_ext: "Minera Loma Larga",
    lat: -3.0311,
    lng: -79.2257,
    s_e_asociada: "SE Propia",
    nivel_voltaje_kv: 69,
    sector: "D",
    tarifa: "AT_IND",
    demanda_total: 536057.9,
    demanda_maxima: 110843.2,
    years_range: "2027-2035"
  },
  {
    empresa: "E.E. Cotopaxi",
    id_cliente_ext: "NOVACERO",
    lat: -0.7881,
    lng: -78.6154,
    s_e_asociada: "MULALO 138KV",
    nivel_voltaje_kv: 138,
    sector: "T",
    tarifa: "TR_OTR",
    demanda_total: 2105493.7,
    demanda_maxima: 211189.3,
    years_range: "2024-2035"
  },
  {
    empresa: "E.E. Sur",
    id_cliente_ext: "AURELIAN ECUADOR S.A.",
    lat: -3.4791,
    lng: -78.5461,
    s_e_asociada: "Bomboiza de Transelectric",
    nivel_voltaje_kv: 230,
    sector: "T",
    tarifa: "TR_IND",
    demanda_total: 1649861.7,
    demanda_maxima: 139737.5,
    years_range: "2024-2035"
  },
  {
    empresa: "E.E. Sur",
    id_cliente_ext: "ECUACORRIENTE S.A.",
    lat: -3.4791,
    lng: -78.5461,
    s_e_asociada: "Bomboiza de Transelectric",
    nivel_voltaje_kv: 230,
    sector: "T",
    tarifa: "TR_IND",
    demanda_total: 12894875.8,
    demanda_maxima: 1155000.0,
    years_range: "2024-2035"
  },
  {
    empresa: "E.E. Quito",
    id_cliente_ext: "AGUA Y GAS SILLUNCHI",
    lat: -0.4763,
    lng: -78.5439,
    s_e_asociada: "EL OBRAJE",
    nivel_voltaje_kv: 22.8,
    sector: "D",
    tarifa: "MT_IND",
    demanda_total: 3066.7,
    demanda_maxima: 3066.0,
    years_range: "2025"
  },
  {
    empresa: "E.E. Quito",
    id_cliente_ext: "ALLPHAHUB",
    lat: -0.1933,
    lng: -78.3393,
    s_e_asociada: "TABABELA",
    nivel_voltaje_kv: 22.8,
    sector: "D",
    tarifa: "MT_IND",
    demanda_total: 35044.0,
    demanda_maxima: 26280.0,
    years_range: "2025-2026"
  },
  {
    empresa: "E.E. Norte",
    id_cliente_ext: "CIUDAD DEL CONOCIMIENTO \"YACHAY\"",
    lat: 0.4017,
    lng: -78.1752,
    s_e_asociada: "BELLAVISTA",
    nivel_voltaje_kv: 69,
    sector: "D",
    tarifa: "MT_OTR",
    demanda_total: 546716.0,
    demanda_maxima: 53315.0,
    years_range: "2024-2035"
  },
  {
    empresa: "CNEL-El Oro",
    id_cliente_ext: "BRAVITO S.A. - (S/E PRIVADA 69KV) - CAMARONERA",
    lat: -3.2776,
    lng: -80.0659,
    s_e_asociada: "ARENILLAS",
    nivel_voltaje_kv: 69,
    sector: "D",
    tarifa: "AT_OTR",
    demanda_total: 128331.0,
    demanda_maxima: 21384.0,
    years_range: "2030-2035"
  },
  {
    empresa: "CNEL-Esmeraldas",
    id_cliente_ext: "EP PETROECUADOR PUERTO BALAO",
    lat: 0.9724,
    lng: -79.6766,
    s_e_asociada: "PRETROCOMERCIAL, Asociana a S/E ESMERALDAS DE TRANSELECTRIC",
    nivel_voltaje_kv: 69,
    sector: "T",
    tarifa: "AT_OTR",
    demanda_total: 202304.1,
    demanda_maxima: 16856.2,
    years_range: "2024-2035"
  }
];

interface TransmissionMapTabProps {
  transmissionData: {
    stations: Station[];
    industrialLoads: IndustrialLoad[];
  };
  selectedStation: Station | null;
  setSelectedStation: (station: Station | null) => void;
}

export default function TransmissionMapTab({ transmissionData }: TransmissionMapTabProps) {
  const [selectedCarga, setSelectedCarga] = useState<any>(null);
  const [voltageFilter, setVoltageFilter] = useState('');

  // Filtrar cargas
  const cargasFiltradas = voltageFilter 
    ? cargasReales.filter(carga => carga.nivel_voltaje_kv.toString() === voltageFilter)
    : cargasReales;

  // Estadísticas
  const totalCargas = cargasReales.length;
  const empresasUnicas = [...new Set(cargasReales.map(c => c.empresa))];
  const demandaTotal = cargasReales.reduce((sum, carga) => sum + carga.demanda_total, 0);
  const voltajesUnicos = [...new Set(cargasReales.map(c => c.nivel_voltaje_kv))].sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Estaciones Activas"
          value={transmissionData?.stations?.length || 5}
          change="Sistema de transmisión"
          changeType="neutral"
          icon={MapPin}
          color="blue"
        />
        <MetricCard
          title="Cargas Singulares"
          value={totalCargas}
          change={`${empresasUnicas.length} empresas`}
          changeType="neutral"
          icon={Factory}
          color="green"
        />
        <MetricCard
          title="Demanda Total"
          value={`${(demandaTotal / 1000000).toFixed(1)} TWh`}
          change="Proyección acumulada real"
          changeType="positive"
          icon={Power}
          color="yellow"
        />
        <MetricCard
          title="Puntos Visibles"
          value={cargasFiltradas.length}
          change={voltageFilter ? "Filtrado" : "Todos"}
          changeType="positive"
          icon={Gauge}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MAPA CON IMPORTACIÓN DINÁMICA */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Mapa de Cargas Singulares - Ecuador
              </h3>
              <p className="text-sm text-slate-600">Datos reales del Excel - {totalCargas} cargas verificadas</p>
            </div>
            
            <select 
              value={voltageFilter}
              onChange={(e) => setVoltageFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="">Todos los voltajes</option>
              {voltajesUnicos.map(voltaje => (
                <option key={voltaje} value={voltaje.toString()}>
                  {voltaje} kV
                </option>
              ))}
            </select>
          </div>
          
          {/* ✅ EL COMPONENTE SE CARGA DINÁMICAMENTE */}
          <SimpleMap 
            cargas={cargasFiltradas}
            onCargaSelect={setSelectedCarga}
          />
        </div>

        {/* Panel lateral */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h4 className="text-lg font-semibold text-slate-900 mb-4">
            {selectedCarga ? 'Información de Carga' : 'Seleccionar Punto'}
          </h4>
          
          {selectedCarga ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600">Cliente</p>
                <p className="font-medium text-slate-900 text-sm">{selectedCarga.id_cliente_ext}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Empresa</p>
                <p className="font-medium text-slate-900">{selectedCarga.empresa}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Subestación</p>
                <p className="font-medium text-slate-900 text-sm">{selectedCarga.s_e_asociada}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-slate-600">Voltaje</p>
                  <p className="font-medium text-slate-900">{selectedCarga.nivel_voltaje_kv} kV</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Sector</p>
                  <p className="font-medium text-slate-900">{selectedCarga.sector}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600">Tarifa</p>
                <p className="font-medium text-slate-900">{selectedCarga.tarifa}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Demanda Máxima</p>
                <p className="font-medium text-blue-600 text-xl">
                  {selectedCarga.demanda_maxima.toLocaleString('es-EC')} MWh
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Período</p>
                <p className="font-medium text-slate-900">{selectedCarga.years_range}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-sm text-green-800 font-medium">✅ Datos verificados del Excel</p>
                <p className="text-xs text-green-600 mt-1">plantilla_migracion_postgres 1.xlsx</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="mx-auto text-slate-400 mb-3" size={48} />
              <p className="text-slate-500">
                Haz clic en un punto del mapa para ver información detallada
              </p>
              <p className="text-xs text-green-600 mt-2">✅ {totalCargas} cargas reales del Excel</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}