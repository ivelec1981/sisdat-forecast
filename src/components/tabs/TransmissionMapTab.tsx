'use client'

import React, { useState, useMemo } from 'react';
import { MapPin, Power, Factory, Gauge, Filter, X } from 'lucide-react';
import MetricCard from '../dashboard/MetricCard';
import { Station, IndustrialLoad } from '@/types/dashboard';
import EmpresasElectricasMapWithLeaflet from '../map/EmpresasElectricasMapWithLeaflet';

// ✅ DATOS REALES DEL EXCEL - 10 CARGAS PRINCIPALES
const cargasReales = [
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
  const [selectedEmpresa, setSelectedEmpresa] = useState<any>(null);
  const [selectedCarga, setSelectedCarga] = useState<any>(null);
  const [activeLayer, setActiveLayer] = useState<'empresa' | 'carga' | null>(null);
  
  // Filter states
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState({
    voltajeMin: 0,
    voltajeMax: 1000,
    demandaMin: 0,
    demandaMax: 2000000,
    empresa: '',
    sector: '',
    tarifa: ''
  });

  // Reset filters function
  const resetFiltros = () => {
    setFiltros({
      voltajeMin: 0,
      voltajeMax: 1000,
      demandaMin: 0,
      demandaMax: 2000000,
      empresa: '',
      sector: '',
      tarifa: ''
    });
  };

  // Datos de empresas eléctricas
  const empresasData = [
    { id: 'EME', nombre: 'EMELNORTE', potencia: '102 MW', region: 'Norte', clientes: 425000 },
    { id: 'RSU', nombre: 'E.E. REGIONAL SUR', potencia: '145 MW', region: 'Sur', clientes: 180000 },
    { id: 'QUI', nombre: 'E.E. QUITO', potencia: '671 MW', region: 'Pichincha', clientes: 1200000 },
    { id: 'LRI', nombre: 'CNEL LOS RÍOS', potencia: '76 MW', region: 'Los Ríos', clientes: 320000 },
    { id: 'ORO', nombre: 'CNEL EL ORO', potencia: '236 MW', region: 'El Oro', clientes: 640000 },
    { id: 'COT', nombre: 'ELEPCO', potencia: '107 MW', region: 'Cotopaxi', clientes: 280000 },
    { id: 'RIO', nombre: 'E.E. RIOBAMBA', potencia: '63 MW', region: 'Chimborazo', clientes: 190000 },
    { id: 'BOL', nombre: 'CNEL LOS BOLÍVAR', potencia: '13 MW', region: 'Bolívar', clientes: 85000 },
    { id: 'MAN', nombre: 'CNEL MANABÍ', potencia: '311 MW', region: 'Manabí', clientes: 780000 },
    { id: 'AMB', nombre: 'E.E. AMBATO', potencia: '112 MW', region: 'Tungurahua', clientes: 350000 },
    { id: 'ESM', nombre: 'CNEL ESMERALDAS', potencia: '91 MW', region: 'Esmeraldas', clientes: 240000 },
    { id: 'SEL', nombre: 'CNEL SANTA ELENA', potencia: '77 MW', region: 'Santa Elena', clientes: 165000 },
    { id: 'GYE', nombre: 'CNEL GUAYAQUIL', potencia: '864 MW', region: 'Guayas', clientes: 2100000 },
    { id: 'MIL', nombre: 'CNEL MILAGRO', potencia: '149 MW', region: 'Guayas', clientes: 385000 },
    { id: 'GAL', nombre: 'ELECGALÁPAGOS', potencia: '25 MW', region: 'Galápagos', clientes: 32000 },
    { id: 'SDO', nombre: 'CNEL SANTO DOMINGO', potencia: '121 MW', region: 'Santo Domingo', clientes: 415000 },
    { id: 'SUC', nombre: 'CNEL SUCUMBÍOS', potencia: '116 MW', region: 'Sucumbíos', clientes: 195000 },
    { id: 'CSU', nombre: 'E.E. CENTRO SUR', potencia: '176 MW', region: 'Azuay-Cañar', clientes: 485000 },
    { id: 'AZO', nombre: 'E.E. AZOGUES', potencia: '14 MW', region: 'Cañar', clientes: 68000 },
    { id: 'GLR', nombre: 'CNEL GUAYAS LOS RÍOS', potencia: '538 MW', region: 'Guayas-Los Ríos', clientes: 965000 }
  ];

  // Datos de cargas singulares con filtrado
  const cargasDataOriginal = [
    { empresa: "CNEL-Bolivar", id_cliente_ext: "Curimining S.A", demanda_maxima: 100764.0, nivel_voltaje_kv: 69, sector: "D", tarifa: "AT_IND" },
    { empresa: "E.E. Centro Sur", id_cliente_ext: "Minera Loma Larga", demanda_maxima: 110843.2, nivel_voltaje_kv: 69, sector: "D", tarifa: "AT_IND" },
    { empresa: "E.E. Cotopaxi", id_cliente_ext: "NOVACERO", demanda_maxima: 211189.3, nivel_voltaje_kv: 138, sector: "T", tarifa: "TR_OTR" },
    { empresa: "E.E. Sur", id_cliente_ext: "AURELIAN ECUADOR S.A.", demanda_maxima: 139737.5, nivel_voltaje_kv: 230, sector: "T", tarifa: "TR_IND" },
    { empresa: "E.E. Sur", id_cliente_ext: "ECUACORRIENTE S.A.", demanda_maxima: 1155000.0, nivel_voltaje_kv: 230, sector: "T", tarifa: "TR_IND" },
    { empresa: "E.E. Quito", id_cliente_ext: "AGUA Y GAS SILLUNCHI", demanda_maxima: 3066.0, nivel_voltaje_kv: 22.8, sector: "D", tarifa: "MT_IND" },
    { empresa: "E.E. Quito", id_cliente_ext: "ALLPHAHUB", demanda_maxima: 26280.0, nivel_voltaje_kv: 22.8, sector: "D", tarifa: "MT_IND" },
    { empresa: "E.E. Norte", id_cliente_ext: "CIUDAD DEL CONOCIMIENTO \"YACHAY\"", demanda_maxima: 53315.0, nivel_voltaje_kv: 69, sector: "D", tarifa: "MT_OTR" },
    { empresa: "CNEL-El Oro", id_cliente_ext: "BRAVITO S.A. - (S/E PRIVADA 69KV) - CAMARONERA", demanda_maxima: 21384.0, nivel_voltaje_kv: 69, sector: "D", tarifa: "AT_OTR" },
    { empresa: "CNEL-Esmeraldas", id_cliente_ext: "EP PETROECUADOR PUERTO BALAO", demanda_maxima: 16856.2, nivel_voltaje_kv: 69, sector: "T", tarifa: "AT_OTR" }
  ];

  // Apply filters
  const cargasData = useMemo(() => {
    return cargasDataOriginal.filter(carga => {
      return (
        carga.nivel_voltaje_kv >= filtros.voltajeMin &&
        carga.nivel_voltaje_kv <= filtros.voltajeMax &&
        carga.demanda_maxima >= filtros.demandaMin &&
        carga.demanda_maxima <= filtros.demandaMax &&
        (filtros.empresa === '' || carga.empresa.toLowerCase().includes(filtros.empresa.toLowerCase())) &&
        (filtros.sector === '' || carga.sector === filtros.sector) &&
        (filtros.tarifa === '' || carga.tarifa === filtros.tarifa)
      );
    });
  }, [filtros]);

  // Convert filtered data to map format
  const cargasParaMapa = useMemo(() => {
    return cargasData.map(carga => {
      // Find the corresponding carga with lat/lng from cargasReales
      const cargaCompleta = cargasReales.find(cr => cr.id_cliente_ext === carga.id_cliente_ext);
      return cargaCompleta || {
        ...carga,
        lat: 0, // Default lat if not found
        lng: 0, // Default lng if not found
        s_e_asociada: 'N/A',
        demanda_total: carga.demanda_maxima * 8760, // Estimate annual from max
        years_range: '2024-2035'
      };
    });
  }, [cargasData]);

  // Get unique values for filter dropdowns
  const empresasUnicas = useMemo(() => 
    [...new Set(cargasDataOriginal.map(c => c.empresa))].sort(),
    []
  );

  const sectoresUnicos = useMemo(() => 
    [...new Set(cargasDataOriginal.map(c => c.sector))].sort(),
    []
  );

  const tarifasUnicas = useMemo(() => 
    [...new Set(cargasDataOriginal.map(c => c.tarifa))].sort(),
    []
  );

  // Handlers para selección
  const handleEmpresaSelect = (empresa: any) => {
    // Buscar la empresa completa en nuestros datos locales usando el ID
    const empresaCompleta = empresasData.find(e => e.id === empresa.id);
    setSelectedEmpresa(empresaCompleta || empresa);
    setSelectedCarga(null);
    setActiveLayer('empresa');
  };

  const handleCargaSelect = (carga: any) => {
    setSelectedCarga(carga);
    setSelectedEmpresa(null);
    setActiveLayer('carga');
  };

  // Estadísticas
  const totalEmpresas = empresasData.length;
  const totalCargas = cargasData.length;
  const potenciaTotal = empresasData.reduce((sum, empresa) => {
    const potencia = parseInt(empresa.potencia.replace(' MW', ''));
    return sum + potencia;
  }, 0);
  const demandaTotal = cargasData.reduce((sum, carga) => sum + carga.demanda_maxima, 0);
  const clientesTotal = empresasData.reduce((sum, empresa) => sum + empresa.clientes, 0);
  const regionesUnicas = [...new Set(empresasData.map(e => e.region))].length;

  return (
    <div className="space-y-6">
      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Empresas Eléctricas"
          value={totalEmpresas}
          change="Distribuidoras activas"
          changeType="neutral"
          icon={Factory}
          color="blue"
        />
        <MetricCard
          title="Cargas Singulares"
          value={totalCargas}
          change="Grandes consumidores"
          changeType="positive"
          icon={Power}
          color="green"
        />
        <MetricCard
          title="Demanda Singular"
          value={`${(demandaTotal / 1000).toFixed(0)} GW`}
          change="Cargas especiales"
          changeType="positive"
          icon={MapPin}
          color="yellow"
        />
        <MetricCard
          title="Capa Activa"
          value={activeLayer === 'empresa' ? 'Empresa' : activeLayer === 'carga' ? 'Carga' : 'Ninguna'}
          change={activeLayer ? "Seleccionada" : "Hacer clic en el mapa"}
          changeType="positive"
          icon={Gauge}
          color="blue"
        />
      </div>

      {/* Panel de Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">Filtros de Cargas Singulares</h3>
            <span className="text-sm text-slate-500">({cargasData.length} de {cargasDataOriginal.length} cargas)</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
            >
              {mostrarFiltros ? 'Ocultar' : 'Mostrar'} Filtros
            </button>
            <button
              onClick={resetFiltros}
              className="px-3 py-1 text-sm bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Limpiar
            </button>
          </div>
        </div>

        {mostrarFiltros && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro de Voltaje */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Voltaje (kV)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filtros.voltajeMin}
                  onChange={(e) => setFiltros(prev => ({ ...prev, voltajeMin: Number(e.target.value) }))}
                  className="w-full px-2 py-1 text-sm border border-slate-300 rounded-md"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filtros.voltajeMax}
                  onChange={(e) => setFiltros(prev => ({ ...prev, voltajeMax: Number(e.target.value) }))}
                  className="w-full px-2 py-1 text-sm border border-slate-300 rounded-md"
                />
              </div>
            </div>

            {/* Filtro de Demanda */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Demanda (MW)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filtros.demandaMin}
                  onChange={(e) => setFiltros(prev => ({ ...prev, demandaMin: Number(e.target.value) }))}
                  className="w-full px-2 py-1 text-sm border border-slate-300 rounded-md"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filtros.demandaMax}
                  onChange={(e) => setFiltros(prev => ({ ...prev, demandaMax: Number(e.target.value) }))}
                  className="w-full px-2 py-1 text-sm border border-slate-300 rounded-md"
                />
              </div>
            </div>

            {/* Filtro de Empresa */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Empresa</label>
              <select
                value={filtros.empresa}
                onChange={(e) => setFiltros(prev => ({ ...prev, empresa: e.target.value }))}
                className="w-full px-2 py-1 text-sm border border-slate-300 rounded-md"
              >
                <option value="">Todas las empresas</option>
                {empresasUnicas.map(empresa => (
                  <option key={empresa} value={empresa}>{empresa}</option>
                ))}
              </select>
            </div>

            {/* Filtro de Sector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Sector</label>
              <select
                value={filtros.sector}
                onChange={(e) => setFiltros(prev => ({ ...prev, sector: e.target.value }))}
                className="w-full px-2 py-1 text-sm border border-slate-300 rounded-md"
              >
                <option value="">Todos los sectores</option>
                {sectoresUnicos.map(sector => (
                  <option key={sector} value={sector}>
                    {sector === 'D' ? 'Distribución' : sector === 'T' ? 'Transmisión' : sector}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro de Tarifa */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tarifa</label>
              <select
                value={filtros.tarifa}
                onChange={(e) => setFiltros(prev => ({ ...prev, tarifa: e.target.value }))}
                className="w-full px-2 py-1 text-sm border border-slate-300 rounded-md"
              >
                <option value="">Todas las tarifas</option>
                {tarifasUnicas.map(tarifa => (
                  <option key={tarifa} value={tarifa}>{tarifa}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MAPA DE EMPRESAS ELÉCTRICAS */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Áreas de Cobertura - Empresas Eléctricas del Ecuador
              </h3>
              <p className="text-sm text-slate-600">Distribución geográfica de las {totalEmpresas} empresas eléctricas</p>
            </div>
          </div>
          
          <div 
            className="w-full"
            style={{ 
              height: '384px',
              maxHeight: '384px',
              overflow: 'hidden',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
          >
            <EmpresasElectricasMapWithLeaflet 
              onEmpresaSelect={handleEmpresaSelect}
              onCargaSelect={handleCargaSelect}
              showCargas={true}
              selectedEmpresa={selectedEmpresa?.id}
              selectedCarga={selectedCarga?.id_cliente_ext}
              cargasData={cargasParaMapa}
            />
          </div>
        </div>

        {/* Panel lateral */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h4 className="text-lg font-semibold text-slate-900 mb-4">
            {selectedEmpresa ? 'Información de Empresa' : selectedCarga ? 'Información de Carga' : 'Seleccionar Elemento'}
          </h4>
          
          {selectedEmpresa ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600">Empresa</p>
                <p className="font-medium text-slate-900 text-sm">{selectedEmpresa.nombre}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Región de Cobertura</p>
                <p className="font-medium text-slate-900">{selectedEmpresa.region}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-slate-600">Potencia</p>
                  <p className="font-medium text-blue-600 text-lg">{selectedEmpresa.potencia}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Código</p>
                  <p className="font-medium text-slate-900">{selectedEmpresa.id}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600">Clientes Estimados</p>
                <p className="font-medium text-green-600 text-xl">
                  {selectedEmpresa.clientes?.toLocaleString('es-EC') || 'N/A'}
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 font-medium">🗺️ Área de Cobertura</p>
                <p className="text-xs text-blue-600 mt-1">Empresa distribuidora de energía eléctrica</p>
              </div>
              
              {/* Estadísticas adicionales */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600 mb-2">Participación en el sistema:</p>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${selectedEmpresa.potencia && potenciaTotal > 0 ? (parseInt(selectedEmpresa.potencia.replace(' MW', '')) / potenciaTotal * 100) : 0}%`
                    }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedEmpresa.potencia && potenciaTotal > 0 ? ((parseInt(selectedEmpresa.potencia.replace(' MW', '')) / potenciaTotal) * 100).toFixed(1) : 0}% del total
                </p>
              </div>
            </div>
          ) : selectedCarga ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600">Cliente</p>
                <p className="font-medium text-slate-900 text-sm">{selectedCarga.id_cliente_ext}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Empresa Distribuidora</p>
                <p className="font-medium text-slate-900">{selectedCarga.empresa}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-slate-600">Voltaje</p>
                  <p className="font-medium text-blue-600 text-lg">{selectedCarga.nivel_voltaje_kv} kV</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Tipo</p>
                  <p className="font-medium text-slate-900">{selectedCarga.nivel_voltaje_kv > 100 ? 'Alta Tensión' : 'Media Tensión'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600">Demanda Máxima</p>
                <p className="font-medium text-red-600 text-xl">
                  {selectedCarga.demanda_maxima?.toLocaleString('es-EC') || 'N/A'} MW
                </p>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800 font-medium">⚡ Carga Singular</p>
                <p className="text-xs text-amber-600 mt-1">Gran consumidor industrial/comercial</p>
              </div>
              
              {/* Estadísticas de la carga */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600 mb-2">Participación en demanda singular:</p>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full"
                    style={{
                      width: `${selectedCarga.demanda_maxima && demandaTotal > 0 ? Math.min((selectedCarga.demanda_maxima / demandaTotal) * 100, 100) : 0}%`
                    }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedCarga.demanda_maxima && demandaTotal > 0 ? ((selectedCarga.demanda_maxima / demandaTotal) * 100).toFixed(1) : 0}% del total de cargas singulares
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="flex space-x-4">
                  <Factory className="text-blue-400" size={32} />
                  <Power className="text-amber-400" size={32} />
                </div>
                <div className="text-center">
                  <p className="text-slate-500 mb-2">
                    Haz clic en el mapa para ver información detallada
                  </p>
                  <p className="text-xs text-blue-600">🏢 {totalEmpresas} empresas distribuidoras</p>
                  <p className="text-xs text-amber-600">⚡ {totalCargas} cargas singulares</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
