'use client'

import React, { useState, useMemo } from 'react';
import { Zap, Power, Activity, TrendingUp, Info } from 'lucide-react';

interface BusNode {
  id: string;
  name: string;
  voltage: number;
  x: number;
  y: number;
  type: 'generation' | 'transmission' | 'distribution' | 'load';
  capacity?: number;
  load?: number;
  region: string;
}

interface Line {
  id: string;
  from: string;
  to: string;
  voltage: number;
  capacity: number;
  flow?: number;
  status: 'active' | 'overload' | 'maintenance';
}

interface Generator {
  id: string;
  busId: string;
  name: string;
  type: 'hydro' | 'thermal' | 'solar' | 'wind';
  capacity: number;
  generation: number;
}

export default function ElectricalDiagram() {
  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [selectedLine, setSelectedLine] = useState<string | null>(null);
  const [showFlow, setShowFlow] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [viewMode, setViewMode] = useState<'simplified' | 'detailed'>('simplified');

  const buses: BusNode[] = useMemo(() => [
    { id: 'B_COCA', name: 'Coca', voltage: 230, x: 200, y: 100, type: 'generation', capacity: 1500, load: 1200, region: 'Norte' },
    { id: 'B_QUITO', name: 'Quito', voltage: 230, x: 300, y: 200, type: 'transmission', capacity: 2000, load: 1800, region: 'Pichincha' },
    { id: 'B_IBARRA', name: 'Ibarra', voltage: 138, x: 250, y: 120, type: 'distribution', capacity: 500, load: 450, region: 'Norte' },
    { id: 'B_AMBATO', name: 'Ambato', voltage: 138, x: 350, y: 280, type: 'distribution', capacity: 600, load: 520, region: 'Centro' },
    { id: 'B_RIOBAMBA', name: 'Riobamba', voltage: 138, x: 400, y: 320, type: 'distribution', capacity: 450, load: 380, region: 'Centro' },
    { id: 'B_GUAYAQUIL', name: 'Guayaquil', voltage: 230, x: 450, y: 450, type: 'transmission', capacity: 2500, load: 2200, region: 'Guayas' },
    { id: 'B_MANTA', name: 'Manta', voltage: 138, x: 350, y: 400, type: 'distribution', capacity: 700, load: 620, region: 'Manabí' },
    { id: 'B_MACHALA', name: 'Machala', voltage: 138, x: 500, y: 520, type: 'distribution', capacity: 550, load: 480, region: 'El Oro' },
    { id: 'B_CUENCA', name: 'Cuenca', voltage: 230, x: 450, y: 380, type: 'transmission', capacity: 1800, load: 1500, region: 'Sur' },
    { id: 'B_PAUTE', name: 'Paute', voltage: 230, x: 520, y: 370, type: 'generation', capacity: 1075, load: 900, region: 'Sur' },
    { id: 'B_LOJA', name: 'Loja', voltage: 138, x: 480, y: 480, type: 'distribution', capacity: 400, load: 350, region: 'Sur' },
    { id: 'B_AGOYÁN', name: 'Agoyán', voltage: 230, x: 380, y: 290, type: 'generation', capacity: 156, load: 130, region: 'Centro' },
    { id: 'B_MOLINO', name: 'Molino', voltage: 230, x: 440, y: 340, type: 'generation', capacity: 1100, load: 950, region: 'Sur' },
  ], []);

  const lines: Line[] = useMemo(() => [
    { id: 'L1', from: 'B_COCA', to: 'B_QUITO', voltage: 230, capacity: 1500, flow: 1200, status: 'active' },
    { id: 'L2', from: 'B_QUITO', to: 'B_IBARRA', voltage: 138, capacity: 500, flow: 450, status: 'active' },
    { id: 'L3', from: 'B_QUITO', to: 'B_AMBATO', voltage: 138, capacity: 800, flow: 650, status: 'active' },
    { id: 'L4', from: 'B_AMBATO', to: 'B_AGOYÁN', voltage: 230, capacity: 300, flow: 250, status: 'active' },
    { id: 'L5', from: 'B_AMBATO', to: 'B_RIOBAMBA', voltage: 138, capacity: 600, flow: 520, status: 'active' },
    { id: 'L6', from: 'B_RIOBAMBA', to: 'B_CUENCA', voltage: 230, capacity: 1200, flow: 1050, status: 'active' },
    { id: 'L7', from: 'B_CUENCA', to: 'B_PAUTE', voltage: 230, capacity: 1200, flow: 900, status: 'active' },
    { id: 'L8', from: 'B_CUENCA', to: 'B_MOLINO', voltage: 230, capacity: 1200, flow: 950, status: 'active' },
    { id: 'L9', from: 'B_CUENCA', to: 'B_LOJA', voltage: 138, capacity: 450, flow: 350, status: 'active' },
    { id: 'L10', from: 'B_QUITO', to: 'B_MANTA', voltage: 138, capacity: 800, flow: 620, status: 'active' },
    { id: 'L11', from: 'B_MANTA', to: 'B_GUAYAQUIL', voltage: 230, capacity: 1500, flow: 1300, status: 'active' },
    { id: 'L12', from: 'B_CUENCA', to: 'B_GUAYAQUIL', voltage: 230, capacity: 1800, flow: 1600, status: 'active' },
    { id: 'L13', from: 'B_GUAYAQUIL', to: 'B_MACHALA', voltage: 138, capacity: 600, flow: 480, status: 'active' },
  ], []);

  const generators: Generator[] = useMemo(() => [
    { id: 'G1', busId: 'B_PAUTE', name: 'Paute', type: 'hydro', capacity: 1075, generation: 950 },
    { id: 'G2', busId: 'B_MOLINO', name: 'Molino', type: 'hydro', capacity: 1100, generation: 900 },
    { id: 'G3', busId: 'B_AGOYÁN', name: 'Agoyán', type: 'hydro', capacity: 156, generation: 130 },
    { id: 'G4', busId: 'B_COCA', name: 'Coca Codo Sinclair', type: 'hydro', capacity: 1500, generation: 1200 },
    { id: 'G5', busId: 'B_GUAYAQUIL', name: 'Trinitaria', type: 'thermal', capacity: 130, generation: 110 },
  ], []);

  const getLinePath = (line: Line) => {
    const fromBus = buses.find(b => b.id === line.from);
    const toBus = buses.find(b => b.id === line.to);
    if (!fromBus || !toBus) return '';
    const midX = (fromBus.x + toBus.x) / 2;
    const midY = (fromBus.y + toBus.y) / 2;
    const offset = 20;
    return `M ${fromBus.x} ${fromBus.y} Q ${midX + offset} ${midY - offset} ${toBus.x} ${toBus.y}`;
  };

  const getLineColor = (line: Line) => {
    if (!line.flow) return '#94A3B8';
    const loadPercent = (line.flow / line.capacity) * 100;
    if (line.status === 'maintenance') return '#F59E0B';
    if (line.status === 'overload' || loadPercent > 90) return '#EF4444';
    if (loadPercent > 75) return '#F97316';
    return '#10B981';
  };

  const getLineWidth = (voltage: number) => {
    if (voltage >= 230) return 4;
    if (voltage >= 138) return 3;
    return 2;
  };

  const getBusColor = (bus: BusNode) => {
    if (selectedBus === bus.id) return '#3B82F6';
    switch (bus.type) {
      case 'generation': return '#10B981';
      case 'transmission': return '#8B5CF6';
      case 'distribution': return '#F59E0B';
      case 'load': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const systemMetrics = useMemo(() => {
    const totalGeneration = generators.reduce((sum, g) => sum + g.generation, 0);
    const totalCapacity = generators.reduce((sum, g) => sum + g.capacity, 0);
    const totalLoad = buses.reduce((sum, b) => sum + (b.load || 0), 0);
    const utilizationPercent = (totalGeneration / totalCapacity) * 100;
    return {
      totalGeneration,
      totalCapacity,
      totalLoad,
      utilizationPercent,
      linesActive: lines.filter(l => l.status === 'active').length,
      linesTotal: lines.length,
    };
  }, [generators, buses, lines]);

  return (
    <div className="space-y-6">
      {/* Métricas del Sistema */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="text-green-600" size={20} />
            <span className="text-sm font-medium text-green-700">Generación Total</span>
          </div>
          <div className="text-2xl font-bold text-green-900">{systemMetrics.totalGeneration.toFixed(0)} MW</div>
          <div className="text-xs text-green-600 mt-1">de {systemMetrics.totalCapacity.toFixed(0)} MW disponibles</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="text-blue-600" size={20} />
            <span className="text-sm font-medium text-blue-700">Demanda Total</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{systemMetrics.totalLoad.toFixed(0)} MW</div>
          <div className="text-xs text-blue-600 mt-1">{((systemMetrics.totalLoad / systemMetrics.totalGeneration) * 100).toFixed(1)}% de generación</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-purple-600" size={20} />
            <span className="text-sm font-medium text-purple-700">Utilización</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">{systemMetrics.utilizationPercent.toFixed(1)}%</div>
          <div className="text-xs text-purple-600 mt-1">Capacidad en uso</div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <Power className="text-amber-600" size={20} />
            <span className="text-sm font-medium text-amber-700">Líneas Activas</span>
          </div>
          <div className="text-2xl font-bold text-amber-900">{systemMetrics.linesActive}/{systemMetrics.linesTotal}</div>
          <div className="text-xs text-amber-600 mt-1">Transmisión operativa</div>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <button onClick={() => setShowFlow(!showFlow)} className={`px-3 py-2 rounded-lg text-sm font-medium transition ${showFlow ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              Flujo de Potencia
            </button>
            <button onClick={() => setShowLabels(!showLabels)} className={`px-3 py-2 rounded-lg text-sm font-medium transition ${showLabels ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              Etiquetas
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setViewMode('simplified')} className={`px-3 py-2 rounded-lg text-sm font-medium transition ${viewMode === 'simplified' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              Simplificado
            </button>
            <button onClick={() => setViewMode('detailed')} className={`px-3 py-2 rounded-lg text-sm font-medium transition ${viewMode === 'detailed' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              Detallado
            </button>
          </div>
        </div>
      </div>

      {/* Diagrama SVG */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Sistema Nacional Interconectado</h3>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Info size={16} />
            <span>Click en nodos o líneas para detalles</span>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 overflow-x-auto">
          <svg viewBox="0 0 700 600" className="w-full h-auto" style={{ minHeight: '600px', maxHeight: '800px' }}>
            <defs>
              <linearGradient id="powerFlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
              </linearGradient>
              <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="#10B981" />
              </marker>
            </defs>

            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E2E8F0" strokeWidth="0.5" />
            </pattern>
            <rect width="700" height="600" fill="url(#grid)" />

            {/* Líneas */}
            <g className="transmission-lines">
              {lines.map((line) => {
                const isSelected = selectedLine === line.id;
                const path = getLinePath(line);
                return (
                  <g key={line.id}>
                    <path d={path} fill="none" stroke={getLineColor(line)} strokeWidth={isSelected ? getLineWidth(line.voltage) + 2 : getLineWidth(line.voltage)} strokeLinecap="round" className="cursor-pointer transition-all duration-200 hover:stroke-blue-500" onClick={() => setSelectedLine(isSelected ? null : line.id)} opacity={isSelected ? 1 : 0.7} />
                    {showFlow && line.flow && <path d={path} fill="none" stroke={getLineColor(line)} strokeWidth="2" markerEnd="url(#arrowhead)" opacity="0.6" className="pointer-events-none" />}
                    {showFlow && showLabels && line.flow && (
                      <text x={(buses.find(b => b.id === line.from)!.x + buses.find(b => b.id === line.to)!.x) / 2} y={(buses.find(b => b.id === line.from)!.y + buses.find(b => b.id === line.to)!.y) / 2 - 10} textAnchor="middle" className="text-xs font-medium fill-slate-700 pointer-events-none" style={{ fontSize: '10px' }}>
                        {line.flow.toFixed(0)} MW
                      </text>
                    )}
                  </g>
                );
              })}
            </g>

            {/* Nodos */}
            <g className="bus-nodes">
              {buses.map((bus) => {
                const isSelected = selectedBus === bus.id;
                const hasGenerator = generators.some(g => g.busId === bus.id);
                return (
                  <g key={bus.id}>
                    {hasGenerator && <circle cx={bus.x} cy={bus.y} r="20" fill="#10B981" fillOpacity="0.2" stroke="#10B981" strokeWidth="2" strokeDasharray="4,4" className="pointer-events-none" />}
                    <circle cx={bus.x} cy={bus.y} r={isSelected ? 12 : 10} fill={getBusColor(bus)} stroke="white" strokeWidth="3" className="cursor-pointer transition-all duration-200 hover:r-12" onClick={() => setSelectedBus(isSelected ? null : bus.id)} style={{ filter: isSelected ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))' : 'none' }} />
                    {showLabels && (
                      <g>
                        <text x={bus.x} y={bus.y - 20} textAnchor="middle" className="font-semibold fill-slate-900 pointer-events-none" style={{ fontSize: '12px' }}>{bus.name}</text>
                        <text x={bus.x} y={bus.y + 30} textAnchor="middle" className="text-xs fill-slate-600 pointer-events-none" style={{ fontSize: '10px' }}>{bus.voltage} kV</text>
                      </g>
                    )}
                    {viewMode === 'detailed' && bus.load && bus.capacity && (
                      <g>
                        <rect x={bus.x - 15} y={bus.y + 15} width="30" height="4" fill="#E2E8F0" rx="2" />
                        <rect x={bus.x - 15} y={bus.y + 15} width={(bus.load / bus.capacity) * 30} height="4" fill={bus.load / bus.capacity > 0.9 ? '#EF4444' : '#10B981'} rx="2" />
                      </g>
                    )}
                  </g>
                );
              })}
            </g>

            <g className="region-labels" opacity="0.3">
              <text x="200" y="80" className="text-lg font-bold fill-green-600" style={{ fontSize: '16px' }}>NORTE</text>
              <text x="350" y="260" className="text-lg font-bold fill-purple-600" style={{ fontSize: '16px' }}>CENTRO</text>
              <text x="350" y="430" className="text-lg font-bold fill-blue-600" style={{ fontSize: '16px' }}>COSTA</text>
              <text x="480" y="360" className="text-lg font-bold fill-orange-600" style={{ fontSize: '16px' }}>SUR</text>
            </g>
          </svg>
        </div>

        {/* Panel de información */}
        {(selectedBus || selectedLine) && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            {selectedBus && (() => {
              const bus = buses.find(b => b.id === selectedBus)!;
              const generator = generators.find(g => g.busId === selectedBus);
              return (
                <div>
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <Power size={20} />
                    Subestación {bus.name}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div><span className="text-blue-700 font-medium">Voltaje:</span><p className="text-blue-900 font-bold">{bus.voltage} kV</p></div>
                    <div><span className="text-blue-700 font-medium">Tipo:</span><p className="text-blue-900 font-bold capitalize">{bus.type}</p></div>
                    <div><span className="text-blue-700 font-medium">Región:</span><p className="text-blue-900 font-bold">{bus.region}</p></div>
                    {bus.capacity && <div><span className="text-blue-700 font-medium">Capacidad:</span><p className="text-blue-900 font-bold">{bus.capacity} MW</p></div>}
                    {bus.load && <div><span className="text-blue-700 font-medium">Carga Actual:</span><p className="text-blue-900 font-bold">{bus.load} MW</p></div>}
                    {bus.load && bus.capacity && <div><span className="text-blue-700 font-medium">Utilización:</span><p className="text-blue-900 font-bold">{((bus.load / bus.capacity) * 100).toFixed(1)}%</p></div>}
                  </div>
                  {generator && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap size={16} className="text-green-600" />
                        <span className="font-semibold text-blue-900">Generación {generator.name}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div><span className="text-blue-700 font-medium">Tipo:</span><p className="text-blue-900 font-bold capitalize">{generator.type === 'hydro' ? 'Hidráulica' : generator.type}</p></div>
                        <div><span className="text-blue-700 font-medium">Capacidad:</span><p className="text-blue-900 font-bold">{generator.capacity} MW</p></div>
                        <div><span className="text-blue-700 font-medium">Generación:</span><p className="text-blue-900 font-bold">{generator.generation} MW</p></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
            {selectedLine && (() => {
              const line = lines.find(l => l.id === selectedLine)!;
              const fromBus = buses.find(b => b.id === line.from)!;
              const toBus = buses.find(b => b.id === line.to)!;
              const loadPercent = line.flow ? (line.flow / line.capacity) * 100 : 0;
              return (
                <div>
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <Activity size={20} />
                    Línea {fromBus.name} → {toBus.name}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><span className="text-blue-700 font-medium">Voltaje:</span><p className="text-blue-900 font-bold">{line.voltage} kV</p></div>
                    <div><span className="text-blue-700 font-medium">Capacidad:</span><p className="text-blue-900 font-bold">{line.capacity} MW</p></div>
                    <div><span className="text-blue-700 font-medium">Flujo Actual:</span><p className="text-blue-900 font-bold">{line.flow} MW</p></div>
                    <div><span className="text-blue-700 font-medium">Carga:</span><p className={`font-bold ${loadPercent > 90 ? 'text-red-600' : loadPercent > 75 ? 'text-orange-600' : 'text-green-600'}`}>{loadPercent.toFixed(1)}%</p></div>
                    <div><span className="text-blue-700 font-medium">Estado:</span><p className={`font-bold capitalize ${line.status === 'active' ? 'text-green-600' : line.status === 'overload' ? 'text-red-600' : 'text-orange-600'}`}>{line.status === 'active' ? 'Activa' : line.status === 'overload' ? 'Sobrecarga' : 'Mantenimiento'}</p></div>
                  </div>
                </div>
              );
            })()}
            <button onClick={() => { setSelectedBus(null); setSelectedLine(null); }} className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
              Cerrar detalles
            </button>
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Leyenda</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Tipos de Subestaciones</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div><span className="text-sm text-slate-700">Generación</span></div>
              <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-purple-500 border-2 border-white"></div><span className="text-sm text-slate-700">Transmisión</span></div>
              <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-amber-500 border-2 border-white"></div><span className="text-sm text-slate-700">Distribución</span></div>
              <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white"></div><span className="text-sm text-slate-700">Carga</span></div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Estado de Líneas</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3"><div className="w-8 h-1 bg-green-500 rounded"></div><span className="text-sm text-slate-700">Normal (&lt; 75%)</span></div>
              <div className="flex items-center gap-3"><div className="w-8 h-1 bg-orange-500 rounded"></div><span className="text-sm text-slate-700">Carga Alta (75-90%)</span></div>
              <div className="flex items-center gap-3"><div className="w-8 h-1 bg-red-500 rounded"></div><span className="text-sm text-slate-700">Sobrecarga (&gt; 90%)</span></div>
              <div className="flex items-center gap-3"><div className="w-8 h-1 bg-amber-500 rounded"></div><span className="text-sm text-slate-700">Mantenimiento</span></div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Niveles de Voltaje</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3"><div className="w-8 h-1.5 bg-slate-700 rounded"></div><span className="text-sm text-slate-700">230 kV (Transmisión)</span></div>
              <div className="flex items-center gap-3"><div className="w-8 h-1 bg-slate-600 rounded"></div><span className="text-sm text-slate-700">138 kV (Sub-transmisión)</span></div>
              <div className="flex items-center gap-3"><div className="w-8 h-0.5 bg-slate-500 rounded"></div><span className="text-sm text-slate-700">&lt; 69 kV (Distribución)</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
