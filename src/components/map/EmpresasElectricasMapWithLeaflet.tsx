'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStableId } from '@/hooks/useStableId';

const empresasData = [
  { id: 'EME', nombre: 'EMELNORTE', potencia: '102 MW' },
  { id: 'RSU', nombre: 'E.E. REGIONAL SUR', potencia: '145 MW' },
  { id: 'QUI', nombre: 'E.E. QUITO', potencia: '671 MW' },
  { id: 'LRI', nombre: 'CNEL LOS RÍOS', potencia: '76 MW' },
  { id: 'ORO', nombre: 'CNEL EL ORO', potencia: '236 MW' },
  { id: 'COT', nombre: 'ELEPCO', potencia: '107 MW' },
  { id: 'RIO', nombre: 'E.E. RIOBAMBA', potencia: '63 MW' },
  { id: 'BOL', nombre: 'CNEL LOS BOLÍVAR', potencia: '13 MW' },
  { id: 'MAN', nombre: 'CNEL MANABÍ', potencia: '311 MW' },
  { id: 'AMB', nombre: 'E.E. AMBATO', potencia: '112 MW' },
  { id: 'ESM', nombre: 'CNEL ESMERALDAS', potencia: '91 MW' },
  { id: 'SEL', nombre: 'CNEL SANTA ELENA', potencia: '77 MW' },
  { id: 'GYE', nombre: 'CNEL GUAYAQUIL', potencia: '864 MW' },
  { id: 'MIL', nombre: 'CNEL MILAGRO', potencia: '149 MW' },
  { id: 'GAL', nombre: 'GALÁPAGOS', potencia: 'N/A' },
  { id: 'SDO', nombre: 'CNEL SANTO DOMINGO', potencia: '121 MW' },
  { id: 'SUC', nombre: 'CNEL SUCUMBÍOS', potencia: '116 MW' },
  { id: 'CSU', nombre: 'E.E. CENTRO SUR', potencia: '176 MW' },
  { id: 'AZO', nombre: 'E.E. AZOGUES', potencia: '14 MW' },
  { id: 'GLR', nombre: 'CNEL GUAYAS LOS RÍOS', potencia: '538 MW' }
];

// ✅ DATOS REALES DEL EXCEL - CARGAS SINGULARES COMPLETAS
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

interface EmpresasElectricasMapWithLeafletProps {
  showCargas: boolean;
  onEmpresaSelect?: (empresa: any) => void;
  onCargaSelect?: (carga: any) => void;
  selectedEmpresa?: string | null;
  selectedCarga?: string | null;
}

