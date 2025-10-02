'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Zap, Power, Activity, AlertTriangle, Settings, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

// ==================== TIPOS ====================
interface NodeData {
  label: string;
  [key: string]: any;
}

interface Node {
  id: string;
  type: 'generator' | 'transformer' | 'bus' | 'breaker' | 'load';
  x: number;
  y: number;
  data: NodeData;
}

interface Edge {
  id: string;
  from: string;
  to: string;
  animated?: boolean;
}

// ==================== DATOS INICIALES (SIN TRASLAPES) ====================
const initialNodes: Node[] = [
  {
    id: 'gen1',
    type: 'generator',
    x: 250,
    y: 250,
    data: { label: 'Generador G1', power: 100, voltage: 13.8, frequency: 60, status: 'online' }
  },
  {
    id: 'bus1',
    type: 'bus',
    x: 500,
    y: 250,
    data: { label: 'Barra 1', voltage: 13.8, current: 4184 }
  },
  {
    id: 't1',
    type: 'transformer',
    x: 750,
    y: 250,
    data: { label: 'T1', primaryVoltage: 13.8, secondaryVoltage: 230, power: 100, impedance: 8, tap: 0 }
  },
  {
    id: 'brk1',
    type: 'breaker',
    x: 1000,
    y: 250,
    data: { label: '52-1', isOpen: false, ratedCurrent: 1200 }
  },
  {
    id: 'bus2',
    type: 'bus',
    x: 1250,
    y: 250,
    data: { label: 'Barra 2', voltage: 230, current: 252 }
  },
  {
    id: 'brk2',
    type: 'breaker',
    x: 1250,
    y: 500,
    data: { label: '52-2', isOpen: false, ratedCurrent: 400 }
  },
  {
    id: 't2',
    type: 'transformer',
    x: 1250,
    y: 750,
    data: { label: 'T2', primaryVoltage: 230, secondaryVoltage: 13.8, power: 50, impedance: 10, tap: 0 }
  },
  {
    id: 'load1',
    type: 'load',
    x: 1250,
    y: 1000,
    data: { label: 'Carga Industrial', power: 40, voltage: 13.8, powerFactor: 0.85 }
  }
];

const initialEdges: Edge[] = [
  { id: 'e1', from: 'gen1', to: 'bus1', animated: true },
  { id: 'e2', from: 'bus1', to: 't1', animated: true },
  { id: 'e3', from: 't1', to: 'brk1', animated: true },
  { id: 'e4', from: 'brk1', to: 'bus2', animated: true },
  { id: 'e5', from: 'bus2', to: 'brk2', animated: true },
  { id: 'e6', from: 'brk2', to: 't2', animated: true },
  { id: 'e7', from: 't2', to: 'load1', animated: true }
];

// ==================== COMPONENTES DE SÍMBOLOS ====================
const GeneratorSymbol = ({ data, selected, onClick }: any) => (
  <g onClick={onClick} style={{ cursor: 'pointer' }}>
    <rect x="-60" y="-60" width="120" height="120" fill="white" stroke={selected ? '#3b82f6' : '#cbd5e1'} strokeWidth={selected ? 3 : 2} rx="8" />
    <circle cx="0" cy="-10" r="28" stroke="#3b82f6" strokeWidth="3" fill="none" />
    <text x="0" y="5" textAnchor="middle" fontSize="32" fontWeight="bold" fill="#3b82f6">G</text>
    <text x="0" y="35" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1e293b">{data.label}</text>
    <text x="0" y="50" textAnchor="middle" fontSize="10" fill="#64748b">{data.voltage} kV</text>
  </g>
);

const TransformerSymbol = ({ data, selected, onClick }: any) => (
  <g onClick={onClick} style={{ cursor: 'pointer' }}>
    <rect x="-75" y="-55" width="150" height="110" fill="white" stroke={selected ? '#10b981' : '#cbd5e1'} strokeWidth={selected ? 3 : 2} rx="8" />
    <circle cx="-25" cy="-5" r="22" stroke="#10b981" strokeWidth="3" fill="none" />
    <circle cx="25" cy="-5" r="22" stroke="#10b981" strokeWidth="3" fill="none" />
    <text x="0" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#10b981">{data.label}</text>
    <text x="0" y="45" textAnchor="middle" fontSize="10" fill="#64748b">{data.primaryVoltage}/{data.secondaryVoltage} kV</text>
  </g>
);

const BusSymbol = ({ data, selected, onClick }: any) => (
  <g onClick={onClick} style={{ cursor: 'pointer' }}>
    <rect x="-60" y="-45" width="120" height="90" fill="white" stroke={selected ? '#8b5cf6' : '#cbd5e1'} strokeWidth={selected ? 3 : 2} rx="8" />
    <rect x="-45" y="-15" width="90" height="20" fill="#8b5cf6" stroke="#6d28d9" strokeWidth="2" />
    <text x="0" y="0" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">BUS</text>
    <text x="0" y="30" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1e293b">{data.label}</text>
  </g>
);

