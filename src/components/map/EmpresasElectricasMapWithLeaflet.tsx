'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { useStableId } from '@/hooks/useStableId';
import { fetchAndValidateGeoJSON, GeoJSONError } from '@/utils/geoJsonValidator';

// Memoized static data - moved outside component to prevent recreating
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
] as const;

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
] as const;

interface EmpresasElectricasMapWithLeafletProps {
  showCargas: boolean;
  onEmpresaSelect?: (empresa: any) => void;
  onCargaSelect?: (carga: any) => void;
  selectedEmpresa?: string | null;
  selectedCarga?: string | null;
  cargasData?: any[];
}

const EmpresasElectricasMapWithLeaflet = memo(function EmpresasElectricasMapWithLeaflet({
  showCargas,
  onEmpresaSelect,
  onCargaSelect,
  selectedEmpresa,
  selectedCarga,
  cargasData = [...cargasReales]
}: EmpresasElectricasMapWithLeafletProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [L, setL] = useState<any>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const [hoveredEmpresa, setHoveredEmpresa] = useState<string | null>(null);
  const [hoveredCarga, setHoveredCarga] = useState<string | null>(null);
  const geoJsonLayerRef = useRef<any>(null);

  const stableMapId = useStableId('leaflet-empresas-map');
  const mapId = useRef(stableMapId);

  const cleanupMap = useCallback(() => {
    const currentMapInstance = mapInstanceRef.current;
    if (currentMapInstance) {
      try {
        // Limpiar timeouts pendientes
        if ((currentMapInstance as any)._timeouts) {
          (currentMapInstance as any)._timeouts.forEach((timeout: NodeJS.Timeout) => {
            clearTimeout(timeout);
          });
        }
        
        // Limpiar event listener si existe
        if ((currentMapInstance as any)._handleResize) {
          window.removeEventListener('resize', (currentMapInstance as any)._handleResize);
        }
        
        // Remover elemento del DOM si existe
        const uniqueId = (currentMapInstance as any)._uniqueId;
        if (uniqueId) {
          const element = document.getElementById(uniqueId);
          if (element) {
            element.remove();
          }
        }
        
        currentMapInstance.remove();
        mapInstanceRef.current = null;
        setMapInstance(null);
      } catch (err) {
        console.warn('Error al limpiar mapa:', err);
      }
    }
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
  }, []); // Sin dependencias para evitar ciclo infinito

  // Memoize event handlers
  const handleEmpresaClick = useCallback((empresaId: string) => {
    const empresa = empresasData.find(e => e.id === empresaId);
    if (empresa && onEmpresaSelect) {
      onEmpresaSelect(empresa);
    }
  }, [onEmpresaSelect]);

  const handleCargaClick = useCallback((cargaIndex: number) => {
    const carga = cargasData[cargaIndex];
    if (carga && onCargaSelect) {
      onCargaSelect(carga);
    }
  }, [onCargaSelect, cargasData]);

  const createCargaMarkers = useCallback(() => {
    if (!L || !mapInstance || !showCargas) return;

    mapInstance.eachLayer((layer: any) => {
      if (layer.options && layer.options.isCargarMarker) {
        mapInstance.removeLayer(layer);
      }
    });

    cargasData.forEach((carga, index) => {
      const isHovered = hoveredCarga === carga.id_cliente_ext;
      const isSelected = selectedCarga === carga.id_cliente_ext;
      
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
          ">
          </div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const marker = L.marker([carga.lat, carga.lng], {
        icon: cargaIcon,
        isCargarMarker: true
      }).addTo(mapInstance);

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
      `, {
        autoPan: false,  // Prevent automatic panning
        keepInView: false, // Don't keep in view
        closeButton: true,
        maxWidth: 300
      });

      marker.on('mouseover', () => setHoveredCarga(carga.id_cliente_ext));
      marker.on('mouseout', () => setHoveredCarga(null));
      marker.on('click', (e: any) => {
        // Prevent default behavior and stop propagation
        L.DomEvent.stopPropagation(e);
        handleCargaClick(index);
      });
    });

    if (cargasData.length > 0 && showCargas) {
      const bounds = L.latLngBounds(cargasData.map(carga => [carga.lat, carga.lng]));
      bounds.extend([-5.0, -81.0]);
      bounds.extend([1.5, -75.0]);
      mapInstance.fitBounds(bounds, { padding: [20, 20], maxZoom: 7 });
    }
  }, [L, mapInstance, showCargas, hoveredCarga, selectedCarga, handleCargaClick, cargasData]);

  const initializeMap = useCallback(async () => {
    if (!L) {
      console.warn('Leaflet not loaded yet');
      return;
    }

    if (!containerRef.current) {
      console.warn('Container ref not available');
      setError('Contenedor del mapa no disponible');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Limpiar cualquier mapa anterior directamente
      if (mapInstanceRef.current) {
        try {
          const oldMap = mapInstanceRef.current;
          
          // Limpiar timeouts pendientes del mapa anterior
          if ((oldMap as any)._timeouts) {
            (oldMap as any)._timeouts.forEach((timeout: NodeJS.Timeout) => {
              clearTimeout(timeout);
            });
          }
          
          // Limpiar event listener si existe
          if ((oldMap as any)._handleResize) {
            window.removeEventListener('resize', (oldMap as any)._handleResize);
          }
          
          oldMap.remove();
          mapInstanceRef.current = null;
          setMapInstance(null);
        } catch (err) {
          console.warn('Error al limpiar mapa anterior:', err);
        }
      }

      // Asegurar que el contenedor esté disponible y visible
      const container = containerRef.current;
      if (!container) {
        throw new Error('Container reference no está disponible');
      }
      
      container.innerHTML = '';
      
      // Crear el elemento del mapa con un ID único
      const uniqueId = `map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const mapDiv = document.createElement('div');
      mapDiv.id = uniqueId;
      mapDiv.style.cssText = `
        width: 100%;
        height: 100%;
        position: relative;
        z-index: 0;
        background: #f8f9fa;
        min-height: 384px;
      `;
      
      container.appendChild(mapDiv);

      // Verificar que el elemento se añadió correctamente y tiene dimensiones
      await new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 40; // 2 segundos máximo
        
        const checkElement = () => {
          const element = document.getElementById(uniqueId);
          attempts++;
          
          if (element) {
            const rect = element.getBoundingClientRect();
            const hasVisibleSize = rect.width > 0 && rect.height > 0;
            const isInViewport = rect.top >= 0 && rect.left >= 0;
            
            if (hasVisibleSize && isInViewport) {
              console.log(`✅ Elemento ${uniqueId} listo: ${rect.width}x${rect.height}px`);
              resolve(true);
              return;
            } else {
              console.log(`⏳ Intento ${attempts}: elemento existe pero no tiene dimensiones visibles (${rect.width}x${rect.height})`);
            }
          } else {
            console.log(`⏳ Intento ${attempts}: elemento ${uniqueId} no encontrado en DOM`);
          }
          
          if (attempts < maxAttempts) {
            setTimeout(checkElement, 50);
          } else {
            const finalElement = document.getElementById(uniqueId);
            const errorMsg = finalElement 
              ? `Elemento ${uniqueId} existe pero no tiene dimensiones válidas después de ${maxAttempts} intentos`
              : `Elemento ${uniqueId} no se pudo encontrar en el DOM después de ${maxAttempts} intentos`;
            reject(new Error(errorMsg));
          }
        };
        
        // Iniciar verificación inmediata
        checkElement();
      });

      console.log(`Inicializando mapa en elemento: ${uniqueId}`);

      // Verificar una vez más que el elemento existe antes de crear el mapa
      const mapElement = document.getElementById(uniqueId);
      if (!mapElement) {
        throw new Error(`Elemento ${uniqueId} desapareció antes de la creación del mapa`);
      }

      // Crear el mapa con manejo de errores
      let map;
      try {
        map = L.map(uniqueId, {
          center: [-1.8312, -78.1834],
          zoom: 6,
          zoomControl: true,
          attributionControl: true,
          preferCanvas: false,
          maxZoom: 18,
          minZoom: 2,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          boxZoom: true,
          keyboard: true,
          dragging: true,
          zoomAnimation: false, // Disable zoom animation to prevent scroll issues
          fadeAnimation: false, // Disable fade animation
          markerZoomAnimation: false // Disable marker zoom animation
        });
        console.log(`✅ Mapa creado exitosamente en ${uniqueId}`);
      } catch (mapCreationError) {
        console.error('Error al crear el mapa:', mapCreationError);
        throw new Error(`No se pudo crear el mapa: ${mapCreationError instanceof Error ? mapCreationError.message : String(mapCreationError)}`);
      }

      // Añadir capas base
      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18
      });

      const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri',
        maxZoom: 18
      });

      const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenTopoMap contributors',
        maxZoom: 17
      });

      osmLayer.addTo(map);

      const baseLayers = {
        "Calles": osmLayer,
        "Satélite": satelliteLayer,
        "Topográfico": topoLayer
      };

      L.control.layers(baseLayers).addTo(map);

      // Forzar invalidación del tamaño después de un tiempo con verificaciones
      const timeouts: NodeJS.Timeout[] = [];
      
      const invalidateMapSize = () => {
        if (map && mapInstanceRef.current && map._container && map._container._leaflet_pos !== undefined) {
          try {
            map.invalidateSize(false); // false = no animation to prevent scroll
          } catch (err) {
            console.warn('Error al invalidar tamaño del mapa:', err);
          }
        }
      };

      timeouts.push(setTimeout(invalidateMapSize, 200));
      timeouts.push(setTimeout(invalidateMapSize, 500));
      timeouts.push(setTimeout(invalidateMapSize, 1000));
      
      // Guardar los timeouts para limpieza posterior
      (map as any)._timeouts = timeouts;

      // Event listener para resize con la misma lógica de verificación
      const handleResize = () => {
        setTimeout(() => {
          if (map && mapInstanceRef.current && map._container && map._container._leaflet_pos !== undefined) {
            try {
              map.invalidateSize(false); // false = no animation to prevent scroll
            } catch (err) {
              console.warn('Error al invalidar tamaño del mapa en resize:', err);
            }
          }
        }, 100);
      };

      window.addEventListener('resize', handleResize);
      (map as any)._handleResize = handleResize;
      (map as any)._uniqueId = uniqueId;

      mapInstanceRef.current = map;
      setMapInstance(map);
      setIsLoading(false);

      console.log('Mapa inicializado exitosamente');

    } catch (err) {
      console.error('Error inicializando mapa:', err);
      setError(`Error al cargar el mapa: ${err}`);
      setIsLoading(false);
    }
  }, [L]); // Solo depende de L para evitar ciclos

  // Función para obtener colores por región (movida fuera para reutilización)
  const getRegionColor = useCallback((region: string) => {
    const colors: { [key: string]: string } = {
      'Norte': '#10B981',      // Verde
      'Sur': '#F59E0B',        // Amarillo
      'Pichincha': '#3B82F6',  // Azul
      'Cotopaxi': '#8B5CF6',   // Púrpura
      'Tungurahua': '#EF4444', // Rojo
      'Bolívar': '#F97316',    // Naranja
      'Chimborazo': '#14B8A6', // Teal
      'Azuay-Cañar': '#6366F1',// Indigo
      'Cañar': '#EC4899',      // Pink
      'Esmeraldas': '#84CC16', // Lime
      'Santo Domingo': '#06B6D4', // Cyan
      'Manabí': '#A855F7',     // Violet
      'Los Ríos': '#22C55E',   // Green
      'Guayas-Los Ríos': '#3B82F6', // Blue
      'Guayas': '#0EA5E9',     // Sky
      'Santa Elena': '#F472B6', // Rose
      'El Oro': '#FBBF24',     // Amber
      'Sucumbíos': '#4ADE80',  // Emerald
      'Galápagos': '#FB7185'   // Rose
    };
    return colors[region] || '#9CA3AF';
  }, []);

  useEffect(() => {
    if (mapInstance && L) {
      // Enable detailed logging for first error in development
      const geoJsonPath = '/maps/company_areas_fixed.geojson';
      console.log(`🗺️ Loading GeoJSON from: ${geoJsonPath}`);

      fetchAndValidateGeoJSON(geoJsonPath)
        .then(validatedData => {
          console.log(`✅ GeoJSON loaded successfully: ${validatedData.features.length} features`);

          if (geoJsonLayerRef.current) {
            mapInstance.removeLayer(geoJsonLayerRef.current);
          }
          
          const geoJsonLayer = L.geoJSON(validatedData, {
            style: (feature: any) => {
              const empresaId = feature.properties.id;
              const isHovered = hoveredEmpresa === empresaId;
              const isSelected = selectedEmpresa === empresaId;
              
              const baseColor = getRegionColor(feature.properties.region);
              
              return {
                fillColor: isSelected ? '#DC2626' : isHovered ? '#EF4444' : baseColor,
                weight: isSelected ? 3 : isHovered ? 2 : 1.5,
                opacity: 1,
                color: isSelected ? '#FFFFFF' : isHovered ? '#FFFFFF' : '#1F2937',
                fillOpacity: isSelected ? 0.8 : isHovered ? 0.7 : 0.5,
                dashArray: isSelected ? '5, 5' : undefined
              };
            },
            onEachFeature: (feature: any, layer: any) => {
              layer.on({
                mouseover: () => setHoveredEmpresa(feature.properties.id),
                mouseout: () => setHoveredEmpresa(null),
                click: (e: any) => {
                  // Prevent default behavior and stop propagation
                  L.DomEvent.stopPropagation(e);
                  handleEmpresaClick(feature.properties.id);
                }
              });

              // Enhanced popup with better styling and more information
              const popup = `
                <div class="p-4 min-w-[280px]">
                  <div class="flex items-center gap-2 mb-3">
                    <div class="w-4 h-4 rounded" style="background-color: ${getRegionColor(feature.properties.region)}"></div>
                    <h4 class="font-bold text-base text-gray-800">${feature.properties.companyName}</h4>
                  </div>

                  <div class="grid grid-cols-2 gap-3 text-sm">
                    <div class="bg-blue-50 p-2 rounded">
                      <div class="text-blue-600 font-medium">Código</div>
                      <div class="text-gray-800 font-bold">${feature.properties.id}</div>
                    </div>

                    <div class="bg-green-50 p-2 rounded">
                      <div class="text-green-600 font-medium">Potencia</div>
                      <div class="text-gray-800 font-bold">${feature.properties.potencia}</div>
                    </div>
                  </div>

                  <div class="mt-3 space-y-2 text-sm">
                    <div class="flex justify-between">
                      <span class="text-gray-600">Región:</span>
                      <span class="font-medium text-gray-800">${feature.properties.region || 'N/A'}</span>
                    </div>

                    <div class="flex justify-between">
                      <span class="text-gray-600">Clientes:</span>
                      <span class="font-medium text-gray-800">${feature.properties.clientes ? feature.properties.clientes.toLocaleString('es-EC') : 'N/A'}</span>
                    </div>
                  </div>

                  <div class="mt-3 pt-2 border-t border-gray-200">
                    <div class="text-xs text-gray-500 text-center">
                      🏭 Área de Concesión • 📊 Empresa Distribuidora
                    </div>
                  </div>
                </div>
              `;

              // Bind popup with options to prevent auto-pan
              layer.bindPopup(popup, {
                autoPan: false,  // Prevent automatic panning
                keepInView: false, // Don't keep in view
                closeButton: true,
                maxWidth: 300
              });
            }
          }).addTo(mapInstance);
          
          geoJsonLayerRef.current = geoJsonLayer;
        })
        .catch(error => {
          console.error('Error loading GeoJSON:', error);
          
          if (error instanceof GeoJSONError) {
            setError(`Error en datos del mapa: ${error.message}`);
          } else {
            setError('Error cargando las áreas de cobertura de empresas eléctricas');
          }
        });
    }
  }, [mapInstance, L, hoveredEmpresa, selectedEmpresa, handleEmpresaClick, getRegionColor]);

  useEffect(() => {
    if (mapInstance && L) {
      createCargaMarkers();
    }
  }, [mapInstance, L, createCargaMarkers]);

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

        // Añadir estilos específicos para el contenedor del mapa
        if (!document.querySelector('#leaflet-container-fix')) {
          const style = document.createElement('style');
          style.id = 'leaflet-container-fix';
          style.textContent = `
            .leaflet-container {
              width: 100% !important;
              height: 100% !important;
              max-width: 100% !important;
              max-height: 100% !important;
              overflow: hidden !important;
            }
            .leaflet-map-pane {
              width: 100% !important;
              height: 100% !important;
              overflow: hidden !important;
            }
            .leaflet-tile-pane {
              width: 100% !important;
              height: 100% !important;
            }
            .leaflet-control-container {
              position: relative !important;
            }
          `;
          document.head.appendChild(style);
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
    let mounted = true;
    
    const init = async () => {
      if (L && containerRef.current && mounted && !mapInstanceRef.current) {
        await new Promise(resolve => setTimeout(resolve, 200)); // Dar tiempo al DOM
        if (mounted && !mapInstanceRef.current) { // Verificar nuevamente después del delay
          initializeMap();
        }
      }
    };
    
    init();
    
    return () => {
      mounted = false;
    };
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
    <div className="w-full h-96 relative" style={{ height: '384px', maxHeight: '384px', overflow: 'hidden' }}>
      {isLoading && (
        <div className="absolute inset-0 bg-slate-100 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Inicializando mapa con basemap...</p>
          </div>
        </div>
      )}
      <div 
        ref={containerRef} 
        className="w-full h-full rounded-lg"
        style={{ 
          height: '384px', 
          width: '100%',
          overflow: 'hidden',
          position: 'relative'
        }} 
      />
      
      {/* Leyenda */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border text-xs z-[1000] max-h-80 overflow-y-auto">
        <div className="font-semibold text-gray-800 mb-2 text-center">Áreas de Concesión</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded" style={{ borderColor: '#FFFFFF', border: '1px solid' }}></div>
            <span>Seleccionada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded"></div>
            <span>Hover</span>
          </div>
          {showCargas && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <span>Carga Singular</span>
            </div>
          )}
          <div className="border-t pt-1 mt-2">
            <div className="text-xs text-gray-600 mb-1">Regiones:</div>
            <div className="grid grid-cols-1 gap-1">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded" style={{ backgroundColor: '#10B981' }}></div>
                <span className="text-xs">Norte</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded" style={{ backgroundColor: '#3B82F6' }}></div>
                <span className="text-xs">Pichincha</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded" style={{ backgroundColor: '#0EA5E9' }}></div>
                <span className="text-xs">Guayas</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded" style={{ backgroundColor: '#F59E0B' }}></div>
                <span className="text-xs">Sur</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded" style={{ backgroundColor: '#FB7185' }}></div>
                <span className="text-xs">Galápagos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default EmpresasElectricasMapWithLeaflet;