import { z } from 'zod';

export enum TimeHorizon {
  SHORT_TERM = 'short_term',     // 0-2 años
  MEDIUM_TERM = 'medium_term',   // 2-5 años
  LONG_TERM = 'long_term'        // 5-15 años
}

export enum DataQuality {
  HIGH = 'high',      // >95% completitud, <5% outliers
  MEDIUM = 'medium',  // 80-95% completitud, 5-15% outliers
  LOW = 'low'         // <80% completitud, >15% outliers
}

export enum ForecastModel {
  PROPHET = 'prophet',
  GRU = 'gru',
  WAVENET = 'wavenet',
  GBR = 'gbr',
  ENSEMBLE = 'ensemble',
  SARIMAX = 'sarimax',
  ECONOMETRIC = 'econometric',
  HYBRID_BOTTOM_UP = 'hybrid_bottom_up',
  HYBRID_TOP_DOWN = 'hybrid_top_down'
}

export interface ModelPerformance {
  mape: number;        // Mean Absolute Percentage Error
  rmse: number;        // Root Mean Square Error
  mae: number;         // Mean Absolute Error
  r2: number;          // R-squared
  lastUpdated: Date;
  sampleSize: number;
}

export interface ModelCapabilities {
  supportsSeasonality: boolean;
  supportsExogenousVars: boolean;
  supportsMultivariate: boolean;
  computationalComplexity: 'low' | 'medium' | 'high';
  trainingTime: 'fast' | 'medium' | 'slow';
  interpretability: 'high' | 'medium' | 'low';
}

export interface HorizonModelMapping {
  [TimeHorizon.SHORT_TERM]: {
    primary: ForecastModel[];
    fallback: ForecastModel[];
    minDataPoints: number;
    maxForecastMonths: number;
  };
  [TimeHorizon.MEDIUM_TERM]: {
    primary: ForecastModel[];
    fallback: ForecastModel[];
    minDataPoints: number;
    maxForecastMonths: number;
  };
  [TimeHorizon.LONG_TERM]: {
    primary: ForecastModel[];
    fallback: ForecastModel[];
    minDataPoints: number;
    maxForecastMonths: number;
  };
}

export interface SectorModelPreferences {
  residential: HorizonModelMapping;
  commercial: HorizonModelMapping;
  industrial: HorizonModelMapping;
  publicLighting: HorizonModelMapping;
  others: HorizonModelMapping;
}

const ModelSelectionSchema = z.object({
  sector: z.enum(['residential', 'commercial', 'industrial', 'publicLighting', 'others']),
  horizon: z.nativeEnum(TimeHorizon),
  dataQuality: z.nativeEnum(DataQuality),
  availableDataPoints: z.number().min(12),
  hasExogenousVars: z.boolean().optional(),
  requiresInterpretability: z.boolean().optional(),
  computationalBudget: z.enum(['low', 'medium', 'high']).optional()
});

export type ModelSelectionRequest = z.infer<typeof ModelSelectionSchema>;

export class EnhancedModelRegistry {
  private static instance: EnhancedModelRegistry;
  private modelPerformance: Map<string, ModelPerformance> = new Map();
  private modelCapabilities: Map<ForecastModel, ModelCapabilities> = new Map();
  private sectorPreferences: SectorModelPreferences = {} as SectorModelPreferences;

  private constructor() {
    this.initializeModelCapabilities();
    this.initializeSectorPreferences();
  }

  public static getInstance(): EnhancedModelRegistry {
    if (!EnhancedModelRegistry.instance) {
      EnhancedModelRegistry.instance = new EnhancedModelRegistry();
    }
    return EnhancedModelRegistry.instance;
  }

