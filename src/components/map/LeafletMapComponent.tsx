'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react';

// Interfaces
interface CargaAgrupada {
  empresa: string;
  id_cliente_ext: string;
  coord_x: number;
  coord_y: number;
  lat: number;
  lng: number;
  s_e_asociada: string;
  nivel_voltaje_kv: number;
  sector: string;
  tarifa: string;
  registros: any[];
  demanda_total: number;
  demanda_maxima: number;
  demanda_promedio: number;
  years_range: string;
  anios_proyeccion: number[];
}

interface Station {
  id: number;
  name: string;
  lat: number;
  lng: number;
  voltage: number;
  demand: number;
  type: string;
  region: string;
  status: string;
}

interface LeafletMapComponentProps {
  cargasSingulares: CargaAgrupada[];
  transmissionStations: Station[];
  showCargas: boolean;
  showStations: boolean;
  selectedStation: Station | null;
  selectedCarga: CargaAgrupada | null;
  onStationSelect: (station: Station | null) => void;
  onCargaSelect: (carga: CargaAgrupada | null) => void;
}

export default function LeafletMapComponent({
  cargasSingulares,
  transmissionStations,
  showCargas,
  showStations,
  selectedStation,
  selectedCarga,
  onStationSelect,
  onCargaSelect
}: LeafletMapComponentProps) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [L, setL] = useState<any>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);

  // ID único para este componente
  const mapId = useRef(`map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  // Función para limpiar el mapa existente
  const cleanupMap = useCallback(() => {
    if (mapInstance) {
      try {
        mapInstance.remove();
        setMapInstance(null);
      } catch (err) {
        console.warn('Error al limpiar mapa:', err);
      }
    }
    
    // Limpiar contenedor
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
  }, [mapInstance]);

  // Crear iconos personalizados
  const createStationIcon = useCallback((type: string, status: string, leaflet: any) => {
    const color = status === 'Operativo' ? '#10B981' : '#F59E0B';
    const size = type === 'Transmisión' ? 25 : 20;
    
    return new leaflet.DivIcon({
      className: 'custom-div-icon',
      html: `
        <div style="
          background-color: ${color};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 10px;
        ">
          ${type === 'Transmisión' ? 'T' : 'D'}
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
    });
  }, []);

  const createCargaIcon = useCallback((voltaje: number, demandaMax: number, leaflet: any) => {
    let color = '#10B981';
    if (voltaje >= 230) color = '#DC2626';
    else if (voltaje >= 138) color = '#EF4444';
    else if (voltaje >= 69) color = '#F59E0B';
    else if (voltaje >= 22) color = '#3B82F6';
    
    const size = Math.min(Math.max(12, Math.log10(demandaMax + 1) * 5), 35);
    
    return new leaflet.DivIcon({
      className: 'custom-div-icon',
      html: `
        <div style="
          background-color: ${color};
          width: ${size}px;
          height: ${size}px;
          border-radius: 4px;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 9px;
        ">
          C
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
    });
  }, []);

  // Inicializar mapa
  const initializeMap = useCallback(async () => {
    if (!containerRef.current || !L) return;

    try {
      setIsLoading(true);
      setError(null);

      // Limpiar mapa anterior
      cleanupMap();

      // Crear nuevo contenedor
      const mapContainer = document.createElement('div');
      mapContainer.id = mapId.current;
      mapContainer.style.height = '100%';
      mapContainer.style.width = '100%';
      mapContainer.style.borderRadius = '8px';
      
      // Limpiar y agregar nuevo contenedor
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(mapContainer);

      // Pequeño delay para asegurar que el DOM esté listo
      await new Promise(resolve => setTimeout(resolve, 100));

      // Crear mapa
      const map = L.map(mapId.current, {
        center: [-1.8312, -78.1834],
        zoom: 7,
        zoomControl: true,
        attributionControl: true
      });

      // Agregar capa base
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Agregar estaciones si están habilitadas
      if (showStations && transmissionStations.length > 0) {
        transmissionStations.forEach((station) => {
          const marker = L.marker([station.lat, station.lng], {
            icon: createStationIcon(station.type, station.status, L)
          }).addTo(map);

          marker.bindPopup(`
            <div class="p-2">
              <h4 class="font-semibold text-sm text-green-900">${station.name}</h4>
              <p class="text-xs text-gray-600">Voltaje: ${station.voltage} kV</p>
              <p class="text-xs text-gray-600">Demanda: ${station.demand} MW</p>
              <p class="text-xs text-gray-600">Región: ${station.region}</p>
              <span class="inline-block px-1 py-0.5 rounded-full text-xs font-medium ${
                station.status === 'Operativo' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }">
                ${station.status}
              </span>
            </div>
          `);

          marker.on('click', () => {
            onStationSelect(station);
            onCargaSelect(null);
          });
        });
      }

      // Agregar cargas si están habilitadas
      if (showCargas && cargasSingulares.length > 0) {
        cargasSingulares.forEach((carga, index) => {
          const marker = L.marker([carga.lat, carga.lng], {
            icon: createCargaIcon(carga.nivel_voltaje_kv, carga.demanda_maxima, L)
          }).addTo(map);

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
                  <div><strong>Demanda:</strong> ${carga.demanda_maxima.toLocaleString('es-EC')} MWh</div>
                  <div><strong>Total:</strong> ${carga.demanda_total.toLocaleString('es-EC')} MWh</div>
                </div>
                <div class="text-slate-500 text-xs mt-2">
                  🏭 Sector: ${carga.sector} • 📊 Datos reales del Excel
                </div>
              </div>
            </div>
          `);

          marker.on('click', () => {
            onCargaSelect(carga);
            onStationSelect(null);
          });
        });
      }

      // Agregar leyenda
      const legend = L.control({ position: 'topright' });
      legend.onAdd = function() {
        const div = L.DomUtil.create('div', 'map-legend');
        div.innerHTML = `
          <div class="bg-white p-3 rounded-lg shadow-lg border">
            <h4 class="font-semibold text-sm mb-3 text-slate-800">Leyenda</h4>
            <div class="space-y-2 text-xs">
              <div class="flex items-center gap-2">
                <div style="width: 16px; height: 16px; background-color: #10B981; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
                <span>Estación Operativa</span>
              </div>
              <div class="flex items-center gap-2">
                <div style="width: 16px; height: 16px; background-color: #F59E0B; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
                <span>Estación Mantenimiento</span>
              </div>
              <hr style="margin: 8px 0; border-color: #e5e7eb;">
              <div class="flex items-center gap-2">
                <div style="width: 14px; height: 14px; background-color: #DC2626; border-radius: 3px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
                <span>Carga ≥230kV</span>
              </div>
              <div class="flex items-center gap-2">
                <div style="width: 14px; height: 14px; background-color: #EF4444; border-radius: 3px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
                <span>Carga ≥138kV</span>
              </div>
              <div class="flex items-center gap-2">
                <div style="width: 14px; height: 14px; background-color: #F59E0B; border-radius: 3px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
                <span>Carga 69kV</span>
              </div>
              <div class="flex items-center gap-2">
                <div style="width: 14px; height: 14px; background-color: #3B82F6; border-radius: 3px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
                <span>Carga 22kV</span>
              </div>
              <div style="font-size: 10px; color: #6b7280; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                ✅ Datos reales del Excel<br/>
                Tamaño = nivel de demanda
              </div>
            </div>
          </div>
        `;
        return div;
      };
      legend.addTo(map);

      setMapInstance(map);
      setIsLoading(false);

    } catch (err) {
      console.error('Error inicializando mapa:', err);
      setError(`Error al cargar el mapa: ${err}`);
      setIsLoading(false);
    }
  }, [L, showCargas, showStations, cargasSingulares, transmissionStations, onStationSelect, onCargaSelect, createStationIcon, createCargaIcon, cleanupMap]);

  // Cargar Leaflet
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        // Cargar CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
          link.integrity = 'sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }

        // Cargar JS
        const leafletModule = await import('leaflet');
        const leaflet = leafletModule.default;

        // Fix para iconos
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

  // Inicializar mapa cuando Leaflet esté listo
  useEffect(() => {
    if (L && containerRef.current) {
      initializeMap();
    }
  }, [L, initializeMap]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      cleanupMap();
    };
  }, [cleanupMap]);

  // Manejar errores
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
            <p className="text-slate-600">Inicializando mapa...</p>
          </div>
        </div>
      )}
      <div ref={containerRef} className="h-full w-full rounded-lg" />
    </div>
  );
}