import { z } from 'zod';
import { modelRegistry, TimeHorizon, DataQuality, ForecastModel } from './EnhancedModelRegistry';
import { ipfEngine, ConstraintMatrix } from './IPFReconciliationEngine';
import { tlpEngine, TypicalLoadProfile } from './TypicalLoadProfilesEngine';
import { technicalLossesEngine, TechnicalLossProjection } from './TechnicalLossesEngine';

export interface MultiHorizonRequest {
  company: string;
  region: string;
  sectors: string[];
  projectionYears: number[];
  includeMonthlyData?: boolean;
  reconcileWithIPF?: boolean;
  generateTLP?: boolean;
  includeTechnicalLosses?: boolean;
  dataQuality?: DataQuality;
}

export interface MultiHorizonResult {
  company: string;
  region: string;
  projections: MultiHorizonProjection[];
  reconciliationSummary?: ReconciliationSummary;
  typicalLoadProfiles?: TypicalLoadProfile[];
  technicalLosses?: TechnicalLossProjection[];
  metadata: {
    processingTime: number;
    modelsUsed: Record<string, ForecastModel>;
    confidence: Record<string, number>;
    warnings: string[];
    recommendations: string[];
  };
}

export interface MultiHorizonProjection {
  id: string;
  sector: string;
  timeHorizon: TimeHorizon;
  targetYear: number;
  targetMonth?: number;
  
  selectedModel: ForecastModel;
  confidence: number;
  modelReasoning: string[];
  
  predictions: {
    prophet?: number;
    gru?: number;
    wavenet?: number;
    gbr?: number;
    ensemble?: number;
    sarimax?: number;
    econometric?: number;
    hybridBottomUp?: number;
    hybridTopDown?: number;
  };
  
  reconciledValue?: number;
  isReconciled: boolean;
  
  assumptions: string[];
  dataQuality: DataQuality;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ReconciliationSummary {
  totalIterations: number;
  finalError: number;
  convergenceReached: boolean;
  sectorAdjustments: Record<string, number>;
  companyAdjustments: Record<string, number>;
  processingTime: number;
}

const MultiHorizonRequestSchema = z.object({
  company: z.string().min(1),
  region: z.string().min(1),
  sectors: z.array(z.string()).min(1),
  projectionYears: z.array(z.number()).min(1),
  includeMonthlyData: z.boolean().optional().default(false),
  reconcileWithIPF: z.boolean().optional().default(true),
  generateTLP: z.boolean().optional().default(false),
  includeTechnicalLosses: z.boolean().optional().default(false),
  dataQuality: z.nativeEnum(DataQuality).optional().default(DataQuality.MEDIUM)
});

export class MultiHorizonIntegrator {
  private static instance: MultiHorizonIntegrator;
  private processingHistory: Map<string, MultiHorizonResult[]> = new Map();

  private constructor() {}

  public static getInstance(): MultiHorizonIntegrator {
    if (!MultiHorizonIntegrator.instance) {
      MultiHorizonIntegrator.instance = new MultiHorizonIntegrator();
    }
    return MultiHorizonIntegrator.instance;
  }

