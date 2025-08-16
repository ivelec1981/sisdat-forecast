'use client'

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Importa el CSS de Leaflet directamente

// --- Interfaces (sin cambios) ---
interface CargaAgrupada {
  empresa: string;
  id_cliente_ext: string;
  lat: number;
  lng: number;
  s_e_asociada: string;
  nivel_voltaje_kv: number;
  sector: string;
  tarifa: string;
  demanda_total: number;
  demanda_maxima: number;
  years_range: string;
}

interface SimpleMapProps {
  cargas: CargaAgrupada[];
  onCargaSelect: (carga: CargaAgrupada) => void;
}


// --- Componente Corregido ---
export default function SimpleMap({ cargas, onCargaSelect }: SimpleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  // Ref para gestionar la capa de marcadores de forma eficiente
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Efecto para inicializar el mapa una sola vez
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) { // Solo inicializar si no existe
      // Fix para los íconos por defecto de Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      // Crear la instancia del mapa
      const map = L.map(mapRef.current).setView([-1.8312, -78.1834], 7);
      mapInstanceRef.current = map;

      // Agregar capa de tiles (el fondo del mapa)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Crear y agregar la capa que contendrá los marcadores
      markersLayerRef.current = L.layerGroup().addTo(map);
      
      // Agregar la leyenda (solo se crea una vez)
      const legend = new L.Control({ position: 'topright' });
      legend.onAdd = function(map: L.Map) {
        const div = L.DomUtil.create('div', 'legend');
        div.innerHTML = `
          <div style="background: white; padding: 12px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); font-family: Arial; font-size: 11px;">
            <h4 style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold;">Leyenda</h4>
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;"><div style="width: 14px; height: 14px; background: #DC2626; border-radius: 3px;"></div><span>≥230kV</span></div>
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;"><div style="width: 14px; height: 14px; background: #EF4444; border-radius: 3px;"></div><span>≥138kV</span></div>
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;"><div style="width: 14px; height: 14px; background: #F59E0B; border-radius: 3px;"></div><span>69kV</span></div>
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;"><div style="width: 14px; height: 14px; background: #3B82F6; border-radius: 3px;"></div><span>22kV</span></div>
            <div style="border-top: 1px solid #e5e7eb; padding-top: 6px; font-size: 10px; color: #6b7280;">✅ Datos reales del Excel</div>
          </div>
        `;
        return div;
      };
      map.addControl(legend);
    }

    // Función de limpieza para destruir el mapa al desmontar el componente
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // <-- Dependencia vacía es la clave aquí

  // Efecto para actualizar marcadores cuando cambian las cargas
  useEffect(() => {
    // Verificar que la capa de marcadores exista
    if (!markersLayerRef.current) return;

    // Limpiar marcadores previos
    markersLayerRef.current.clearLayers();

    // Agregar marcadores optimizados
    cargas.forEach((carga) => {
      let color = '#10B981';
      if (carga.nivel_voltaje_kv >= 230) color = '#DC2626';
      else if (carga.nivel_voltaje_kv >= 138) color = '#EF4444';
      else if (carga.nivel_voltaje_kv >= 69) color = '#F59E0B';
      else if (carga.nivel_voltaje_kv >= 22) color = '#3B82F6';
      
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 4px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px; cursor: pointer;">C</div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const marker = L.marker([carga.lat, carga.lng], { icon });
      
      // El popup se puede generar aquí, es ligero
      marker.bindPopup(`
        <div style="font-family: Arial; font-size: 12px; max-width: 250px;">
          <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 14px;">${carga.empresa}</h4>
          <p style="margin: 2px 0;"><strong>Cliente:</strong> ${carga.id_cliente_ext}</p>
          <p style="margin: 2px 0;"><strong>S/E:</strong> ${carga.s_e_asociada}</p>
          <p style="margin: 2px 0;"><strong>Voltaje:</strong> ${carga.nivel_voltaje_kv} kV</p>
          <p style="margin: 2px 0;"><strong>Sector:</strong> ${carga.sector}</p>
          <p style="margin: 2px 0;"><strong>Tarifa:</strong> ${carga.tarifa}</p>
          <p style="margin: 2px 0;"><strong>Dem. Total:</strong> ${carga.demanda_total.toFixed(2)} MW</p>
          <p style="margin: 2px 0;"><strong>Dem. Máxima:</strong> ${carga.demanda_maxima.toFixed(2)} MW</p>
          <p style="margin: 2px 0;"><strong>Período:</strong> ${carga.years_range}</p>
        </div>
      `);

      marker.on('click', () => onCargaSelect(carga));
      
      // Añadir marcador a la capa
      if (markersLayerRef.current) {
        marker.addTo(markersLayerRef.current);
      }
    });

  }, [cargas, onCargaSelect]); // <-- Este efecto depende de las 'cargas'

  // El JSX es ahora mucho más simple, solo el div contenedor
  return (
    <div 
      ref={mapRef}
      style={{ 
        height: '384px', 
        width: '100%', 
        borderRadius: '8px',
        backgroundColor: '#f1f5f9'
      }}
    />
  );
}