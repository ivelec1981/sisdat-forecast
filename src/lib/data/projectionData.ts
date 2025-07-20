import { ProjectionData } from '@/types/dashboard';

export const projectionData: ProjectionData = {
  residential: { Prophet: 3456.8, LSTM: 3289.2, GRU: 3124.5, BiLSTM: 3201.7, Econometric: 4789.3, Real2024: 3045.6 },
  commercial: { Prophet: 2890.4, LSTM: 2156.8, GRU: 2234.1, BiLSTM: 2098.9, Econometric: 4567.2, Real2024: 2543.7 },
  industrial: { Prophet: 4123.7, LSTM: 3987.5, GRU: 4056.3, BiLSTM: 3876.8, Econometric: 4234.9, Real2024: 3845.2 },
  publicLighting: { Prophet: 345.2, LSTM: 298.7, GRU: 312.4, BiLSTM: 287.9, Econometric: 356.8, Real2024: 289.3 },
  others: { Prophet: 1234.6, LSTM: 876.4, GRU: 945.7, BiLSTM: 823.2, Econometric: 1156.4, Real2024: 1087.9 }
};

export const historicalData = [
  { year: 2020, actual: 8500, prophet: 8456 },
  { year: 2021, actual: 8734, prophet: 8721 },
  { year: 2022, actual: 8912, prophet: 8934 },
  { year: 2023, actual: 9123, prophet: 9145 },
  { year: 2024, actual: 9345, prophet: 9367 }
];

export const futureProjections = [
  { year: 2025, prophet: 9589 },
  { year: 2026, prophet: 9834 },
  { year: 2027, prophet: 10089 },
  { year: 2028, prophet: 10356 },
  { year: 2029, prophet: 10634 },
  { year: 2030, prophet: 10923 },
  { year: 2035, prophet: 12456 }
];