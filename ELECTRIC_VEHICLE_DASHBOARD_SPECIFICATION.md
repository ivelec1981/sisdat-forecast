# Especificación Técnica: Dashboard de Monitoreo de Patrones de Carga de Vehículos Eléctricos

## 1. Resumen Ejecutivo

Esta especificación define la arquitectura y diseño para migrar un dashboard R/Shiny de monitoreo de patrones de carga de vehículos eléctricos a una aplicación Next.js moderna con mejoras significativas en UX/UI y capacidades PWA.

### Objetivo Principal
Crear un dashboard interactivo y responsivo que permita monitorear y analizar:
- Patrones de carga de vehículos eléctricos
- Requerimientos totales de potencia
- Comparaciones diarias
- Monitoreo de baterías
- Análisis de impacto en la red eléctrica
- Análisis de modelos y baterías

## 2. Análisis del Sistema R/Shiny Original

### 2.1 Componentes Identificados
```
Dashboard Principal:
├── Módulo de Patrones de Carga
├── Módulo de Requerimientos de Potencia
├── Módulo de Comparaciones Diarias
├── Módulo de Monitoreo de Baterías
├── Módulo de Impacto en Red
└── Módulo de Análisis de Modelos
```

### 2.2 Funcionalidades Clave
- **Visualización de patrones temporales**: Gráficos de líneas y barras para mostrar patrones de carga
- **Análisis comparativo**: Comparaciones entre diferentes períodos y modelos
- **Monitoreo en tiempo real**: Seguimiento del estado de baterías y red
- **Filtros dinámicos**: Selección por fecha, modelo, tipo de batería
- **Exportación de datos**: Capacidad de exportar reportes y gráficos

## 3. Sistema de Diseño Extraído

### 3.1 Paleta de Colores (Tema Oscuro)
```css
:root {
  /* Colores primarios */
  --primary-bg: #1a1a1a;
  --secondary-bg: #2d2d2d;
  --accent-color: #00ff88;
  --warning-color: #ffaa00;
  --danger-color: #ff4444;
  
  /* Colores de texto */
  --text-primary: #ffffff;
  --text-secondary: #cccccc;
  --text-muted: #888888;
  
  /* Colores de gráficos */
  --chart-primary: #00ff88;
  --chart-secondary: #00aaff;
  --chart-tertiary: #ff6600;
  --chart-quaternary: #aa00ff;
  
  /* Colores de estado */
  --status-active: #00ff88;
  --status-inactive: #666666;
  --status-charging: #ffaa00;
  --status-full: #00ff88;
}
```

### 3.2 Tipografía
```css
/* Fuentes principales */
--font-family-primary: 'Inter', sans-serif;
--font-family-mono: 'JetBrains Mono', monospace;

/* Tamaños */
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;
```

### 3.3 Layout y Espaciado
```css
/* Grid responsivo */
--grid-cols-mobile: 1;
--grid-cols-tablet: 2;
--grid-cols-desktop: 3;
--grid-cols-wide: 4;

/* Espaciado */
--spacing-xs: 0.25rem;
--spacing-sm: 0.5rem;
--spacing-md: 1rem;
--spacing-lg: 1.5rem;
--spacing-xl: 2rem;
--spacing-2xl: 3rem;
```

## 4. Arquitectura de Componentes React

### 4.1 Estructura de Carpetas Propuesta
```
src/
├── components/
│   ├── ev-dashboard/           # Componentes específicos de VE
│   │   ├── ChargingPatterns.tsx
│   │   ├── PowerRequirements.tsx
│   │   ├── DailyComparisons.tsx
│   │   ├── BatteryMonitor.tsx
│   │   ├── NetworkImpact.tsx
│   │   └── ModelAnalysis.tsx
│   ├── charts/                # Componentes de gráficos reutilizables
│   │   ├── EVLineChart.tsx
│   │   ├── EVBarChart.tsx
│   │   ├── EVHeatmap.tsx
│   │   ├── EVGaugeChart.tsx
│   │   └── EVAreaChart.tsx
│   ├── ui/                    # Componentes UI base
│   │   ├── EVCard.tsx
│   │   ├── EVButton.tsx
│   │   ├── EVSelect.tsx
│   │   ├── EVDatePicker.tsx
│   │   └── EVTooltip.tsx
│   └── layout/               # Componentes de layout
│       ├── EVSidebar.tsx
│       ├── EVHeader.tsx
│       └── EVMainContent.tsx
├── hooks/                    # Hooks personalizados
│   ├── useEVChargingData.ts
│   ├── useBatteryMonitoring.ts
│   ├── useNetworkAnalysis.ts
│   └── useRealTimeUpdates.ts
├── types/                   # Definiciones de tipos
│   ├── ev-dashboard.ts
│   ├── charging-data.ts
│   └── battery-types.ts
└── lib/                    # Utilidades
    ├── ev-calculations.ts
    ├── chart-utils.ts
    └── data-transformers.ts
```

