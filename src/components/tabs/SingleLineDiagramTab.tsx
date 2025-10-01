'use client'

import React, { useState, useMemo } from 'react';
import { Activity, Zap, Settings, AlertTriangle, Map as MapIcon, List, Filter, Network } from 'lucide-react';
import MetricCard from '../dashboard/MetricCard';
import dynamic from 'next/dynamic';

// Lazy load del mapa para mejor performance
const EmpresasElectricasMapWithLeaflet = dynamic(
  () => import('../map/EmpresasElectricasMapWithLeaflet'),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 bg-slate-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando mapa de cargas singulares...</p>
        </div>
      </div>
    )
  }
);

// Lazy load del diagrama unifilar
const ElectricalDiagram = dynamic(
  () => import('../electrical/ElectricalDiagram'),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 bg-slate-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando diagrama unifilar...</p>
        </div>
      </div>
    )
  }
);

export default function SingleLineDiagramTab() {
  const [selectedEmpresa, setSelectedEmpresa] = useState<string | null>(null);
  const [selectedCarga, setSelectedCarga] = useState<any | null>(null);
  const [showCargas, setShowCargas] = useState(true);
  const [viewMode, setViewMode] = useState<'diagram' | 'map' | 'list'>('diagram');
  const [filtroEmpresa, setFiltroEmpresa] = useState<string>('todas');

  // Datos de cargas singulares (ya están en el componente del mapa)
  const cargasSingulares = useMemo(() => [
    {
      empresa: "CNEL-Bolivar",
      id_cliente_ext: "Curimining S.A",
      lat: -1.4167,
      lng: -79.1833,
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
      lat: -2.8167,
      lng: -79.0833,
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
      lat: -0.7833,
      lng: -78.6167,
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
      lat: -3.5833,
      lng: -78.4167,
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
      lat: -3.6167,
      lng: -78.5833,
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
      lat: -0.4667,
      lng: -78.5333,
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
      lat: -0.1833,
      lng: -78.3500,
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
      lat: 0.3833,
      lng: -78.1667,
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
      lat: -3.2833,
      lng: -80.0833,
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
      lat: 0.9500,
      lng: -79.6500,
      s_e_asociada: "PRETROCOMERCIAL, Asociana a S/E ESMERALDAS DE TRANSELECTRIC",
      nivel_voltaje_kv: 69,
      sector: "T",
      tarifa: "AT_OTR",
      demanda_total: 202304.1,
      demanda_maxima: 16856.2,
      years_range: "2024-2035"
    }
  ], []);

  // Calcular métricas
  const metrics = useMemo(() => {
    const cargasFiltradas = filtroEmpresa === 'todas'
      ? cargasSingulares
      : cargasSingulares.filter(c => c.empresa === filtroEmpresa);

    const totalDemandaMaxima = cargasFiltradas.reduce((sum, c) => sum + c.demanda_maxima, 0);
    const totalDemandaTotal = cargasFiltradas.reduce((sum, c) => sum + c.demanda_total, 0);
    const avgVoltaje = cargasFiltradas.reduce((sum, c) => sum + c.nivel_voltaje_kv, 0) / cargasFiltradas.length;

    return {
      totalCargas: cargasFiltradas.length,
      demandaMaxima: totalDemandaMaxima,
      demandaTotal: totalDemandaTotal,
      voltajePromedio: avgVoltaje
    };
  }, [cargasSingulares, filtroEmpresa]);

  const empresasUnicas = useMemo(() => {
    const empresas = [...new Set(cargasSingulares.map(c => c.empresa))].sort();
    return empresas;
  }, [cargasSingulares]);

  const cargasFiltradas = useMemo(() => {
    return filtroEmpresa === 'todas'
      ? cargasSingulares
      : cargasSingulares.filter(c => c.empresa === filtroEmpresa);
  }, [cargasSingulares, filtroEmpresa]);

  return (
    <div className="space-y-6">
      {/* Métricas del sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Cargas Singulares"
          value={metrics.totalCargas.toString()}
          change={`${filtroEmpresa === 'todas' ? 'Total nacional' : filtroEmpresa}`}
          changeType="neutral"
          icon={Zap}
          color="blue"
        />
        <MetricCard
          title="Demanda Máxima"
          value={`${(metrics.demandaMaxima / 1000).toFixed(1)} MW`}
          change="Pico de consumo"
          changeType="positive"
          icon={Activity}
          color="green"
        />
        <MetricCard
          title="Demanda Total"
          value={`${(metrics.demandaTotal / 1000000).toFixed(2)} GWh`}
          change="Consumo proyectado"
          changeType="neutral"
          icon={Settings}
          color="yellow"
        />
        <MetricCard
          title="Voltaje Promedio"
          value={`${metrics.voltajePromedio.toFixed(0)} kV`}
          change="Nivel de tensión"
          changeType="neutral"
          icon={AlertTriangle}
          color="purple"
        />
      </div>

      {/* Controles */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2 items-center flex-wrap">
            <Filter size={20} className="text-slate-600" />
            <select
              value={filtroEmpresa}
              onChange={(e) => setFiltroEmpresa(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todas">Todas las empresas</option>
              {empresasUnicas.map(empresa => (
                <option key={empresa} value={empresa}>{empresa}</option>
              ))}
            </select>

            <button
              onClick={() => setShowCargas(!showCargas)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                showCargas
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {showCargas ? 'Ocultar' : 'Mostrar'} Cargas
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('diagram')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                viewMode === 'diagram'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              <Network size={16} />
              Diagrama
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                viewMode === 'map'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              <MapIcon size={16} />
              Mapa
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              <List size={16} />
              Lista
            </button>
          </div>
        </div>
      </div>

      {/* Diagrama Unifilar, Mapa o Lista */}
      {viewMode === 'diagram' ? (
        <ElectricalDiagram />
      ) : viewMode === 'map' ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <MapIcon size={20} className="text-blue-600" />
            Mapa de Cargas Singulares
          </h3>

          <div className="rounded-lg overflow-hidden border border-slate-200">
            <EmpresasElectricasMapWithLeaflet
              showCargas={showCargas}
              onEmpresaSelect={setSelectedEmpresa}
              onCargaSelect={setSelectedCarga}
              selectedEmpresa={selectedEmpresa}
              selectedCarga={selectedCarga?.id_cliente_ext}
              cargasData={cargasFiltradas}
            />
          </div>

          {selectedCarga && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">
                {selectedCarga.id_cliente_ext}
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Empresa:</span>
                  <p className="text-blue-900">{selectedCarga.empresa}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Subestación:</span>
                  <p className="text-blue-900">{selectedCarga.s_e_asociada}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Voltaje:</span>
                  <p className="text-blue-900">{selectedCarga.nivel_voltaje_kv} kV</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Demanda Máx:</span>
                  <p className="text-blue-900">{selectedCarga.demanda_maxima.toLocaleString('es-EC')} MW</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <List size={20} className="text-blue-600" />
            Listado de Cargas Singulares
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-300 bg-slate-50">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Cliente</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Empresa</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Subestación</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-900">Voltaje</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-900">Sector</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">Demanda Máx</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">Demanda Total</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-900">Período</th>
                </tr>
              </thead>
              <tbody>
                {cargasFiltradas.map((carga, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-100 hover:bg-blue-50 cursor-pointer transition"
                    onClick={() => setSelectedCarga(carga)}
                  >
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {carga.id_cliente_ext}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {carga.empresa}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {carga.s_e_asociada}
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        carga.nivel_voltaje_kv >= 138
                          ? 'bg-red-100 text-red-800'
                          : carga.nivel_voltaje_kv >= 69
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {carga.nivel_voltaje_kv} kV
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        carga.sector === 'T'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {carga.sector === 'T' ? 'Transmisión' : 'Distribución'}
                      </span>
                    </td>
                    <td className="text-right py-3 px-4 text-slate-900 font-medium">
                      {(carga.demanda_maxima / 1000).toFixed(2)} MW
                    </td>
                    <td className="text-right py-3 px-4 text-slate-700">
                      {(carga.demanda_total / 1000).toFixed(1)} MWh
                    </td>
                    <td className="text-center py-3 px-4 text-slate-600 text-xs">
                      {carga.years_range}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-50 font-semibold">
                  <td colSpan={5} className="py-3 px-4 text-right text-slate-900">
                    Total ({cargasFiltradas.length} cargas):
                  </td>
                  <td className="text-right py-3 px-4 text-blue-900">
                    {(cargasFiltradas.reduce((sum, c) => sum + c.demanda_maxima, 0) / 1000).toFixed(2)} MW
                  </td>
                  <td className="text-right py-3 px-4 text-blue-900">
                    {(cargasFiltradas.reduce((sum, c) => sum + c.demanda_total, 0) / 1000).toFixed(1)} MWh
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {cargasFiltradas.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Activity size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No hay cargas para mostrar</p>
              <p className="text-sm mt-2">Selecciona otra empresa o muestra todas</p>
            </div>
          )}
        </div>
      )}

      {/* Panel de Detalles de Carga Seleccionada */}
      {selectedCarga && viewMode === 'list' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Zap size={20} className="text-amber-600" />
            Detalles de Carga Singular
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-blue-600 font-medium text-sm mb-1">Cliente</div>
              <div className="text-blue-900 font-semibold text-lg">{selectedCarga.id_cliente_ext}</div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-green-600 font-medium text-sm mb-1">Empresa Distribuidora</div>
              <div className="text-green-900 font-semibold">{selectedCarga.empresa}</div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="text-purple-600 font-medium text-sm mb-1">Subestación Asociada</div>
              <div className="text-purple-900 font-semibold">{selectedCarga.s_e_asociada}</div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="text-orange-600 font-medium text-sm mb-1">Nivel de Voltaje</div>
              <div className="text-orange-900 font-semibold text-2xl">{selectedCarga.nivel_voltaje_kv} kV</div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-red-600 font-medium text-sm mb-1">Demanda Máxima</div>
              <div className="text-red-900 font-semibold text-2xl">
                {(selectedCarga.demanda_maxima / 1000).toFixed(2)} MW
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <div className="text-amber-600 font-medium text-sm mb-1">Demanda Total</div>
              <div className="text-amber-900 font-semibold text-2xl">
                {(selectedCarga.demanda_total / 1000000).toFixed(2)} GWh
              </div>
            </div>

            <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
              <div className="text-teal-600 font-medium text-sm mb-1">Sector</div>
              <div className="text-teal-900 font-semibold">
                {selectedCarga.sector === 'T' ? 'Transmisión' : 'Distribución'}
              </div>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <div className="text-indigo-600 font-medium text-sm mb-1">Tarifa</div>
              <div className="text-indigo-900 font-semibold">{selectedCarga.tarifa}</div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="text-slate-600 font-medium text-sm mb-1">Período de Proyección</div>
              <div className="text-slate-900 font-semibold">{selectedCarga.years_range}</div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => {
                setViewMode('map');
                setTimeout(() => {
                  const mapElement = document.querySelector('.leaflet-container');
                  if (mapElement) {
                    mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }, 100);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <MapIcon size={16} />
              Ver en Mapa
            </button>
            <button
              onClick={() => setSelectedCarga(null)}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
            >
              Cerrar Detalles
            </button>
          </div>
        </div>
      )}

      {/* Estadísticas Adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por Voltaje */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h4 className="text-lg font-semibold text-slate-900 mb-4">Distribución por Nivel de Voltaje</h4>
          <div className="space-y-3">
            {(() => {
              const voltajes = cargasFiltradas.reduce((acc, carga) => {
                const key = `${carga.nivel_voltaje_kv} kV`;
                if (!acc[key]) {
                  acc[key] = { count: 0, demanda: 0, voltaje: carga.nivel_voltaje_kv };
                }
                acc[key].count++;
                acc[key].demanda += carga.demanda_maxima;
                return acc;
              }, {} as Record<string, { count: number; demanda: number; voltaje: number }>);

              return Object.entries(voltajes)
                .sort((a, b) => b[1].voltaje - a[1].voltaje)
                .map(([nivel, data]) => (
                  <div key={nivel} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        data.voltaje >= 138 ? 'bg-red-500' :
                        data.voltaje >= 69 ? 'bg-orange-500' :
                        'bg-yellow-500'
                      }`}></div>
                      <div>
                        <p className="font-medium text-slate-900">{nivel}</p>
                        <p className="text-sm text-slate-600">{data.count} cargas</p>
                      </div>
                    </div>
                    <span className="text-slate-700 font-semibold">
                      {(data.demanda / 1000).toFixed(1)} MW
                    </span>
                  </div>
                ));
            })()}
          </div>
        </div>

        {/* Top Cargas por Demanda */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h4 className="text-lg font-semibold text-slate-900 mb-4">Top 5 Cargas por Demanda Máxima</h4>
          <div className="space-y-3">
            {[...cargasFiltradas]
              .sort((a, b) => b.demanda_maxima - a.demanda_maxima)
              .slice(0, 5)
              .map((carga, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-blue-50 cursor-pointer transition"
                  onClick={() => setSelectedCarga(carga)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{carga.id_cliente_ext}</p>
                      <p className="text-xs text-slate-600">{carga.empresa}</p>
                    </div>
                  </div>
                  <span className="text-blue-700 font-bold">
                    {(carga.demanda_maxima / 1000).toFixed(1)} MW
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}