  public async generateMultiHorizonProjections(request: MultiHorizonRequest): Promise<MultiHorizonResult> {
    const startTime = performance.now();
    
    const validated = MultiHorizonRequestSchema.parse(request);
    console.log(`Iniciando proyecciones multi-horizonte para ${validated.company}`);

    const projections: MultiHorizonProjection[] = [];
    const modelsUsed: Record<string, ForecastModel> = {};
    const confidence: Record<string, number> = {};
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Paso 1: Generar proyecciones por sector y horizonte
    for (const sector of validated.sectors) {
      for (const year of validated.projectionYears) {
        const horizon = this.determineTimeHorizon(year);
        const sectorProjections = await this.generateSectorProjections(
          validated,
          sector,
          horizon,
          year
        );
        
        projections.push(...sectorProjections);
        
        // Recopilar metadatos
        for (const projection of sectorProjections) {
          const key = `${sector}-${horizon}`;
          modelsUsed[key] = projection.selectedModel;
          confidence[key] = projection.confidence;
          
          if (projection.confidence < 0.7) {
            warnings.push(`Baja confianza en proyección ${key}: ${(projection.confidence * 100).toFixed(1)}%`);
          }
        }
      }
    }

    // Paso 2: Reconciliación con IPF si se solicita
    let reconciliationSummary: ReconciliationSummary | undefined;
    if (validated.reconcileWithIPF) {
      reconciliationSummary = await this.performIPFReconciliation(projections, validated);
      
      if (!reconciliationSummary.convergenceReached) {
        warnings.push('Reconciliación IPF no convergió completamente');
        recommendations.push('Considerar ajustar parámetros de convergencia o revisar datos de entrada');
      }
    }

    // Paso 3: Generar Perfiles Típicos de Carga si se solicita
    let typicalLoadProfiles: TypicalLoadProfile[] | undefined;
    if (validated.generateTLP) {
      try {
        typicalLoadProfiles = await this.generateTypicalLoadProfiles(validated);
        console.log(`Generados ${typicalLoadProfiles.length} perfiles típicos de carga`);
      } catch (error) {
        warnings.push(`Error generando TLPs: ${error}`);
      }
    }

    // Paso 4: Calcular pérdidas técnicas si se solicita
    let technicalLosses: TechnicalLossProjection[] | undefined;
    if (validated.includeTechnicalLosses) {
      try {
        technicalLosses = await this.calculateTechnicalLosses(projections, validated);
        console.log(`Calculadas pérdidas técnicas para ${technicalLosses.length} niveles de tensión`);
      } catch (error) {
        warnings.push(`Error calculando pérdidas técnicas: ${error}`);
      }
    }

    // Paso 5: Generar recomendaciones
    recommendations.push(...this.generateRecommendations(projections, validated));

    const processingTime = performance.now() - startTime;
    
    const result: MultiHorizonResult = {
      company: validated.company,
      region: validated.region,
      projections,
      reconciliationSummary,
      typicalLoadProfiles,
      technicalLosses,
      metadata: {
        processingTime,
        modelsUsed,
        confidence,
        warnings,
        recommendations
      }
    };

    // Guardar en historial
    this.saveToHistory(validated.company, result);
    
    console.log(`Proyección multi-horizonte completada en ${processingTime.toFixed(2)}ms`);
    return result;
  }