### 4.2 Componentes Principales

#### 4.2.1 ChargingPatterns.tsx
```typescript
interface ChargingPatternsProps {
  dateRange: DateRange;
  vehicleTypes: VehicleType[];
  chargingStations: Station[];
  viewMode: 'hourly' | 'daily' | 'weekly';
}

export function ChargingPatterns({
  dateRange,
  vehicleTypes,
  chargingStations,
  viewMode
}: ChargingPatternsProps) {
  // Lógica de análisis de patrones
  // Visualización con echarts-for-react
}
```

#### 4.2.2 PowerRequirements.tsx
```typescript
interface PowerRequirementsProps {
  totalDemand: PowerDemand;
  peakHours: TimeSlot[];
  gridCapacity: GridCapacity;
  forecastData: ForecastPoint[];
}

export function PowerRequirements({
  totalDemand,
  peakHours,
  gridCapacity,
  forecastData
}: PowerRequirementsProps) {
  // Análisis de requerimientos de potencia
  // Gráficos de demanda y capacidad
}
```

#### 4.2.3 BatteryMonitor.tsx
```typescript
interface BatteryMonitorProps {
  batteries: BatteryStatus[];
  healthMetrics: HealthMetric[];
  chargingCycles: ChargingCycle[];
  alerts: BatteryAlert[];
}

export function BatteryMonitor({
  batteries,
  healthMetrics,
  chargingCycles,
  alerts
}: BatteryMonitorProps) {
  // Monitoreo en tiempo real de baterías
  // Indicadores de salud y alertas
}
```

## 5. Migración de Gráficos: echarts4r → echarts-for-react

### 5.1 Mapeo de Tipos de Gráficos

| R/Shiny echarts4r | Next.js echarts-for-react | Uso en EV Dashboard |
|-------------------|---------------------------|---------------------|
| `e_line()` | LineChart | Patrones de carga temporal |
| `e_bar()` | BarChart | Comparaciones de consumo |
| `e_scatter()` | ScatterChart | Análisis de eficiencia |
| `e_heatmap()` | HeatmapChart | Mapa de calor de uso |
| `e_gauge()` | GaugeChart | Nivel de batería |
| `e_pie()` | PieChart | Distribución por tipo de VE |

### 5.2 Configuración Base para echarts-for-react

```typescript
import ReactECharts from 'echarts-for-react';

export const EVChartTheme = {
  backgroundColor: '#1a1a1a',
  textStyle: {
    color: '#ffffff',
    fontFamily: 'Inter, sans-serif'
  },
  color: ['#00ff88', '#00aaff', '#ff6600', '#aa00ff', '#ffaa00'],
  grid: {
    top: 60,
    left: 80,
    right: 40,
    bottom: 60,
    backgroundColor: 'transparent',
    borderColor: '#333333'
  },
  xAxis: {
    axisLine: { lineStyle: { color: '#555555' } },
    axisLabel: { color: '#cccccc' },
    splitLine: { lineStyle: { color: '#333333' } }
  },
  yAxis: {
    axisLine: { lineStyle: { color: '#555555' } },
    axisLabel: { color: '#cccccc' },
    splitLine: { lineStyle: { color: '#333333' } }
  }
};
```

### 5.3 Ejemplo de Gráfico de Patrones de Carga

```typescript
export function ChargingPatternsChart({ data }: ChargingPatternsChartProps) {
  const option = {
    title: {
      text: 'Patrones de Carga por Hora',
      textStyle: { color: '#ffffff', fontSize: 16 }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#2d2d2d',
      borderColor: '#555555',
      textStyle: { color: '#ffffff' }
    },
    legend: {
      data: ['Carga Rápida', 'Carga Normal', 'Carga Lenta'],
      textStyle: { color: '#cccccc' }
    },
    xAxis: {
      type: 'category',
      data: data.hours,
      ...EVChartTheme.xAxis
    },
    yAxis: {
      type: 'value',
      name: 'Potencia (kW)',
      ...EVChartTheme.yAxis
    },
    series: [
      {
        name: 'Carga Rápida',
        type: 'line',
        data: data.fastCharging,
        smooth: true,
        lineStyle: { width: 3 }
      },
      {
        name: 'Carga Normal',
        type: 'line',
        data: data.normalCharging,
        smooth: true,
        lineStyle: { width: 3 }
      },
      {
        name: 'Carga Lenta',
        type: 'line',
        data: data.slowCharging,
        smooth: true,
        lineStyle: { width: 3 }
      }
    ]
  };

  return (
    <ReactECharts
      option={option}
      theme="dark"
      style={{ height: '400px', width: '100%' }}
      notMerge={true}
      lazyUpdate={true}
    />
  );
}
```