const BreakerSymbol = ({ data, selected, onClick, onToggle }: any) => (
  <g onClick={onClick} style={{ cursor: 'pointer' }}>
    <rect x="-65" y="-75" width="130" height="150" fill="white" stroke={selected ? '#f59e0b' : '#cbd5e1'} strokeWidth={selected ? 3 : 2} rx="8" />
    <line x1="-30" y1="0" x2="-10" y2="0" stroke="#f59e0b" strokeWidth="3" />
    <line x1="-10" y1="0" x2="10" y2={data.isOpen ? -20 : 0} stroke="#f59e0b" strokeWidth="3" style={{ transition: 'all 0.3s' }} />
    <line x1="10" y1="0" x2="30" y2="0" stroke="#f59e0b" strokeWidth="3" />
    <circle cx="-10" cy="0" r="4" fill="#f59e0b" />
    <circle cx="10" cy="0" r="4" fill="#f59e0b" />
    <foreignObject x="-55" y="15" width="110" height="40">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        style={{
          width: '100%',
          padding: '6px',
          background: data.isOpen ? '#ef4444' : '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '11px',
          fontWeight: 'bold'
        }}
      >
        {data.isOpen ? 'ABRIR' : 'CERRAR'}
      </button>
    </foreignObject>
    <text x="0" y="68" textAnchor="middle" fontSize="11" fill="#64748b">{data.label}</text>
  </g>
);

const LoadSymbol = ({ data, selected, onClick }: any) => (
  <g onClick={onClick} style={{ cursor: 'pointer' }}>
    <rect x="-60" y="-55" width="120" height="110" fill="white" stroke={selected ? '#ef4444' : '#cbd5e1'} strokeWidth={selected ? 3 : 2} rx="8" />
    <path d="M -30,-12 L -20,10 L -10,-22 L 0,10 L 10,-22 L 20,10 L 30,-12" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
    <line x1="-35" y1="20" x2="35" y2="20" stroke="#ef4444" strokeWidth="2" />
    <line x1="-30" y1="25" x2="30" y2="25" stroke="#ef4444" strokeWidth="2" />
    <line x1="-25" y1="30" x2="25" y2="30" stroke="#ef4444" strokeWidth="2" />
    <text x="0" y="48" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1e293b">{data.label}</text>
  </g>
);