  private async generateSectorProjections(
    request: any,
    sector: string,
    horizon: TimeHorizon,
    year: number
  ): Promise<MultiHorizonProjection[]> {
    const projections: MultiHorizonProjection[] = [];
    
    // Simular datos históricos disponibles
    const availableDataPoints = this.estimateAvailableDataPoints(request.company, sector);
    
    // Seleccionar modelo óptimo
    const modelSelection = modelRegistry.selectOptimalModel({
      sector: sector as any,
      horizon,
      dataQuality: request.dataQuality,
      availableDataPoints,
      hasExogenousVars: true,
      requiresInterpretability: false,
      computationalBudget: 'medium'
    });

    // Generar proyecciones mensuales si se solicita
    const months = request.includeMonthlyData ? Array.from({length: 12}, (_, i) => i + 1) : [undefined];
    
    for (const month of months) {
      const projectionId = `${request.company}-${sector}-${horizon}-${year}${month ? `-${month}` : ''}`;
      
      // Simular predicciones de diferentes modelos
      const predictions = await this.simulateModelPredictions(sector, year, month);
      
      const projection: MultiHorizonProjection = {
        id: projectionId,
        sector,
        timeHorizon: horizon,
        targetYear: year,
        targetMonth: month,
        selectedModel: modelSelection.selectedModel,
        confidence: modelSelection.confidence,
        modelReasoning: modelSelection.reasoning,
        predictions,
        isReconciled: false,
        assumptions: this.generateAssumptions(horizon, sector),
        dataQuality: request.dataQuality,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      projections.push(projection);
    }
    
    return projections;
  }

  private determineTimeHorizon(targetYear: number): TimeHorizon {
    const currentYear = new Date().getFullYear();
    const yearsAhead = targetYear - currentYear;
    
    if (yearsAhead <= 2) return TimeHorizon.SHORT_TERM;
    if (yearsAhead <= 5) return TimeHorizon.MEDIUM_TERM;
    return TimeHorizon.LONG_TERM;
  }

  private estimateAvailableDataPoints(company: string, sector: string): number {
    // Simular estimación de puntos de datos disponibles
    const basePoints = 36; // 3 años de datos mensuales
    const sectorMultiplier = {
      'residential': 1.2,
      'commercial': 1.0,
      'industrial': 0.8,
      'publicLighting': 1.1,
      'others': 0.9
    };
    
    return Math.floor(basePoints * (sectorMultiplier[sector as keyof typeof sectorMultiplier] || 1.0));
  }

  private async simulateModelPredictions(sector: string, year: number, month?: number): Promise<MultiHorizonProjection['predictions']> {
    // Simular predicciones de diferentes modelos
    const baseValue = 1000 + Math.random() * 500; // MWh base
    const variation = 0.1; // 10% de variación entre modelos
    
    return {
      prophet: baseValue * (1 + (Math.random() - 0.5) * variation),
      gru: baseValue * (1 + (Math.random() - 0.5) * variation),
      wavenet: baseValue * (1 + (Math.random() - 0.5) * variation),
      gbr: baseValue * (1 + (Math.random() - 0.5) * variation),
      ensemble: baseValue * (1 + (Math.random() - 0.5) * variation * 0.5), // Menor variación en ensemble
      sarimax: baseValue * (1 + (Math.random() - 0.5) * variation),
      econometric: baseValue * (1 + (Math.random() - 0.5) * variation * 1.2), // Mayor variación en largo plazo
      hybridBottomUp: baseValue * (1 + (Math.random() - 0.5) * variation * 0.8),
      hybridTopDown: baseValue * (1 + (Math.random() - 0.5) * variation * 0.8)
    };
  }

  private async performIPFReconciliation(
    projections: MultiHorizonProjection[],
    request: any
  ): Promise<ReconciliationSummary> {
    const startTime = performance.now();
    
    // Agrupar proyecciones por año para reconciliación
    const yearGroups = this.groupProjectionsByYear(projections);
    
    let totalIterations = 0;
    let finalError = 0;
    let convergenceReached = true;
    const sectorAdjustments: Record<string, number> = {};
    const companyAdjustments: Record<string, number> = {};
    
    for (const [year, yearProjections] of yearGroups.entries()) {
      const matrix = this.buildBottomUpMatrix(yearProjections);
      const sectorTargets = this.calculateSectorTargets(yearProjections);
      const companyTargets = this.calculateCompanyTargets(yearProjections);
      
      try {
        const ipfResult = await ipfEngine.reconcile({
          bottomUpMatrix: matrix,
          sectorTargets,
          companyTargets,
          configuration: {
            maxIterations: 1000,
            convergenceTolerance: 1e-6,
            dampingFactor: 0.8,
            minCellValue: 1e-8,
            enableLogging: false
          }
        });
        
        // Aplicar valores reconciliados a las proyecciones
        this.applyReconciledValues(yearProjections, ipfResult.reconciledValues);
        
        totalIterations += ipfResult.iterations;
        finalError = Math.max(finalError, ipfResult.finalError);
        convergenceReached = convergenceReached && ipfResult.convergenceReached;
        
        // Calcular ajustes
        for (let i = 0; i < yearProjections.length; i++) {
          const projection = yearProjections[i];
          const originalValue = this.getSelectedPrediction(projection);
          const adjustmentRatio = projection.reconciledValue! / originalValue;
          sectorAdjustments[projection.sector] = (sectorAdjustments[projection.sector] || 0) + adjustmentRatio;
        }
        
      } catch (error) {
        console.warn(`Error en reconciliación para año ${year}:`, error);
        convergenceReached = false;
      }
    }
    
    // Promediar ajustes por sector
    for (const sector in sectorAdjustments) {
      const sectorProjections = projections.filter(p => p.sector === sector);
      sectorAdjustments[sector] = sectorAdjustments[sector] / sectorProjections.length;
    }
    
    const processingTime = performance.now() - startTime;
    
    return {
      totalIterations,
      finalError,
      convergenceReached,
      sectorAdjustments,
      companyAdjustments: { [request.company]: 1.0 }, // Simplified for single company
      processingTime
    };
  }

  private groupProjectionsByYear(projections: MultiHorizonProjection[]): Map<number, MultiHorizonProjection[]> {
    const groups = new Map<number, MultiHorizonProjection[]>();
    
    for (const projection of projections) {
      const year = projection.targetYear;
      if (!groups.has(year)) {
        groups.set(year, []);
      }
      groups.get(year)!.push(projection);
    }
    
    return groups;
  }

  private buildBottomUpMatrix(projections: MultiHorizonProjection[]): number[][] {
    const sectors = [...new Set(projections.map(p => p.sector))];
    const matrix: number[][] = [];
    
    for (const sector of sectors) {
      const sectorProjections = projections.filter(p => p.sector === sector);
      const row = [this.sumSectorPredictions(sectorProjections)];
      matrix.push(row);
    }
    
    return matrix;
  }

  private sumSectorPredictions(projections: MultiHorizonProjection[]): number {
    return projections.reduce((sum, p) => sum + this.getSelectedPrediction(p), 0);
  }

  private getSelectedPrediction(projection: MultiHorizonProjection): number {
    const key = projection.selectedModel as keyof MultiHorizonProjection['predictions'];
    return projection.predictions[key] || 0;
  }

  private calculateSectorTargets(projections: MultiHorizonProjection[]): number[] {
    const sectors = [...new Set(projections.map(p => p.sector))];
    return sectors.map(sector => {
      const sectorProjections = projections.filter(p => p.sector === sector);
      return this.sumSectorPredictions(sectorProjections);
    });
  }

  private calculateCompanyTargets(projections: MultiHorizonProjection[]): number[] {
    // Para una sola empresa, retorna la suma total
    return [projections.reduce((sum, p) => sum + this.getSelectedPrediction(p), 0)];
  }

  private applyReconciledValues(projections: MultiHorizonProjection[], reconciledMatrix: number[][]): void {
    const sectors = [...new Set(projections.map(p => p.sector))];
    
    for (let i = 0; i < sectors.length; i++) {
      const sector = sectors[i];
      const sectorProjections = projections.filter(p => p.sector === sector);
      const reconciledTotal = reconciledMatrix[i][0];
      const originalTotal = this.sumSectorPredictions(sectorProjections);
      const adjustmentRatio = originalTotal > 0 ? reconciledTotal / originalTotal : 1;
      
      for (const projection of sectorProjections) {
        const originalValue = this.getSelectedPrediction(projection);
        projection.reconciledValue = originalValue * adjustmentRatio;
        projection.isReconciled = true;
      }
    }
  }

  private async generateTypicalLoadProfiles(request: any): Promise<TypicalLoadProfile[]> {
    // Simular generación de TLPs
    // En implementación real, esto usaría datos históricos reales
    const simulatedHistoricalData = this.generateSimulatedLoadData(request);
    
    return await tlpEngine.generateTypicalLoadProfiles({
      historicalData: simulatedHistoricalData,
      configuration: {
        numberOfClusters: 6,
        maxIterations: 300,
        convergenceTolerance: 1e-5,
        initializationMethod: 'kmeans++',
        featureWeights: {
          hour: 1.0,
          dayType: 0.8,
          season: 0.6,
          temperature: 0.4,
          loadMagnitude: 1.2
        },
        distanceMetric: 'euclidean',
        enableSeasonalAdjustment: true,
        minClusterSize: 20
      }
    });
  }

  private generateSimulatedLoadData(request: any): any[] {
    // Generar datos simulados para demostración
    const data = [];
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2024-12-31');
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      for (let hour = 0; hour < 24; hour++) {
        data.push({
          timestamp: new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour),
          load: 100 + Math.sin(hour * Math.PI / 12) * 50 + Math.random() * 20,
          temperature: 20 + Math.random() * 10,
          humidity: 60 + Math.random() * 20,
          dayType: date.getDay() === 0 ? 'sunday' : date.getDay() === 6 ? 'saturday' : 'weekday',
          sector: request.sectors[0], // Simplificado
          company: request.company,
          region: request.region
        });
      }
    }
    