  private initializeModelCapabilities(): void {
    this.modelCapabilities.set(ForecastModel.PROPHET, {
      supportsSeasonality: true,
      supportsExogenousVars: true,
      supportsMultivariate: false,
      computationalComplexity: 'low',
      trainingTime: 'fast',
      interpretability: 'high'
    });

    this.modelCapabilities.set(ForecastModel.GRU, {
      supportsSeasonality: true,
      supportsExogenousVars: true,
      supportsMultivariate: true,
      computationalComplexity: 'medium',
      trainingTime: 'medium',
      interpretability: 'low'
    });

    this.modelCapabilities.set(ForecastModel.WAVENET, {
      supportsSeasonality: true,
      supportsExogenousVars: true,
      supportsMultivariate: true,
      computationalComplexity: 'high',
      trainingTime: 'slow',
      interpretability: 'low'
    });

    this.modelCapabilities.set(ForecastModel.GBR, {
      supportsSeasonality: false,
      supportsExogenousVars: true,
      supportsMultivariate: true,
      computationalComplexity: 'medium',
      trainingTime: 'medium',
      interpretability: 'medium'
    });

    this.modelCapabilities.set(ForecastModel.ENSEMBLE, {
      supportsSeasonality: true,
      supportsExogenousVars: true,
      supportsMultivariate: true,
      computationalComplexity: 'high',
      trainingTime: 'slow',
      interpretability: 'medium'
    });

    this.modelCapabilities.set(ForecastModel.SARIMAX, {
      supportsSeasonality: true,
      supportsExogenousVars: true,
      supportsMultivariate: false,
      computationalComplexity: 'low',
      trainingTime: 'fast',
      interpretability: 'high'
    });

    this.modelCapabilities.set(ForecastModel.ECONOMETRIC, {
      supportsSeasonality: false,
      supportsExogenousVars: true,
      supportsMultivariate: true,
      computationalComplexity: 'low',
      trainingTime: 'fast',
      interpretability: 'high'
    });
  }

  private initializeSectorPreferences(): void {
    this.sectorPreferences = {
      residential: {
        [TimeHorizon.SHORT_TERM]: {
          primary: [ForecastModel.PROPHET, ForecastModel.GRU, ForecastModel.ENSEMBLE],
          fallback: [ForecastModel.SARIMAX, ForecastModel.GBR],
          minDataPoints: 24,
          maxForecastMonths: 24
        },
        [TimeHorizon.MEDIUM_TERM]: {
          primary: [ForecastModel.ENSEMBLE, ForecastModel.WAVENET, ForecastModel.HYBRID_BOTTOM_UP],
          fallback: [ForecastModel.PROPHET, ForecastModel.GRU],
          minDataPoints: 36,
          maxForecastMonths: 60
        },
        [TimeHorizon.LONG_TERM]: {
          primary: [ForecastModel.ECONOMETRIC, ForecastModel.HYBRID_TOP_DOWN, ForecastModel.ENSEMBLE],
          fallback: [ForecastModel.PROPHET, ForecastModel.SARIMAX],
          minDataPoints: 60,
          maxForecastMonths: 180
        }
      },
      commercial: {
        [TimeHorizon.SHORT_TERM]: {
          primary: [ForecastModel.GRU, ForecastModel.WAVENET, ForecastModel.ENSEMBLE],
          fallback: [ForecastModel.PROPHET, ForecastModel.GBR],
          minDataPoints: 24,
          maxForecastMonths: 24
        },
        [TimeHorizon.MEDIUM_TERM]: {
          primary: [ForecastModel.ENSEMBLE, ForecastModel.HYBRID_BOTTOM_UP, ForecastModel.WAVENET],
          fallback: [ForecastModel.GRU, ForecastModel.PROPHET],
          minDataPoints: 36,
          maxForecastMonths: 60
        },
        [TimeHorizon.LONG_TERM]: {
          primary: [ForecastModel.ECONOMETRIC, ForecastModel.HYBRID_TOP_DOWN, ForecastModel.ENSEMBLE],
          fallback: [ForecastModel.PROPHET, ForecastModel.SARIMAX],
          minDataPoints: 60,
          maxForecastMonths: 180
        }
      },
      industrial: {
        [TimeHorizon.SHORT_TERM]: {
          primary: [ForecastModel.WAVENET, ForecastModel.GRU, ForecastModel.ENSEMBLE],
          fallback: [ForecastModel.GBR, ForecastModel.PROPHET],
          minDataPoints: 18,
          maxForecastMonths: 24
        },
        [TimeHorizon.MEDIUM_TERM]: {
          primary: [ForecastModel.ENSEMBLE, ForecastModel.ECONOMETRIC, ForecastModel.HYBRID_BOTTOM_UP],
          fallback: [ForecastModel.WAVENET, ForecastModel.GRU],
          minDataPoints: 36,
          maxForecastMonths: 60
        },
        [TimeHorizon.LONG_TERM]: {
          primary: [ForecastModel.ECONOMETRIC, ForecastModel.HYBRID_TOP_DOWN, ForecastModel.ENSEMBLE],
          fallback: [ForecastModel.PROPHET, ForecastModel.SARIMAX],
          minDataPoints: 60,
          maxForecastMonths: 180
        }
      },
      publicLighting: {
        [TimeHorizon.SHORT_TERM]: {
          primary: [ForecastModel.PROPHET, ForecastModel.SARIMAX, ForecastModel.GRU],
          fallback: [ForecastModel.GBR, ForecastModel.ENSEMBLE],
          minDataPoints: 24,
          maxForecastMonths: 24
        },
        [TimeHorizon.MEDIUM_TERM]: {
          primary: [ForecastModel.PROPHET, ForecastModel.HYBRID_BOTTOM_UP, ForecastModel.ENSEMBLE],
          fallback: [ForecastModel.SARIMAX, ForecastModel.GRU],
          minDataPoints: 36,
          maxForecastMonths: 60
        },
        [TimeHorizon.LONG_TERM]: {
          primary: [ForecastModel.ECONOMETRIC, ForecastModel.HYBRID_TOP_DOWN, ForecastModel.PROPHET],
          fallback: [ForecastModel.SARIMAX, ForecastModel.ENSEMBLE],
          minDataPoints: 48,
          maxForecastMonths: 180
        }
      },
      others: {
        [TimeHorizon.SHORT_TERM]: {
          primary: [ForecastModel.ENSEMBLE, ForecastModel.GRU, ForecastModel.PROPHET],
          fallback: [ForecastModel.GBR, ForecastModel.WAVENET],
          minDataPoints: 24,
          maxForecastMonths: 24
        },
        [TimeHorizon.MEDIUM_TERM]: {
          primary: [ForecastModel.ENSEMBLE, ForecastModel.HYBRID_BOTTOM_UP, ForecastModel.WAVENET],
          fallback: [ForecastModel.GRU, ForecastModel.PROPHET],
          minDataPoints: 36,
          maxForecastMonths: 60
        },
        [TimeHorizon.LONG_TERM]: {
          primary: [ForecastModel.ECONOMETRIC, ForecastModel.HYBRID_TOP_DOWN, ForecastModel.ENSEMBLE],
          fallback: [ForecastModel.PROPHET, ForecastModel.SARIMAX],
          minDataPoints: 60,
          maxForecastMonths: 180
        }
      }
    };
  }

