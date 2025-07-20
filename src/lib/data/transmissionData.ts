import { Station, IndustrialLoad } from '@/types/dashboard';

export const transmissionData = {
  stations: [
    { id: 1, name: "Subestación Quito Norte", lat: -0.1807, lng: -78.4678, voltage: 138, demand: 245.6, type: "Transmisión", region: "Norte", status: "Operativo" },
    { id: 2, name: "Subestación Guayaquil", lat: -2.1894, lng: -79.8890, voltage: 230, demand: 389.2, type: "Transmisión", region: "Costa", status: "Operativo" },
    { id: 3, name: "Subestación Cuenca", lat: -2.9001, lng: -79.0059, voltage: 138, demand: 156.8, type: "Distribución", region: "Austro", status: "Operativo" },
    { id: 4, name: "Subestación Ambato", lat: -1.2490, lng: -78.6067, voltage: 69, demand: 98.4, type: "Distribución", region: "Centro", status: "Mantenimiento" },
    { id: 5, name: "Subestación Machala", lat: -3.2581, lng: -79.9553, voltage: 138, demand: 87.3, type: "Transmisión", region: "Costa", status: "Operativo" }
  ] as Station[],
  
  industrialLoads: [
    { id: 1, name: "Petroecuador Refinería Esmeraldas", lat: 0.9593, lng: -79.6927, demand: 45.2, type: "Petrolera", region: "Costa", consumption: 324.5 },
    { id: 2, name: "Holcim Ecuador", lat: -0.3479, lng: -78.1236, demand: 23.8, type: "Cementera", region: "Norte", consumption: 167.2 },
    { id: 3, name: "La Fabril", lat: -1.6783, lng: -79.1561, demand: 18.6, type: "Alimentos", region: "Costa", consumption: 134.7 },
    { id: 4, name: "Acería del Ecuador", lat: -2.1467, lng: -79.8842, demand: 34.1, type: "Siderúrgica", region: "Costa", consumption: 245.8 }
  ] as IndustrialLoad[]
};