// ==================== COMPONENTE PRINCIPAL ====================
export default function InteractiveDiagram() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges] = useState<Edge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1800, height: 1200 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [dragFromPalette, setDragFromPalette] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId === selectedNode ? null : nodeId);
  };

  const handleToggleBreaker = (nodeId: string) => {
    setNodes(nodes.map(n =>
      n.id === nodeId && n.type === 'breaker'
        ? { ...n, data: { ...n.data, isOpen: !n.data.isOpen } }
        : n
    ));
  };

  // Función para detectar colisiones
  const checkCollision = (x: number, y: number, excludeId?: string): boolean => {
    const MIN_DISTANCE = 150; // Distancia mínima entre nodos
    return nodes.some(node => {
      if (node.id === excludeId) return false;
      const dx = node.x - x;
      const dy = node.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < MIN_DISTANCE;
    });
  };

  // Snap a grid para posicionamiento limpio
  const snapToGrid = (value: number, gridSize = 50): number => {
    return Math.round(value / gridSize) * gridSize;
  };

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        const svgX = (e.clientX - rect.left) / zoom + viewBox.x;
        const svgY = (e.clientY - rect.top) / zoom + viewBox.y;
        setDragging({
          id: nodeId,
          offsetX: svgX - node.x,
          offsetY: svgY - node.y
        });
      }
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragging && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const svgX = (e.clientX - rect.left) / zoom + viewBox.x;
      const svgY = (e.clientY - rect.top) / zoom + viewBox.y;

      let newX = svgX - dragging.offsetX;
      let newY = svgY - dragging.offsetY;

      // Snap to grid
      newX = snapToGrid(newX);
      newY = snapToGrid(newY);

      // Límites del canvas
      newX = Math.max(100, Math.min(newX, viewBox.width - 100));
      newY = Math.max(100, Math.min(newY, viewBox.height - 100));

      // Solo actualizar si no hay colisión
      if (!checkCollision(newX, newY, dragging.id)) {
        setNodes(nodes => nodes.map(n =>
          n.id === dragging.id ? { ...n, x: newX, y: newY } : n
        ));
      }
    } else if (isPanning) {
      const dx = (e.clientX - panStart.x) / zoom;
      const dy = (e.clientY - panStart.y) / zoom;
      setViewBox(vb => ({
        ...vb,
        x: Math.max(0, vb.x - dx),
        y: Math.max(0, vb.y - dy)
      }));
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, [dragging, isPanning, panStart, zoom, viewBox, nodes]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
    setIsPanning(false);
  }, []);

  const handlePanStart = (e: React.MouseEvent) => {
    if (e.button === 0 && !dragging) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleZoomIn = () => setZoom(z => Math.min(z * 1.2, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z / 1.2, 0.3));
  const handleFitView = () => {
    setZoom(1);
    setViewBox({ x: 0, y: 0, width: 1800, height: 1200 });
  };

  const handleDragStartPalette = (e: React.DragEvent, type: string) => {
    setDragFromPalette(type);
  };

  const handleDragOverCanvas = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnCanvas = (e: React.DragEvent) => {
    e.preventDefault();
    if (!dragFromPalette || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    let x = (e.clientX - rect.left) / zoom + viewBox.x;
    let y = (e.clientY - rect.top) / zoom + viewBox.y;

    // Snap to grid
    x = snapToGrid(x);
    y = snapToGrid(y);

    // Verificar colisiones
    if (checkCollision(x, y)) {
      alert('No se puede colocar el componente: hay otro componente muy cerca. Intenta en otra posición.');
      setDragFromPalette(null);
      return;
    }

    const defaultData: Record<string, NodeData> = {
      generator: { label: 'Gen', power: 50, voltage: 13.8, frequency: 60, status: 'online' },
      transformer: { label: 'T', primaryVoltage: 13.8, secondaryVoltage: 230, power: 50, impedance: 8, tap: 0 },
      bus: { label: 'Bus', voltage: 13.8, current: 0 },
      breaker: { label: '52', isOpen: false, ratedCurrent: 1200 },
      load: { label: 'Load', power: 20, voltage: 13.8, powerFactor: 0.85 }
    };

    const newNode: Node = {
      id: `${dragFromPalette}-${Date.now()}`,
      type: dragFromPalette as Node['type'],
      x,
      y,
      data: defaultData[dragFromPalette]
    };

    setNodes([...nodes, newNode]);
    setDragFromPalette(null);
  };

  useEffect(() => {
    if (dragging || isPanning) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging, isPanning, handleMouseMove, handleMouseUp]);

  const getNodePosition = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  const selectedNodeData = nodes.find(n => n.id === selectedNode);

  const components = [
    { type: 'generator', icon: Zap, label: 'Generador', color: '#3b82f6' },
    { type: 'transformer', icon: Activity, label: 'Transformador', color: '#10b981' },
    { type: 'bus', icon: Power, label: 'Barra', color: '#8b5cf6' },
    { type: 'breaker', icon: AlertTriangle, label: 'Interruptor', color: '#f59e0b' },
    { type: 'load', icon: Settings, label: 'Carga', color: '#ef4444' }
  ];

  return (
    <div className="relative w-full bg-slate-50 rounded-xl border border-slate-200 overflow-hidden" style={{ height: '700px' }}>
      {/* Header */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
        <Zap size={22} />
        <span className="font-bold text-lg">Diagrama Unifilar Interactivo</span>
      </div>

      {/* Paleta de Componentes */}
      <div className="absolute left-4 top-20 z-20 bg-white p-4 rounded-lg shadow-lg w-48 border border-slate-200 max-h-96 overflow-y-auto">
        <div className="font-bold mb-3 text-sm text-slate-800">Componentes</div>
        {components.map(({ type, icon: Icon, label, color }) => (
          <div
            key={type}
            draggable
            onDragStart={(e) => handleDragStartPalette(e, type)}
            className="p-2.5 mb-2 bg-white border-2 rounded-lg cursor-grab flex items-center gap-2 text-sm hover:scale-105 transition-transform"
            style={{ borderColor: color }}
          >
            <Icon size={18} color={color} />
            <span className="text-slate-700 font-medium text-xs">{label}</span>
          </div>
        ))}
      </div>

      {/* Panel de Inspección */}
      <div className="absolute right-4 top-20 z-20 bg-white p-4 rounded-lg shadow-lg w-72 border border-slate-200 max-h-80 overflow-y-auto">
        {selectedNodeData ? (
          <>
            <div className="font-bold text-sm mb-1 text-slate-800">{selectedNodeData.data.label}</div>
            <div className="text-xs font-semibold mb-3 pb-2 border-b border-slate-200" style={{ color: components.find(c => c.type === selectedNodeData.type)?.color }}>
              {components.find(c => c.type === selectedNodeData.type)?.label}
            </div>
            <div className="text-xs space-y-2">
              {Object.entries(selectedNodeData.data).map(([key, value]) => {
                if (key === 'label') return null;
                return (
                  <div key={key} className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                    <span className="font-semibold text-slate-800">{typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value}</span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center text-slate-400 text-xs py-6">
            Selecciona un componente para ver sus detalles
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="absolute bottom-4 right-4 z-20 bg-white p-2 rounded-lg shadow-lg flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2.5 hover:bg-slate-100 rounded-lg transition-colors"
          title="Acercar"
        >
          <ZoomIn size={20} className="text-slate-700" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2.5 hover:bg-slate-100 rounded-lg transition-colors"
          title="Alejar"
        >
          <ZoomOut size={20} className="text-slate-700" />
        </button>
        <button
          onClick={handleFitView}
          className="p-2.5 hover:bg-slate-100 rounded-lg transition-colors"
          title="Ajustar vista"
        >
          <Maximize2 size={20} className="text-slate-700" />
        </button>
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`p-2.5 rounded-lg transition-colors ${showGrid ? 'bg-blue-100' : 'hover:bg-slate-100'}`}
          title="Mostrar/Ocultar grid"
        >
          <Settings size={20} className={showGrid ? 'text-blue-600' : 'text-slate-700'} />
        </button>
      </div>

      {/* Canvas SVG */}
      <svg
        ref={svgRef}
        className="w-full h-full cursor-move"
        onMouseDown={handlePanStart}
        onDragOver={handleDragOverCanvas}
        onDrop={handleDropOnCanvas}
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
      >
        <defs>
          <pattern id="smallGrid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
          </pattern>
          <pattern id="grid" width="200" height="200" patternUnits="userSpaceOnUse">
            <rect width="200" height="200" fill="url(#smallGrid)" />
            <path d="M 200 0 L 0 0 0 200" fill="none" stroke="#cbd5e1" strokeWidth="1" />
          </pattern>
        </defs>

        <g transform={`scale(${zoom})`}>
          <g transform={`translate(${-viewBox.x}, ${-viewBox.y})`}>
            {/* Fondo con grid */}
            {showGrid && (
              <rect
                x={viewBox.x}
                y={viewBox.y}
                width={viewBox.width}
                height={viewBox.height}
                fill="url(#grid)"
              />
            )}
            {!showGrid && (
              <rect
                x={viewBox.x}
                y={viewBox.y}
                width={viewBox.width}
                height={viewBox.height}
                fill="#f8fafc"
              />
            )}

            {/* Edges */}
            {edges.map(edge => {
              const from = getNodePosition(edge.from);
              const to = getNodePosition(edge.to);
              const pathId = `path-${edge.id}`;
              return (
                <g key={edge.id}>
                  <defs>
                    <path id={pathId} d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`} fill="none" />
                  </defs>
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {edge.animated && (
                    <>
                      <circle r="6" fill="#fbbf24">
                        <animateMotion dur="2s" repeatCount="indefinite">
                          <mpath href={`#${pathId}`} />
                        </animateMotion>
                      </circle>
                      <circle r="6" fill="#fbbf24">
                        <animateMotion dur="2s" repeatCount="indefinite" begin="1s">
                          <mpath href={`#${pathId}`} />
                        </animateMotion>
                      </circle>
                    </>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map(node => (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseDown={(e) => handleMouseDown(e, node.id)}
                style={{ cursor: dragging?.id === node.id ? 'grabbing' : 'grab' }}
              >
                {node.type === 'generator' && (
                  <GeneratorSymbol
                    data={node.data}
                    selected={selectedNode === node.id}
                    onClick={() => handleNodeClick(node.id)}
                  />
                )}
                {node.type === 'transformer' && (
                  <TransformerSymbol
                    data={node.data}
                    selected={selectedNode === node.id}
                    onClick={() => handleNodeClick(node.id)}
                  />
                )}
                {node.type === 'bus' && (
                  <BusSymbol
                    data={node.data}
                    selected={selectedNode === node.id}
                    onClick={() => handleNodeClick(node.id)}
                  />
                )}
                {node.type === 'breaker' && (
                  <BreakerSymbol
                    data={node.data}
                    selected={selectedNode === node.id}
                    onClick={() => handleNodeClick(node.id)}
                    onToggle={() => handleToggleBreaker(node.id)}
                  />
                )}
                {node.type === 'load' && (
                  <LoadSymbol
                    data={node.data}
                    selected={selectedNode === node.id}
                    onClick={() => handleNodeClick(node.id)}
                  />
                )}
              </g>
            ))}
          </g>
        </g>
      </svg>

      {/* Instrucciones */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg text-xs text-slate-600 max-w-xs">
        <div className="font-semibold text-slate-800 mb-2">💡 Cómo usar:</div>
        <ul className="space-y-1">
          <li>• Arrastra componentes desde la paleta al canvas</li>
          <li>• Haz clic y arrastra componentes para moverlos</li>
          <li>• Arrastra el fondo para desplazar la vista</li>
          <li>• Usa los controles para zoom y ajustar vista</li>
        </ul>
      </div>
    </div>
  );
}