## 6. Tipos de Datos y Interfaces

### 6.1 Tipos de Vehículos Eléctricos

```typescript
export interface VehicleType {
  id: string;
  name: string;
  batteryCapacity: number; // kWh
  maxChargingPower: number; // kW
  efficiency: number; // km/kWh
  category: 'passenger' | 'commercial' | 'bus' | 'truck';
}

export interface ChargingStation {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  connectorTypes: ConnectorType[];
  maxPower: number; // kW
  availability: 'available' | 'occupied' | 'maintenance';
  networkOperator: string;
}

export interface ChargingSession {
  id: string;
  vehicleId: string;
  stationId: string;
  startTime: Date;
  endTime: Date;
  energyDelivered: number; // kWh
  peakPower: number; // kW
  cost: number;
  userId: string;
}
```

### 6.2 Datos de Monitoreo

```typescript
export interface BatteryStatus {
  vehicleId: string;
  currentSOC: number; // State of Charge (0-100%)
  voltage: number; // V
  current: number; // A
  temperature: number; // °C
  health: number; // 0-100%
  cycleCount: number;
  lastUpdated: Date;
}

export interface PowerDemand {
  timestamp: Date;
  totalDemand: number; // kW
  peakDemand: number; // kW
  averageDemand: number; // kW
  gridLoad: number; // % of grid capacity
  renewableShare: number; // % from renewable sources
}

export interface NetworkImpact {
  timestamp: Date;
  transformerLoad: number; // %
  voltageVariation: number; // %
  frequencyDeviation: number; // Hz
  powerQuality: number; // 0-100%
  gridStability: 'stable' | 'warning' | 'critical';
}
```

## 7. Hooks Personalizados

### 7.1 useEVChargingData

```typescript
export function useEVChargingData(
  dateRange: DateRange,
  stationIds?: string[],
  vehicleTypes?: string[]
) {
  const [data, setData] = useState<ChargingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch charging data with filters
    fetchChargingData(dateRange, stationIds, vehicleTypes)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [dateRange, stationIds, vehicleTypes]);

  const patterns = useMemo(() => 
    analyzeChargingPatterns(data), [data]
  );

  const peakHours = useMemo(() => 
    identifyPeakHours(data), [data]
  );

  return { data, patterns, peakHours, loading, error };
}
```

### 7.2 useRealTimeUpdates

```typescript
export function useRealTimeUpdates() {
  const [batteryStatuses, setBatteryStatuses] = useState<BatteryStatus[]>([]);
  const [networkStatus, setNetworkStatus] = useState<NetworkImpact | null>(null);

  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      
      switch (update.type) {
        case 'BATTERY_UPDATE':
          setBatteryStatuses(prev => 
            updateBatteryStatus(prev, update.data)
          );
          break;
        case 'NETWORK_UPDATE':
          setNetworkStatus(update.data);
          break;
      }
    };

    return () => ws.close();
  }, []);

  return { batteryStatuses, networkStatus };
}
```

## 8. Mejoras Modernas de UX/UI

### 8.1 Diseño Responsivo y Adaptativo

```typescript
// Breakpoints personalizados para dashboard EV
const breakpoints = {
  mobile: '640px',
  tablet: '768px',
  laptop: '1024px',
  desktop: '1280px',
  wide: '1536px'
};

// Grid adaptativo basado en contenido
const responsiveGrid = {
  mobile: 'grid-cols-1',
  tablet: 'grid-cols-2',
  laptop: 'grid-cols-3',
  desktop: 'grid-cols-4',
  wide: 'grid-cols-6'
};
```

### 8.2 Microinteracciones y Animaciones

```typescript
// Configuración de Framer Motion para gráficos
export const chartAnimations = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

// Animaciones para métricas en tiempo real
export const metricCountUp = {
  duration: 1.5,
  ease: 'easeOut',
  preserveValue: true
};
```

### 8.3 Accesibilidad y Usabilidad

```typescript
// Configuración de accesibilidad para gráficos
export const accessibilityConfig = {
  // Soporte para lectores de pantalla
  ariaLabel: 'Gráfico de patrones de carga de vehículos eléctricos',
  
  // Navegación por teclado
  focusable: true,
  tabIndex: 0,
  
  // Alto contraste para daltonismo
  colorBlindFriendly: true,
  
  // Patrones alternativos para gráficos
  usePatterns: true
};
```

### 8.4 Modo Oscuro/Claro