    return data;
  }

  private async calculateTechnicalLosses(
    projections: MultiHorizonProjection[],
    request: any
  ): Promise<TechnicalLossProjection[]> {
    // Convertir proyecciones a demanda para cálculo de pérdidas
    const demandProjections = projections.map(p => ({
      year: p.targetYear,
      month: p.targetMonth,
      energy: p.reconciledValue || this.getSelectedPrediction(p),
      maxDemand: (p.reconciledValue || this.getSelectedPrediction(p)) * 0.8 // Factor simplificado
    }));
    
    return await technicalLossesEngine.projectTechnicalLosses({
      company: request.company,
      region: request.region,
      demandProjections,
      networkCharacteristics: {
        totalLength: 1000, // km
        averageDistance: 25, // km
        conductorType: 'ACSR',
        averageAge: 15, // años
        maintenanceIndex: 0.8,
        loadDensity: 50, // MW/km²
        climaticZone: 'tropical_humid',
        topography: 'mixed'
      },
      historicalLosses: [], // Simplificado
      regulatoryLimits: {
        transmission: 2.0,
        subtransmission: 4.0,
        distribution_mv: 8.0,
        distribution_lv: 12.0
      },
      projectionParameters: {
        includeLoadGrowth: true,
        includeInfrastructureAging: true,
        includeEfficiencyImprovements: true,
        climaticAdjustment: true,
        maintenanceScenario: 'current'
      }
    });
  }

