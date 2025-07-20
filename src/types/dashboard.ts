export interface ProjectionData {
  residential: ModelPredictions;
  commercial: ModelPredictions;
  industrial: ModelPredictions;
  publicLighting: ModelPredictions;
  others: ModelPredictions;
}

export interface ModelPredictions {
  Prophet: number;
  LSTM: number;
  GRU: number;
  BiLSTM: number;
  Econometric: number;
  Real2024: number;
}

export interface Station {
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

export interface IndustrialLoad {
  id: number;
  name: string;
  lat: number;
  lng: number;
  demand: number;
  type: string;
  region: string;
  consumption: number;
}

export interface HistoricalData {
  year: number;
  actual: number;
  prophet: number;
}

export interface FutureProjection {
  year: number;
  prophet: number;
}