```typescript
export const themeConfig = {
  dark: {
    background: '#1a1a1a',
    surface: '#2d2d2d',
    primary: '#00ff88',
    text: '#ffffff'
  },
  light: {
    background: '#ffffff',
    surface: '#f8f9fa',
    primary: '#00aa66',
    text: '#1a1a1a'
  }
};
```

## 9. Funcionalidades PWA

### 9.1 Service Worker para Datos Offline

```typescript
// sw.js - Service Worker para caché de datos
const CACHE_NAME = 'ev-dashboard-v1';
const API_CACHE = 'ev-api-cache';

// Caché de datos críticos para funcionamiento offline
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/ev-data')) {
    event.respondWith(
      caches.open(API_CACHE).then(cache => {
        return cache.match(event.request).then(response => {
          if (response) {
            // Servir desde caché y actualizar en background
            fetch(event.request).then(fetchResponse => {
              cache.put(event.request, fetchResponse.clone());
            });
            return response;
          }
          return fetch(event.request);
        });
      })
    );
  }
});
```

### 9.2 Notificaciones Push

```typescript
// Configuración de notificaciones para alertas de batería
export const notificationConfig = {
  batteryLow: {
    title: 'Batería Baja',
    body: 'Vehículo {vehicleId} tiene batería por debajo del 20%',
    icon: '/icons/battery-low.png',
    badge: '/icons/badge.png'
  },
  chargingComplete: {
    title: 'Carga Completa',
    body: 'Vehículo {vehicleId} ha completado la carga',
    icon: '/icons/battery-full.png'
  },
  networkAlert: {
    title: 'Alerta de Red',
    body: 'Sobrecarga detectada en {stationName}',
    icon: '/icons/network-warning.png'
  }
};
```

### 9.3 Sincronización en Background

```typescript
// Background sync para datos críticos
self.addEventListener('sync', (event) => {
  if (event.tag === 'ev-data-sync') {
    event.waitUntil(syncEVData());
  }
});

async function syncEVData() {
  // Sincronizar datos de carga, estado de baterías, etc.
  const criticalData = await getCriticalEVData();
  await uploadToServer(criticalData);
}
```

## 10. Stack Técnico Recomendado

### 10.1 Frontend
- **Framework**: Next.js 15 con App Router
- **Styling**: Tailwind CSS + CSS Variables para temas
- **Charts**: echarts-for-react
- **Animations**: Framer Motion
- **State Management**: Zustand + React Query
- **UI Components**: Headless UI + Radix UI
- **Icons**: Lucide React
- **PWA**: next-pwa

### 10.2 Backend y Base de Datos
- **API**: Next.js API Routes + tRPC
- **Database**: PostgreSQL + Prisma ORM
- **Real-time**: WebSocket + Socket.io
- **Caching**: Redis
- **File Storage**: AWS S3 / Cloudinary

### 10.3 DevOps y Deployment
- **Hosting**: Vercel / AWS
- **Monitoring**: Sentry + Vercel Analytics
- **CI/CD**: GitHub Actions
- **Testing**: Jest + Playwright

## 11. Fases de Implementación

### Fase 1: Core Infrastructure (2-3 semanas)
1. Configuración del proyecto Next.js con PWA
2. Configuración de base de datos y APIs
3. Implementación del sistema de diseño base
4. Componentes UI fundamentales

### Fase 2: Módulos Principales (4-5 semanas)
1. Módulo de patrones de carga
2. Módulo de requerimientos de potencia
3. Módulo de monitoreo de baterías
4. Integración de gráficos echarts-for-react

### Fase 3: Funcionalidades Avanzadas (3-4 semanas)
1. Módulo de análisis de red
2. Módulo de análisis de modelos
3. Sistema de notificaciones
4. Funcionalidades offline/PWA

### Fase 4: Optimización y Testing (2-3 semanas)
1. Optimización de rendimiento
2. Testing exhaustivo
3. Documentación
4. Deployment y monitoreo

## 12. Consideraciones de Rendimiento

### 12.1 Optimización de Gráficos
- Virtualización para grandes datasets
- Lazy loading de componentes de gráficos
- Debouncing en filtros y controles
- WebWorkers para cálculos intensivos

### 12.2 Gestión de Estado
- Paginación inteligente
- Caché de consultas con React Query
- Optimistic updates para UX fluida
- Estado compartido mínimo

### 12.3 Bundle Optimization
- Code splitting por módulos
- Tree shaking agresivo
- Compresión de assets
- CDN para recursos estáticos

---

Esta especificación proporciona una base sólida para la migración del dashboard R/Shiny a Next.js, incorporando mejores prácticas modernas y funcionalidades PWA para crear una experiencia de usuario superior en el monitoreo de vehículos eléctricos.