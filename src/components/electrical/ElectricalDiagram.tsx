'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Zap, Power, Activity, AlertTriangle, Settings, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

// ==================== TIPOS ====================
interface NodeData {
  label: string;
  [key: string]: string | number | boolean;
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

interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DragState {
  id: string;
  offsetX: number;
  offsetY: number;
}

// ==================== DATOS INICIALES ====================
const initialNodes: Node[] = [
  {
    id: 'gen1',
    type: 'generator',
    x: 200,
    y: 300,
    data: { label: 'Generador G1', power: 100, voltage: 13.8, frequency: 60, status: 'online' }
  },
  {
    id: 'bus1',
    type: 'bus',
    x: 450,
    y: 300,
    data: { label: 'Barra 1', voltage: 13.8, current: 4184 }
  },
  {
    id: 't1',
    type: 'transformer',
    x: 700,
    y: 300,
    data: { label: 'T1', primaryVoltage: 13.8, secondaryVoltage: 230, power: 100, impedance: 8, tap: 0 }
  },
  {
    id: 'brk1',
    type: 'breaker',
    x: 980,
    y: 300,
    data: { label: '52-1', isOpen: false, ratedCurrent: 1200 }
  },
  {
    id: 'bus2',
    type: 'bus',
    x: 1200,
    y: 300,
    data: { label: 'Barra 2', voltage: 230, current: 252 }
  },
  {
    id: 'brk2',
    type: 'breaker',
    x: 1200,
    y: 520,
    data: { label: '52-2', isOpen: false, ratedCurrent: 400 }
  },
  {
    id: 't2',
    type: 'transformer',
    x: 1200,
    y: 740,
    data: { label: 'T2', primaryVoltage: 230, secondaryVoltage: 13.8, power: 50, impedance: 10, tap: 0 }
  },
  {
    id: 'load1',
    type: 'load',
    x: 1200,
    y: 980,
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
interface SymbolProps {
  data: NodeData;
  selected: boolean;
  onClick: () => void;
}

interface BreakerSymbolProps extends SymbolProps {
  onToggle: () => void;
}

const GeneratorSymbol: React.FC<SymbolProps> = ({ data, selected, onClick }) => (
  <g onClick={onClick} style={{ cursor: 'pointer' }}>
    <rect x="-70" y="-70" width="140" height="140" fill="white" stroke={selected ? '#3b82f6' : '#cbd5e1'} strokeWidth={selected ? 4 : 2} rx="10" />
    <circle cx="0" cy="-15" r="35" stroke="#3b82f6" strokeWidth="4" fill="none" />
    <text x="0" y="0" textAnchor="middle" fontSize="38" fontWeight="bold" fill="#3b82f6">G</text>
    <text x="0" y="40" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1e293b">{data.label}</text>
    <text x="0" y="58" textAnchor="middle" fontSize="12" fill="#64748b">{data.voltage} kV</text>
  </g>
);

const TransformerSymbol: React.FC<SymbolProps> = ({ data, selected, onClick }) => (
  <g onClick={onClick} style={{ cursor: 'pointer' }}>
    <rect x="-85" y="-60" width="170" height="120" fill="white" stroke={selected ? '#10b981' : '#cbd5e1'} strokeWidth={selected ? 4 : 2} rx="10" />
    <circle cx="-30" cy="-5" r="25" stroke="#10b981" strokeWidth="4" fill="none" />
    <circle cx="30" cy="-5" r="25" stroke="#10b981" strokeWidth="4" fill="none" />
    <text x="0" y="35" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#10b981">{data.label}</text>
    <text x="0" y="52" textAnchor="middle" fontSize="12" fill="#64748b">{data.primaryVoltage}/{data.secondaryVoltage} kV</text>
  </g>
);

const BusSymbol: React.FC<SymbolProps> = ({ data, selected, onClick }) => (
  <g onClick={onClick} style={{ cursor: 'pointer' }}>
    <rect x="-70" y="-50" width="140" height="100" fill="white" stroke={selected ? '#8b5cf6' : '#cbd5e1'} strokeWidth={selected ? 4 : 2} rx="10" />
    <rect x="-50" y="-18" width="100" height="25" fill="#8b5cf6" stroke="#6d28d9" strokeWidth="2" />
    <text x="0" y="0" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">BUS</text>
    <text x="0" y="35" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1e293b">{data.label}</text>
  </g>
);

const BreakerSymbol: React.FC<BreakerSymbolProps> = ({ data, selected, onClick, onToggle }) => (
  <g onClick={onClick} style={{ cursor: 'pointer' }}>
    <rect x="-70" y="-80" width="140" height="160" fill="white" stroke={selected ? '#f59e0b' : '#cbd5e1'} strokeWidth={selected ? 4 : 2} rx="10" />
    <line x1="-35" y1="0" x2="-12" y2="0" stroke="#f59e0b" strokeWidth="4" />
    <line x1="-12" y1="0" x2="12" y2={data.isOpen ? -25 : 0} stroke="#f59e0b" strokeWidth="4" style={{ transition: 'all 0.3s' }} />
    <line x1="12" y1="0" x2="35" y2="0" stroke="#f59e0b" strokeWidth="4" />
    <circle cx="-12" cy="0" r="5" fill="#f59e0b" />
    <circle cx="12" cy="0" r="5" fill="#f59e0b" />
    <foreignObject x="-60" y="20" width="120" height="45">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        style={{
          width: '100%',
          padding: '8px',
          background: data.isOpen ? '#ef4444' : '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 'bold'
        }}
      >
        {data.isOpen ? 'ABRIR' : 'CERRAR'}
      </button>
    </foreignObject>
    <text x="0" y="73" textAnchor="middle" fontSize="12" fill="#64748b">{data.label}</text>
  </g>
);

const LoadSymbol: React.FC<SymbolProps> = ({ data, selected, onClick }) => (
  <g onClick={onClick} style={{ cursor: 'pointer' }}>
    <rect x="-70" y="-60" width="140" height="120" fill="white" stroke={selected ? '#ef4444' : '#cbd5e1'} strokeWidth={selected ? 4 : 2} rx="10" />
    <path d="M -35,-15 L -23,12 L -12,-25 L 0,12 L 12,-25 L 23,12 L 35,-15" fill="none" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
    <line x1="-40" y1="23" x2="40" y2="23" stroke="#ef4444" strokeWidth="2" />
    <line x1="-35" y1="28" x2="35" y2="28" stroke="#ef4444" strokeWidth="2" />
    <line x1="-30" y1="33" x2="30" y2="33" stroke="#ef4444" strokeWidth="2" />
    <text x="0" y="52" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1e293b">{data.label}</text>
  </g>
);

// ==================== COMPONENTE PRINCIPAL ====================
export default function ElectricalDiagram() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges] = useState<Edge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [viewBox, setViewBox] = useState<ViewBox>({ x: 0, y: 100, width: 1600, height: 1000 });
  const [zoom, setZoom] = useState<number>(1);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragFromPalette, setDragFromPalette] = useState<Node['type'] | null>(null);
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

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setDragging({
        id: nodeId,
        offsetX: e.clientX - node.x * zoom,
        offsetY: e.clientY - node.y * zoom
      });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragging) {
      const newX = (e.clientX - dragging.offsetX) / zoom;
      const newY = (e.clientY - dragging.offsetY) / zoom;
      setNodes(nodes => nodes.map(n =>
        n.id === dragging.id ? { ...n, x: newX, y: newY } : n
      ));
    } else if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setViewBox(vb => ({
        ...vb,
        x: vb.x - dx / zoom,
        y: vb.y - dy / zoom
      }));
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, [dragging, isPanning, panStart, zoom]);

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

  const handleZoomIn = () => setZoom(z => Math.min(z * 1.2, 4));
  const handleZoomOut = () => setZoom(z => Math.max(z / 1.2, 0.2));
  const handleFitView = () => {
    setZoom(1);
    setViewBox({ x: 0, y: 100, width: 1600, height: 1000 });
  };

  const handleDragStartPalette = (e: React.DragEvent, type: Node['type']) => {
    setDragFromPalette(type);
  };

  const handleDragOverCanvas = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnCanvas = (e: React.DragEvent) => {
    e.preventDefault();
    if (!dragFromPalette || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom + viewBox.x;
    const y = (e.clientY - rect.top) / zoom + viewBox.y;

    const defaultData: Record<Node['type'], NodeData> = {
      generator: { label: 'Gen', power: 50, voltage: 13.8, frequency: 60, status: 'online' },
      transformer: { label: 'T', primaryVoltage: 13.8, secondaryVoltage: 230, power: 50, impedance: 8, tap: 0 },
      bus: { label: 'Bus', voltage: 13.8, current: 0 },
      breaker: { label: '52', isOpen: false, ratedCurrent: 1200 },
      load: { label: 'Load', power: 20, voltage: 13.8, powerFactor: 0.85 }
    };

    const newNode: Node = {
      id: `${dragFromPalette}-${Date.now()}`,
      type: dragFromPalette,
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
    { type: 'generator' as const, icon: Zap, label: 'Generador', color: '#3b82f6' },
    { type: 'transformer' as const, icon: Activity, label: 'Transformador', color: '#10b981' },
    { type: 'bus' as const, icon: Power, label: 'Barra', color: '#8b5cf6' },
    { type: 'breaker' as const, icon: AlertTriangle, label: 'Interruptor', color: '#f59e0b' },
    { type: 'load' as const, icon: Settings, label: 'Carga', color: '#ef4444' }
  ];

  return (
    <div className="relative w-full bg-slate-100 overflow-hidden" style={{ height: '800px' }}>
      {/* Header */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-5 rounded-xl shadow-xl flex items-center gap-4">
        <Zap size={28} />
        <span className="font-bold text-xl">Diagrama Unifilar - Sistema Eléctrico de Potencia</span>
      </div>

      {/* Paleta de Componentes */}
      <div className="absolute left-5 top-24 z-20 bg-white p-5 rounded-xl shadow-lg w-52 border-2 border-slate-200">
        <div className="font-bold mb-4 text-base text-slate-800">Componentes</div>
        {components.map(({ type, icon: Icon, label, color }) => (
          <div
            key={type}
            draggable
            onDragStart={(e) => handleDragStartPalette(e, type)}
            className="p-3 mb-3 bg-white border-2 rounded-lg cursor-grab flex items-center gap-3 text-sm hover:scale-105 transition-transform"
            style={{ borderColor: color }}
          >
            <Icon size={22} color={color} />
            <span className="text-slate-700 font-medium">{label}</span>
          </div>
        ))}
      </div>

      {/* Panel de Inspección */}
      <div className="absolute right-5 top-24 z-20 bg-white p-5 rounded-xl shadow-lg w-80 border-2 border-slate-200 max-h-96 overflow-y-auto">
        {selectedNodeData ? (
          <>
            <div className="font-bold text-base mb-1 text-slate-800">{selectedNodeData.data.label}</div>
            <div className="text-xs font-semibold mb-4 pb-3 border-b-2 border-slate-100" style={{ color: components.find(c => c.type === selectedNodeData.type)?.color }}>
              {components.find(c => c.type === selectedNodeData.type)?.label}
            </div>
            <div className="text-sm space-y-2">
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
          <div className="text-center text-slate-400 text-sm py-8">
            Selecciona un componente para ver sus detalles
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="absolute bottom-6 right-6 z-20 bg-white p-3 rounded-xl shadow-lg flex flex-col gap-2">
        <button onClick={handleZoomIn} className="p-3 hover:bg-slate-100 rounded-lg transition-colors">
          <ZoomIn size={24} className="text-slate-700" />
        </button>
        <button onClick={handleZoomOut} className="p-3 hover:bg-slate-100 rounded-lg transition-colors">
          <ZoomOut size={24} className="text-slate-700" />
        </button>
        <button onClick={handleFitView} className="p-3 hover:bg-slate-100 rounded-lg transition-colors">
          <Maximize2 size={24} className="text-slate-700" />
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
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#cbd5e1" strokeWidth="1" />
          </pattern>
        </defs>

        <g transform={`scale(${zoom}) translate(${-viewBox.x}, ${-viewBox.y})`}>
          <rect x={viewBox.x} y={viewBox.y} width={viewBox.width / zoom} height={viewBox.height / zoom} fill="url(#grid)" />

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
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                {edge.animated && (
                  <>
                    <circle r="7" fill="#fbbf24">
                      <animateMotion dur="2.5s" repeatCount="indefinite">
                        <mpath href={`#${pathId}`} />
                      </animateMotion>
                    </circle>
                    <circle r="7" fill="#fbbf24">
                      <animateMotion dur="2.5s" repeatCount="indefinite" begin="1.25s">
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
      </svg>
    </div>
  );
}