  private generateAssumptions(horizon: TimeHorizon, sector: string): string[] {
    const baseAssumptions = [
      'Continuidad de políticas energéticas actuales',
      'Crecimiento económico moderado',
      'No ocurrencia de crisis energéticas mayores'
    ];
    
    const horizonAssumptions = {
      [TimeHorizon.SHORT_TERM]: [
        'Patrones de consumo estables',
        'Infraestructura eléctrica existente'
      ],
      [TimeHorizon.MEDIUM_TERM]: [
        'Implementación gradual de eficiencia energética',
        'Modernización parcial de redes'
      ],
      [TimeHorizon.LONG_TERM]: [
        'Transformación hacia matriz más limpia',
        'Implementación de redes inteligentes',
        'Cambios en patrones de consumo por tecnología'
      ]
    };
    
    const sectorAssumptions = {
      'residential': ['Crecimiento demográfico estable', 'Mejoras en eficiencia de electrodomésticos'],
      'commercial': ['Crecimiento del sector servicios', 'Digitalización progresiva'],
      'industrial': ['Diversificación industrial', 'Optimización de procesos'],
      'publicLighting': ['Modernización LED gradual', 'Expansión urbana controlada']
    };
    
    return [
      ...baseAssumptions,
      ...horizonAssumptions[horizon],
      ...(sectorAssumptions[sector as keyof typeof sectorAssumptions] || [])
    ];
  }

  private generateRecommendations(projections: MultiHorizonProjection[], request: any): string[] {
    const recommendations: string[] = [];
    
    // Analizar confianza promedio
    const avgConfidence = projections.reduce((sum, p) => sum + p.confidence, 0) / projections.length;
    if (avgConfidence < 0.7) {
      recommendations.push('Mejorar calidad de datos históricos para aumentar confianza en proyecciones');
    }
    
    // Analizar horizontes
    const longTermProjections = projections.filter(p => p.timeHorizon === TimeHorizon.LONG_TERM);
    if (longTermProjections.length > 0) {
      recommendations.push('Considerar escenarios alternativos para proyecciones de largo plazo');
      recommendations.push('Actualizar regularmente supuestos macroeconómicos');
    }
    
    // Analizar sectores
    const sectorCounts = projections.reduce((acc, p) => {
      acc[p.sector] = (acc[p.sector] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    if (sectorCounts['industrial'] && sectorCounts['industrial'] > 2) {
      recommendations.push('Monitorear cambios en política industrial que puedan afectar demanda');
    }
    
    if (sectorCounts['residential'] && sectorCounts['residential'] > 3) {
      recommendations.push('Considerar programas de eficiencia energética residencial');
    }
    
    return recommendations;
  }

  private saveToHistory(company: string, result: MultiHorizonResult): void {
    const history = this.processingHistory.get(company) || [];
    history.push(result);
    
    // Mantener solo los últimos 10 resultados
    if (history.length > 10) {
      history.shift();
    }
    
    this.processingHistory.set(company, history);
  }

  public getProcessingHistory(company: string): MultiHorizonResult[] {
    return this.processingHistory.get(company) || [];
  }

  public clearHistory(): void {
    this.processingHistory.clear();
  }
}

export const multiHorizonIntegrator = MultiHorizonIntegrator.getInstance();