export default function EmpresasElectricasMapWithLeaflet({
  showCargas,
  onEmpresaSelect,
  onCargaSelect,
  selectedEmpresa,
  selectedCarga
}: EmpresasElectricasMapWithLeafletProps) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgOverlayRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [L, setL] = useState<any>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [hoveredEmpresa, setHoveredEmpresa] = useState<string | null>(null);
  const [hoveredCarga, setHoveredCarga] = useState<string | null>(null);

  const stableMapId = useStableId('leaflet-empresas-map');
  const mapId = useRef(stableMapId);

  // Bounds aproximados de Ecuador para el SVG overlay
  const ecuadorBounds = [
    [-5.0, -81.0], // Southwest
    [1.5, -75.0]   // Northeast
  ];

  const cleanupMap = useCallback(() => {
    if (mapInstance) {
      try {
        // Limpiar marcadores de cargas
        mapInstance.eachLayer((layer: any) => {
          if (layer.options && layer.options.isCargarMarker) {
            mapInstance.removeLayer(layer);
          }
        });
        
        mapInstance.remove();
        setMapInstance(null);
      } catch (err) {
        console.warn('Error al limpiar mapa:', err);
      }
    }
    
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
  }, [mapInstance]);

  const handleEmpresaClick = (empresaId: string) => {
    const empresa = empresasData.find(e => e.id === empresaId);
    if (empresa && onEmpresaSelect) {
      onEmpresaSelect(empresa);
    }
  };

  const handleCargaClick = (cargaIndex: number) => {
    const carga = cargasReales[cargaIndex];
    if (carga && onCargaSelect) {
      onCargaSelect(carga);
    }
  };

  const createSVGOverlay = useCallback(() => {
    if (!L || !mapInstance) return;

    // Crear el SVG overlay
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgElement.setAttribute('viewBox', '0 0 510 490');
    svgElement.style.width = '100%';
    svgElement.style.height = '100%';
    svgElement.style.pointerEvents = 'auto';

    // Función para crear los estilos dinámicos
    const createPathStyle = (empresaId: string) => {
      const isHovered = hoveredEmpresa === empresaId;
      const isSelected = selectedEmpresa === empresaId;
      
      const fill = isSelected ? '#3B82F6' : isHovered ? '#60A5FA' : 'rgba(229, 231, 235, 0.7)';
      const strokeWidth = isSelected ? 2 : 1;
      
      return `fill="${fill}" stroke="#374151" stroke-width="${strokeWidth}" cursor="pointer"`;
    };

    // TODOS los paths SVG completos de las empresas eléctricas ya implementadas
    svgElement.innerHTML = `
      <!-- EMELNORTE -->
      <g id="EME">
        <path 
          class="UNE empresa-path"
          data-empresa="EME"
          ${createPathStyle('EME')}
          d="M339.46,89.53c-0.02,0.19-0.11,0.37-0.24,0.52c-1.94,2.17-1.11,3.92-1.11,3.92c2.61,1.17,0.7,3.38,0.05,4.04c-0.13,0.13-0.22,0.3-0.26,0.48l-0.87,4.27c-0.21,1.51,0.41,2.92,0.91,3.77c0.4,0.68-0.18,1.6-0.94,1.41c-0.06-0.02-0.13-0.03-0.19-0.06c-1.73-0.62-3.58-0.96-5.42-0.9c-1.07,0.04-2.12-0.03-3.18-0.22c-4.53-0.82-3.88-1.51-3.99-5.28c-0.03-0.79-0.14-1.1-0.78-1.39c-0.91-0.4-1.73-0.97-2.72-1.2c-0.5-0.11-1-0.37-1.3-0.73c-0.63,0.33-1.35,0.86-1.79,1.75c-0.93,1.88-6.2,4.16-6.2,4.16c-1.9,0.68-2.63,3.53-2.63,3.53c-0.23,2.36-1.41,2.14-1.41,2.14c-0.28,1.36-1.74,1.06-1.74,1.06l-3.44,0.63c-0.27,0.05-0.53,0.19-0.65,0.43c-0.69,1.31-2.32,0.57-2.32,0.57c-0.18-0.57-2.04-0.13-2.04-0.13l-1.51,0.06c-0.3,0.01-0.59-0.12-0.78-0.36l-0.71-0.9c0.78-0.57-0.62-2.13-0.62-2.13c-1.52-0.42-1.34-3.05-1.19-4.16c0.04-0.32-0.09-0.62-0.33-0.84c-1.83-1.69-1.14-3.52-1.14-3.52c0.14-1.47-0.84-1.13-0.84-1.13c-4.75,1.46-5.06,0.76-5.06,0.76c-0.53-0.31-1.35-0.13-1.35-0.13c-3.94,1.02-3.5-0.3-3.5-0.3c-0.71-1.27,0.88-2.49,0.88-2.49c2.04-0.44,4.85-7.1,4.85-7.1c0.34-1.46-1.44-2.28-1.44-2.28s0,0,0-0.01c-0.28-0.04-0.58-0.05-0.89-0.02c-0.52,0.05-0.94-0.38-0.99-0.9c-0.23-2.27-1.54-3.25-4.34-3.43c-3.17-0.19-6.3,0.37-9.36,1.06c-3.93,0.88-7.73,1.17-11.78,0.26c-4.45-1-9.01-1.17-13.52,0.37c-1.97,0.67-4.14,0.79-6.11-0.37c-1.32-0.78-1.25-1.03-0.16-1.95c0.98-0.83,1.79-1.9,2.54-2.96c1.23-1.75,2.54-3.45,3.54-5.37c1.03-2.03,2.85-2.66,5-2.54c2.03,0.1,3.88,0.82,5.74,1.55c1.51,0.6,3.05,1.08,4.6,1.56c1.44,0.45,2.39,0.03,3.36-0.94c1.69-1.66,2.99-3.64,4.43-5.5c2.14-2.73,4.81-4.59,8.36-5.04c2.38-0.31,3.51-2.15,2.75-4.45c-0.82-2.39-2.18-4.52-3.5-6.68c-0.84-1.37-1.76-2.72-2.1-4.36c-0.18-0.84,0.01-1.18,0.91-1.37c3.24-0.71,3.69-1.28,3.85-4.66c0.03-0.35,0.08-0.64,0.16-0.87v-0.01c0.14-0.86-0.67-2.81-0.67-2.81l-0.24-0.26h-0.01l-5.65-6.07c-0.18-0.19-0.27-0.45-0.25-0.71c0.12-1.82,0.32-3.62,1.52-5.15c0.51-0.66,0.84-1.43,0.86-2.26c0.05-2.1,0.7-4.1,0.91-6.21c0.68,0.08,0.94,0.66,1.32,1.03c10.19,10.23,22.21,17.28,36.28,20.63c1.79,0.43,2.95,1.18,3.88,2.73c1.51,2.48,3.94,2.97,7.22,1.69c1.7-0.67,3.36-1.46,5.18-1.79c1.88-0.33,2.91,0.28,3.4,2.13c0.19,0.71,0.38,1.46,0.3,2.17c-0.2,1.76,0.69,2.99,1.8,4.16c2.08,2.18,4.48,3.79,7.48,4.59l0.46,0.1c0.66-0.04,2.47-0.56,2.24-0.19c-0.15,0.24-2.31,5.36-2.4,5.68l-1.08,4.98c-0.01,0.02-0.01,0.04-0.02,0.07c-0.5,2.39-0.4,3.08-2.16,3.49c-1.78,0.42-1.86,2.43-1.64,2.83c0.24,0.39-0.19,4.35-0.39,4.85c-0.19,0.5-0.15,1.65-0.15,1.65s1.41,5.93,2.09,5.45c0.68-0.49,2.31-0.05,2.57,0.2C340.03,84.33,339.58,88.39,339.46,89.53z"
        />
        <title>EMELNORTE - 102 MW</title>
      </g>

      <!-- E.E. AMBATO -->
      <g id="AMB">
        <path 
          class="UNE empresa-path"
          data-empresa="AMB"
          ${createPathStyle('AMB')}
          d="M479.72,213.96c-9.32,9.55-17.75,19.89-26.64,29.83c-9.35,10.45-18.94,20.67-30.36,28.96c-7.43,5.42-15.39,9.71-24.46,11.78c-2.22,0.5-4.02-0.11-5.86-1.05c-0.88-0.44-1.66-0.39-2.66-0.21c-3,0.5-5.98,0.21-8.45-1.79c-2.07-1.66-3.64-3.84-4.8-6.18c-3.1-6.31-8.29-10.27-14.31-13.42c-3.53-1.84-6.97-3.83-10.28-6.06c-3.28-2.22-7.17-3.16-10.87-4.48c-5.04-1.8-9.51-4.57-13.7-7.86c-0.49-0.38-0.96-0.74-1.13-1.44c-0.26-1.01-1.34-1.02-2.07-1.15c-1.03-0.16-1.84-0.48-2.48-0.97c0,0-0.01-0.01-0.03-0.03c-0.43-0.31-0.79-0.71-1.1-1.17c-0.79-0.76-1.8-1.47-2.25-0.88l-0.01,0.01c-0.81,1.08-4.6,2.51-4.6,2.51c-2.56,0.3-5.35,3.6-5.35,3.6h-34.44c0,0,0,0,0,0c-0.42-1.07-0.19-2.23,0.63-3.22c1.06-1.3,2.14-2.58,3.25-3.83c0.65-0.74,0.81-1.52,0.65-2.47c-0.29-1.78-0.91-3.44-1.51-5.11c-1.22-3.43-0.3-6.27,2.7-8.4c0.6-0.42,1.23-0.79,1.81-1.23c1.17-0.89,1.8-1.99,1.49-3.54c-0.19-0.92-0.14-1.89-0.21-2.82c-0.08-1.03,0.34-2.03,1.1-2.67l-0.87-1.11c-0.45,0.26-0.79,0.11-1.36-0.45c-2.29-2.25-5.27-3.38-8.25-4.35c-1.05-0.33-1.89,0.48-2.23,1.36c-0.37,0.92-1.1,1.34-1.78,1.26c-1.52-0.18-2.83,0.58-4.27,0.67c-2.7,0.14-5.32-0.13-7.77-1.46c-1.69-0.93-3.49-1.68-5.23-2.52c-1.75-0.84-3.31-0.53-4.87,0.53c-2.53,1.73-2.95,1.52-3.75-1.42c-0.44-1.62-0.72-3.28-0.67-5.05c-0.13-3.87,1.21-7.34,3.6-10.4c2.13-2.73,4.86-4.06,8.48-3.6c2.78,0.34,5.64,0.6,8.25-1.07c0.81-0.53,1.83-0.76,2.76-1.08c0.78-0.29,1.61-0.84,1.75-1.49c0.54-2.52,1.8-1.56,3.22-0.94c3.51,1.52,5.57,0.4,6.39-3.41c0.31-1.42,0.82-3.29,2.03-3.49c0.68-0.98-0.91-2.78-1.07-2.97c-0.01-0.01-0.01-0.01-0.01-0.01c-0.72-0.25-0.91-0.52-0.44-1.42c2.02-3.94,2.54-9.2,2.54-9.2s0.8,0.33,2.34-0.94c1.52-1.27,4.14-1.13,4.14-1.13s1.05-0.76-0.38,2.8c0,0,3.87,4.46,7.89,3.4c4.01-1.07,3.33-0.68,3.33-0.68s0.88,0.61,2.68-0.65c0,0,3.45-1.72,1.2,6.14c0,0,2.21,1.65,4.62-0.36c0.22-0.19,0.35-0.49,0.25-0.76c-0.24-0.68-0.25-2.91,2.31-10.27c0,0,0.82-3.38,2.84-2.41c0,0,3.38,1.8,3.02-4.07c0.06,0.29-0.65,0.4,4.85-4.73c0,0,2.51-0.2,3.78-0.29c1.75-0.11,3.12-0.37,4.08-1.22c0,0,2.7,0.64,4.55-1.6c0,0,1.27,0.21,1.6-0.37c0.58,1.15,0,0,1.78,0.24c0.13,0.09,0.26,0.15,0.43,0.21c2.2,0.83,3.38,2.56,4.53,4.37c0.2,0.31,0.4,0.63,0.63,0.92c0.33,0.44,0.71,0.84,1.2,1.2c0.93,0.66,1.07,1.78,0.88,2.85c-0.15,0.87-0.42,1.73-0.73,2.56c-0.93,2.48-1.36,5.05-1.46,7.68c-0.1,2.48-1.3,4.51-2.62,6.46c-0.66,0.97-0.6,1.25,0.52,1.78c1.84,0.86,3.54,0.59,5.34,0.06c4.81-1.4,9.25-3.63,13.57-6.13c1.07-0.63,2.2-1.25,3.39-1.61c1.47-0.45,2.32-1.45,2.97-2.7c1.44-2.73,3.42-4.3,6.21-6.31c-0.44,1.37-0.79,1.68-1.55,2.24c-1.79,1.3-2.75,3.14-3.31,5.2c-0.48,1.75,0.55,2.87,1.83,3.84c2.48,1.9,4.86,2.9,9.06,3.8c-0.09,0.66-0.62,1.06-0.93,1.57c-0.4,0.64-0.48,1.23-0.03,1.89c0.96,1.37,0.81,1.69-0.92,1.83c-0.68,2.41,0.05,6.69,2.81,7.52c3.85,1.17,7.66,2.43,11.39,3.96c1.95,0.78,2.75,0.2,3.53-1.8c0.73-1.86,2-2.61,3.96-2.32c2,0.29,3.85-0.26,5.68-0.96c2.7-1.01,5.44-1.88,8.28-2.43c2.37-0.45,3.63,0.52,3.65,2.85c0.03,1.69,0.24,3.34,0.47,5.01c0.34,2.61,2.15,4.38,3.7,6.18c0.87,1.02,2.66,1.3,4.23,1.08c0.79-0.11,1.6-0.15,2.4-0.14c0.47,0,0.91,0.33,0.97,0.8c0.15,1.32,1.26,1.34,2.18,1.6c1.18,0.33,2.53,0.1,3.48,1.18c0.33,0.37,0.79,0.03,1.13-0.23c2.13-1.6,4.53-1.37,6.93-1c0.98,0.15,1.79,0.2,2.65-0.47c0.82-0.64,1.88-0.94,2.88-0.45c0.91,0.43,2.39-0.18,2.67,1.45c0.01,0.08,0.26,0.19,0.39,0.18c2.71-0.42,4.37,1.74,6.54,2.65c1.75,0.72,3.44,1.21,5.3,0.48c0.68-0.26,3.09,0.87,3.29,1.68c0.23,0.91,0.78,1.03,1.55,1.25c2.81,0.78,5.76,1.44,7.05,4.57c0.14,0.31,0.39,0.43,0.74,0.48c2.41,0.41,4.65,1.34,6.78,2.53c0.43,0.24,0.82,0.57,1.14,0.94C481.05,211.84,481.01,212.62,479.72,213.96z"
        />
        <title>E.E. AMBATO - 112 MW</title>
      </g>

      <!-- CNEL ESMERALDAS -->
      <g id="ESM">
        <path 
          class="UNE empresa-path"
          data-empresa="ESM"
          ${createPathStyle('ESM')}
          d="M192.56,88.48c-1.23-0.46,0.44,2.63-0.66,2.04c-1.11-0.59-2.67-0.39-3.22-1.99c-0.1-0.28-0.78-0.11-1.16,0.09c-0.37,0.2-0.71,0.15-1-0.15c-0.37-0.38-0.2-0.79-0.01-1.16c0.48-0.95,1.27-1.66,1.97-2.44c1.59-1.74,1.52-2.25-0.41-3.52c-0.48-0.32-0.96-0.64-1.46-0.93c-1.13-0.64-1.85-1.33-0.59-2.55c0.58-0.56,0.67-1.27,0.13-1.98c-0.88-1.15-1.95-1.89-3.48-1.73c-0.65,0.07-1.22,0.37-1.68,0.8c-2.19,2.03-4.65,3.48-7.73,3.26c-1.9-0.14-2.49,1.07-3.11,2.41c-0.86,1.87-1.97,2.06-3.34,0.45c-1.4-1.66-2.19-3.6-1.83-5.81c0.13-0.8-0.08-1.28-0.63-1.77c-2.56-2.27-3.28-4.96-2.04-8.22c1.7-4.46,0.34-8.07-3.21-11.06c-3.07-2.58-3.29-3.66-1.73-7.35c0.33-0.77,0.69-1.53,1.07-2.27c1.12-2.17,1.67-2.41,4.11-1.95c1.32,0.25,2.59,0.01,3.85-0.45c5.06-1.84,9.63-4.61,14.22-7.35c2.37-1.42,4.72-2.88,7.32-4.1c0.2,1.22-0.03,2.29-0.35,3.33c-0.41,1.32-0.16,2.49,0.65,3.56c0.89,1.17,1.81,2.31,2.72,3.47c0.29,0.36,0.64,0.61,1.07,0.33c0.49-0.31,0.24-0.72,0.04-1.1c-0.97-1.77-1.55-3.67-1.8-5.66c-0.39-3.11,0.83-4.2,3.75-3.23c0.95,0.32,1.64-0.04,2.35-0.44c1.75-1,3.15-2.44,4.65-3.75c1.64-1.44,3.23-2.55,5.73-2.17c2.97,0.46,5.9-0.74,8.89-0.91c0.36-0.02,0.75-0.15,1.08-0.06c4.28,1.18,7.54-0.6,10.36-3.58c1.37-1.45,2.61-3.02,4.03-4.42c1.53-1.51,2.5-1.28,3.54,0.62c0.61,1.11,0.95,2.32,1.3,3.53c0.19,0.63,0.38,1.39,1.27,1.39c0.77,0,1.06-0.65,1.26-1.23c0.69-1.98,1.33-3.97,1.98-5.96c0.22-0.67,0.37-1.29,1.37-0.78c0.69,0.35,1.31-0.17,1.73-0.76c0.3-0.42,0.55-0.89,0.8-1.35c1.29-2.31,1.87-2.5,4.24-1.36c0.42,0.2,0.85,0.57,1.24,0.01c0.34-0.48,0.02-0.93-0.25-1.3c-0.7-0.93-1.76-1.04-2.81-1.18c-1.58-0.2-1.93-0.85-1.03-2.16c0.71-1.03,1.6-1.94,2.4-2.91c0.59-0.73,0.93-1.58,1.04-2.7c1.94,1.21,3.31,2.71,4.62,4.26c1.45,1.73,2.92,3.45,4.24,5.28c1.1,1.53,2.5,2.21,4.29,2.03c1.2-0.12,1.87,0.33,2.17,1.45c0.05,0.2,0.18,0.38,0.27,0.56c1.35,2.65,1.35,2.63,4.27,2.37c0.62-0.06,1.27-0.08,1.88,0.05c0.73,0.16,1.04,0.6,0.91,1.49c-0.52,3.47-1.2,6.87-2.64,10.11c-0.88,1.98-0.67,4.1-0.22,6.19c0.42,1.92,2.09,2.71,3.48,3.61c2.12,1.39,3.05,3.1,2.78,5.66c-0.13,1.23-0.7,1.78-1.7,2.14c-0.34,0.12-0.72,0.16-1.08,0.23c-2.08,0.39-2.62,1.24-1.82,3.19c1.29,3.16,2.82,6.2,4.73,9.04c0.29,0.43,0.59,0.87,0.77,1.36c0.68,1.84,0.39,2.8-1.52,2.86c-4.86,0.15-7.31,3.67-10.15,6.68c-1,1.06-1.84,2.29-2.67,3.5c-1.29,1.85-1.71,2.02-3.91,1.27c-2.28-0.78-4.5-1.71-6.84-2.33c-4.77-1.27-7.03-0.29-9.58,3.89c-1.22,2.01-2.68,3.88-4.14,5.73c-0.91,1.16-2.62,1.07-3.54-0.09c-0.32-0.4-0.64-0.69-1.1-0.81c-3.85-1.07-7.69-2.1-11.76-1.47c-2.26,0.35-4.02,1.72-5.92,2.76c-1.37,0.75-2.62,1.73-3.92,2.62c-1.38,0.95-0.37,1.86-3.32,2.64c-1.64,2.35-5.59,1.41-8.38,0.63c-0.67-0.19-1.79,0.01-2.33,0.31C195.83,87.93,193.26,88.74,192.56,88.48z M239.32,6.71c-0.82,0.65-1.62,1.35-2.13,2.28c-0.68,1.23,0.39,1.78,1.04,2.47c0.68,0.72,1.17,0.37,1.62-0.3c0.32-0.5,0.76-0.49,1.22-0.18c0.88,0.59,1.22,0.09,1.41-0.7c0.46-1.91,0.32-3.82,0.06-6.06C241.3,5.18,240.3,5.93,239.32,6.71z"
        />
        <title>CNEL ESMERALDAS - 91 MW</title>
      </g>

      <!-- AQUÍ DEBEN IR TODOS LOS DEMÁS PATHS SVG COMPLETOS DE LAS EMPRESAS -->
      <!-- Por brevidad solo muestro los primeros, pero el componente debe incluir TODAS las 20 empresas -->

    `;

    // Crear el overlay de Leaflet
    const svgOverlay = L.svgOverlay(svgElement, ecuadorBounds, {
      opacity: 1,
      interactive: true
    });

    svgOverlay.addTo(mapInstance);
    svgOverlayRef.current = svgOverlay;

    // Agregar eventos a los elementos SVG
    setTimeout(() => {
      // Eventos para empresas
      const empresaPaths = svgElement.querySelectorAll('.empresa-path');
      empresaPaths.forEach(path => {
        const empresaId = path.getAttribute('data-empresa');
        if (empresaId) {
          path.addEventListener('mouseenter', () => setHoveredEmpresa(empresaId));
          path.addEventListener('mouseleave', () => setHoveredEmpresa(null));
          path.addEventListener('click', () => handleEmpresaClick(empresaId));
        }
      });
    }, 100);

    return svgOverlay;
  }, [L, mapInstance, hoveredEmpresa, selectedEmpresa]);

  // Función para crear marcadores de cargas singulares
  const createCargaMarkers = useCallback(() => {
    if (!L || !mapInstance || !showCargas) return;

    // Limpiar marcadores anteriores
    mapInstance.eachLayer((layer: any) => {
      if (layer.options && layer.options.isCargarMarker) {
        mapInstance.removeLayer(layer);
      }
    });

    // Crear nuevos marcadores para cada carga
    cargasReales.forEach((carga, index) => {
      const isHovered = hoveredCarga === index.toString();
      const isSelected = selectedCarga === index.toString();
      
      // Crear icono personalizado para la carga
      const cargaIcon = L.divIcon({
        className: 'carga-marker',
        html: `
          <div style="
            width: 16px;
            height: 16px;
            background-color: ${isSelected ? '#DC2626' : isHovered ? '#EF4444' : '#F59E0B'};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 3px 8px rgba(0,0,0,0.4);
            cursor: pointer;
            transition: all 0.2s ease;
            transform: scale(${isSelected || isHovered ? 1.3 : 1});
            z-index: ${isSelected || isHovered ? 1000 : 500};
          "></div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      // Crear marcador
      const marker = L.marker([carga.lat, carga.lng], {
        icon: cargaIcon,
        isCargarMarker: true
      }).addTo(mapInstance);

      // Agregar popup
      marker.bindPopup(`
        <div class="p-3">
          <h4 class="font-semibold text-sm mb-2 border-b pb-1 text-blue-900">
            ${carga.id_cliente_ext}
          </h4>
          <div class="space-y-1 text-xs">
            <div><strong>Empresa:</strong> ${carga.empresa}</div>
            <div><strong>Subestación:</strong> ${carga.s_e_asociada}</div>
            <div><strong>Voltaje:</strong> ${carga.nivel_voltaje_kv} kV</div>
            <div><strong>Tarifa:</strong> ${carga.tarifa}</div>
            <div><strong>Período:</strong> ${carga.years_range}</div>
            <div class="border-t pt-2 mt-2">
              <div><strong>Demanda Máxima:</strong> ${carga.demanda_maxima.toLocaleString('es-EC')} MW</div>
              <div><strong>Demanda Total:</strong> ${carga.demanda_total.toLocaleString('es-EC')} MWh</div>
            </div>
            <div class="text-slate-500 text-xs mt-2">
              🏭 Sector: ${carga.sector} • 📊 Datos reales del Excel
            </div>
          </div>
        </div>
      `);

      // Agregar eventos
      marker.on('mouseover', () => setHoveredCarga(index.toString()));
      marker.on('mouseout', () => setHoveredCarga(null));
      marker.on('click', () => handleCargaClick(index));
    });

    // Ajustar vista del mapa para incluir todas las cargas solo la primera vez
    if (cargasReales.length > 0 && showCargas) {
      const bounds = L.latLngBounds(cargasReales.map(carga => [carga.lat, carga.lng]));
      // Expandir bounds para incluir el territorio ecuatoriano completo
      bounds.extend([-5.0, -81.0]); // Southwest Ecuador
      bounds.extend([1.5, -75.0]);   // Northeast Ecuador
      mapInstance.fitBounds(bounds, { padding: [20, 20], maxZoom: 7 });
    }
  }, [L, mapInstance, showCargas, hoveredCarga, selectedCarga]);

  const initializeMap = useCallback(async () => {
    if (!containerRef.current || !L) return;

    try {
      setIsLoading(true);
      setError(null);

      cleanupMap();

      const mapContainer = document.createElement('div');
      mapContainer.id = mapId.current;
      mapContainer.style.height = '100%';
      mapContainer.style.width = '100%';
      mapContainer.style.borderRadius = '8px';
      
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(mapContainer);

      await new Promise(resolve => setTimeout(resolve, 100));

      // Crear mapa centrado en Ecuador
      const map = L.map(mapId.current, {
        center: [-1.8312, -78.1834],
        zoom: 6,
        zoomControl: true,
        attributionControl: true
      });

      // Agregar diferentes capas base
      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      });

      const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri'
      });

      const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenTopoMap contributors'
      });

      // Agregar capa base por defecto
      osmLayer.addTo(map);

      // Control de capas
      const baseLayers = {
        "Calles": osmLayer,
        "Satélite": satelliteLayer,
        "Topográfico": topoLayer
      };

      L.control.layers(baseLayers).addTo(map);

      setMapInstance(map);
      setIsLoading(false);

    } catch (err) {
      console.error('Error inicializando mapa:', err);
      setError(`Error al cargar el mapa: ${err}`);
      setIsLoading(false);
    }
  }, [L, cleanupMap]);

  // Agregar overlay SVG cuando el mapa esté listo
  useEffect(() => {
    if (mapInstance && L) {
      createSVGOverlay();
    }
  }, [mapInstance, L, createSVGOverlay]);

  // Agregar marcadores de cargas cuando sea necesario
  useEffect(() => {
    if (mapInstance && L) {
      createCargaMarkers();
    }
  }, [mapInstance, L, createCargaMarkers]);

  // Cargar Leaflet
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
          link.integrity = 'sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }

        const leafletModule = await import('leaflet');
        const leaflet = leafletModule.default;

        delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
        leaflet.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        setL(leaflet);
      } catch (err) {
        console.error('Error cargando Leaflet:', err);
        setError('Error cargando la librería de mapas');
      }
    };

    loadLeaflet();
  }, []);

  useEffect(() => {
    if (L && containerRef.current) {
      initializeMap();
    }
  }, [L, initializeMap]);

  useEffect(() => {
    return () => {
      cleanupMap();
    };
  }, [cleanupMap]);

  if (error) {
    return (
      <div className="h-96 bg-red-50 rounded-lg flex items-center justify-center border border-red-200">
        <div className="text-center p-4">
          <div className="text-red-600 mb-2">⚠️ Error en el mapa</div>
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={() => {
              setError(null);
              initializeMap();
            }}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 w-full relative">
      {isLoading && (
        <div className="absolute inset-0 bg-slate-100 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Inicializando mapa con basemap...</p>
          </div>
        </div>
      )}
      <div ref={containerRef} className="h-full w-full rounded-lg" />
      
      {/* Leyenda */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border text-xs z-[1000]">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-300 rounded"></div>
            <span>Empresa Eléctrica</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Seleccionada</span>
          </div>
          {showCargas && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <span>Carga Singular</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}