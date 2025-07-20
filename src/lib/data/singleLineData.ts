export const singleLineData = {
  generators: [
    { id: "G1", name: "Hidroeléctrica Paute", capacity: 1075, type: "Hidro", status: "Operativo", voltage: 230 },
    { id: "G2", name: "Termoeléctrica Trinitaria", capacity: 130, type: "Térmica", status: "Operativo", voltage: 138 },
    { id: "G3", name: "Eólica Villonaco", capacity: 16.5, type: "Eólica", status: "Operativo", voltage: 69 },
    { id: "G4", name: "Solar El Aromo", capacity: 50, type: "Solar", status: "Operativo", voltage: 138 }
  ],
  
  transformers: [
    { id: "T1", name: "Transformador Quito 230/138", ratio: "230/138", capacity: 300, status: "Operativo" },
    { id: "T2", name: "Transformador Guayaquil 138/69", ratio: "138/69", capacity: 150, status: "Operativo" },
    { id: "T3", name: "Transformador Cuenca 138/69", ratio: "138/69", capacity: 100, status: "Mantenimiento" }
  ],
  
  lines: [
    { id: "L1", from: "Paute", to: "Quito", voltage: 230, length: 400, capacity: 600, status: "Operativo" },
    { id: "L2", from: "Quito", to: "Guayaquil", voltage: 230, length: 420, capacity: 800, status: "Operativo" },
    { id: "L3", from: "Guayaquil", to: "Cuenca", voltage: 138, length: 180, capacity: 300, status: "Operativo" }
  ],
  
  loads: [
    { id: "LOAD1", name: "Carga Quito", demand: 450, type: "Urbana", voltage: 138 },
    { id: "LOAD2", name: "Carga Guayaquil", demand: 380, type: "Urbana", voltage: 138 },
    { id: "LOAD3", name: "Carga Cuenca", demand: 120, type: "Urbana", voltage: 69 },
    { id: "LOAD4", name: "Carga Industrial", demand: 200, type: "Industrial", voltage: 138 }
  ]
};