  public selectOptimalModel(request: ModelSelectionRequest): {
    selectedModel: ForecastModel;
    confidence: number;
    reasoning: string[];
    alternativeModels: ForecastModel[];
  } {
    const validated = ModelSelectionSchema.parse(request);
    const { sector, horizon, dataQuality, availableDataPoints, hasExogenousVars, requiresInterpretability, computationalBudget } = validated;

    const sectorConfig = this.sectorPreferences[sector];
    const horizonConfig = sectorConfig[horizon];
    
    const reasoning: string[] = [];
    let candidateModels = [...horizonConfig.primary];

    if (availableDataPoints < horizonConfig.minDataPoints) {
      candidateModels = [...horizonConfig.fallback];
      reasoning.push(`Datos insuficientes (${availableDataPoints} < ${horizonConfig.minDataPoints}), usando modelos de respaldo`);
    }

    if (dataQuality === DataQuality.LOW) {
      candidateModels = candidateModels.filter(model => {
        const capabilities = this.modelCapabilities.get(model);
        return capabilities?.computationalComplexity !== 'high';
      });
      reasoning.push('Calidad de datos baja: excluyendo modelos de alta complejidad');
    }

    if (requiresInterpretability) {
      candidateModels = candidateModels.filter(model => {
        const capabilities = this.modelCapabilities.get(model);
        return capabilities?.interpretability === 'high';
      });
      reasoning.push('Interpretabilidad requerida: priorizando modelos explicables');
    }

    if (computationalBudget === 'low') {
      candidateModels = candidateModels.filter(model => {
        const capabilities = this.modelCapabilities.get(model);
        return capabilities?.computationalComplexity === 'low';
      });
      reasoning.push('Presupuesto computacional bajo: limitando a modelos eficientes');
    }

    if (hasExogenousVars) {
      candidateModels = candidateModels.filter(model => {
        const capabilities = this.modelCapabilities.get(model);
        return capabilities?.supportsExogenousVars;
      });
      reasoning.push('Variables exógenas disponibles: priorizando modelos que las soportan');
    }

    if (candidateModels.length === 0) {
      candidateModels = [...horizonConfig.fallback];
      reasoning.push('Sin candidatos válidos: recurriendo a modelos de respaldo');
    }

    const selectedModel = this.selectBestPerformingModel(candidateModels, sector, horizon);
    const confidence = this.calculateConfidence(selectedModel, dataQuality, availableDataPoints, horizonConfig.minDataPoints);
    const alternativeModels = candidateModels.filter(model => model !== selectedModel);

    reasoning.push(`Modelo seleccionado: ${selectedModel} (confianza: ${(confidence * 100).toFixed(1)}%)`);

    return {
      selectedModel,
      confidence,
      reasoning,
      alternativeModels
    };
  }

  private selectBestPerformingModel(candidates: ForecastModel[], sector: string, horizon: TimeHorizon): ForecastModel {
    let bestModel = candidates[0];
    let bestScore = 0;

    for (const model of candidates) {
      const performanceKey = `${sector}-${horizon}-${model}`;
      const performance = this.modelPerformance.get(performanceKey);
      
      if (performance) {
        const score = this.calculateModelScore(performance);
        if (score > bestScore) {
          bestScore = score;
          bestModel = model;
        }
      }
    }

    return bestModel;
  }

  private calculateModelScore(performance: ModelPerformance): number {
    const ageWeight = this.calculateAgeWeight(performance.lastUpdated);
    const accuracyScore = Math.max(0, 1 - (performance.mape / 100));
    const sampleSizeScore = Math.min(1, performance.sampleSize / 1000);
    
    return (accuracyScore * 0.6 + performance.r2 * 0.3 + sampleSizeScore * 0.1) * ageWeight;
  }

  private calculateAgeWeight(lastUpdated: Date): number {
    const ageInDays = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0.5, 1 - (ageInDays / 365));
  }

  private calculateConfidence(
    model: ForecastModel, 
    dataQuality: DataQuality, 
    availableDataPoints: number, 
    minDataPoints: number
  ): number {
    let confidence = 0.8; // Base confidence

    const dataQualityMultiplier = {
      [DataQuality.HIGH]: 1.0,
      [DataQuality.MEDIUM]: 0.85,
      [DataQuality.LOW]: 0.7
    };

    confidence *= dataQualityMultiplier[dataQuality];

    const dataAdequacyRatio = availableDataPoints / minDataPoints;
    if (dataAdequacyRatio < 1) {
      confidence *= dataAdequacyRatio;
    } else if (dataAdequacyRatio > 2) {
      confidence *= Math.min(1.1, 1 + (dataAdequacyRatio - 2) * 0.05);
    }

    return Math.max(0.4, Math.min(0.95, confidence));
  }

  public updateModelPerformance(
    sector: string, 
    horizon: TimeHorizon, 
    model: ForecastModel, 
    performance: Omit<ModelPerformance, 'lastUpdated'>
  ): void {
    const key = `${sector}-${horizon}-${model}`;
    this.modelPerformance.set(key, {
      ...performance,
      lastUpdated: new Date()
    });
  }

  public getModelCapabilities(model: ForecastModel): ModelCapabilities | undefined {
    return this.modelCapabilities.get(model);
  }

  public getSectorPreferences(sector: keyof SectorModelPreferences): HorizonModelMapping {
    return this.sectorPreferences[sector];
  }

  public getPerformanceHistory(sector: string, horizon: TimeHorizon, model: ForecastModel): ModelPerformance | undefined {
    const key = `${sector}-${horizon}-${model}`;
    return this.modelPerformance.get(key);
  }
}

export const modelRegistry = EnhancedModelRegistry.getInstance();