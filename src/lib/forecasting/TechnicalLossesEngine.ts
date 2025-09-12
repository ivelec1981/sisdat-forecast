import { z } from 'zod';

export enum LossType {
  FIXED = 'fixed',           // Pérdidas fijas (independientes de la carga)
  VARIABLE = 'variable',     // Pérdidas variables (proporcionales a la carga)
  TOTAL = 'total'           // Pérdidas totales
}

export enum VoltageLevel {
  TRANSMISSION = 'transmission',     // Transmisión (≥138 kV)
  SUBTRANSMISSION = 'subtransmission', // Subtransmisión (69-138 kV)
  DISTRIBUTION_MV = 'distribution_mv', // Distribución Media Tensión (4-35 kV)
  DISTRIBUTION_LV = 'distribution_lv'  // Distribución Baja Tensión (≤1 kV)
}

export interface LossComponent {
  voltageLevel: VoltageLevel;
  lossType: LossType;
  value: number;              // Porcentaje de pérdida
  uncertainty: number;        // Incertidumbre (±%)
  methodology: string;        // Metodología de cálculo utilizada
  lastMeasurement: Date;      // Última medición real
  isRegulated: boolean;       // Si está regulado por ARCONEL
  regulatedValue?: number;    // Valor regulado máximo permitido
}

export interface NetworkCharacteristics {
  totalLength: number;        // Longitud total de líneas (km)
  averageDistance: number;    // Distancia promedio (km)
  conductorType: string;      // Tipo de conductor predominante
  averageAge: number;         // Edad promedio de la infraestructura (años)
  maintenanceIndex: number;   // Índice de mantenimiento (0-1)
  loadDensity: number;        // Densidad de carga (MW/km²)
  climaticZone: string;       // Zona climática
  topography: string;         // Topografía predominante
}

export interface TechnicalLossProjection {
  company: string;
  region: string;
  voltageLevel: VoltageLevel;
  projectionYear: number;
  projectionMonth?: number;
  
  fixedLosses: {
    percentage: number;
    absoluteValue: number;     // MWh
    components: {
      corona: number;          // Pérdidas por efecto corona
      insulation: number;      // Pérdidas por aislamiento
      noLoad: number;          // Pérdidas en vacío de transformadores
    };
  };
  
  variableLosses: {
    percentage: number;
    absoluteValue: number;     // MWh
    components: {
      joule: number;           // Pérdidas Joule en conductores
      loadTransformers: number; // Pérdidas con carga en transformadores
      reactive: number;        // Pérdidas por potencia reactiva
    };
  };
  
  totalLosses: {
    percentage: number;
    absoluteValue: number;     // MWh
    regulatoryLimit?: number;  // Límite regulatorio (%)
    compliance: boolean;       // Cumple límite regulatorio
  };
  
  confidence: number;          // Confianza de la proyección (0-1)
  methodology: string;         // Metodología utilizada
  assumptions: string[];       // Supuestos del modelo
}

const TechnicalLossInputSchema = z.object({
  company: z.string(),
  region: z.string(),
  demandProjections: z.array(z.object({
    year: z.number(),
    month: z.number().optional(),
    energy: z.number().min(0),      // MWh
    maxDemand: z.number().min(0)    // MW
  })),
  networkCharacteristics: z.object({
    totalLength: z.number().min(0),
    averageDistance: z.number().min(0),
    conductorType: z.string(),
    averageAge: z.number().min(0),
    maintenanceIndex: z.number().min(0).max(1),
    loadDensity: z.number().min(0),
    climaticZone: z.string(),
    topography: z.string()
  }),
  historicalLosses: z.array(z.object({
    year: z.number(),
    month: z.number().optional(),
    voltageLevel: z.nativeEnum(VoltageLevel),
    lossType: z.nativeEnum(LossType),
    percentage: z.number().min(0).max(100),
    absoluteValue: z.number().min(0),
    measurement: z.boolean()        // true si es medición real, false si es estimación
  })),
  regulatoryLimits: z.record(z.nativeEnum(VoltageLevel), z.number()).optional(),
  projectionParameters: z.object({
    includeLoadGrowth: z.boolean().default(true),
    includeInfrastructureAging: z.boolean().default(true),
    includeEfficiencyImprovements: z.boolean().default(true),
    climaticAdjustment: z.boolean().default(true),
    maintenanceScenario: z.enum(['current', 'improved', 'optimized']).default('current')
  }).default({})
});

export type TechnicalLossInput = z.infer<typeof TechnicalLossInputSchema>;

export interface LossModelParameters {
  // Parámetros del modelo físico
  resistivityFactor: number;      // Factor de resistividad del conductor
  temperatureCoefficient: number; // Coeficiente de temperatura
  loadFactorEffect: number;       // Efecto del factor de carga
  voltageLevelCoefficients: Record<VoltageLevel, number>;
  
  // Parámetros de envejecimiento
  agingDegradationRate: number;   // Tasa de degradación anual (%)
  maintenanceEffectiveness: number; // Efectividad del mantenimiento (0-1)
  
  // Parámetros regulatorios
  efficiencyImprovementRate: number; // Tasa de mejora en eficiencia anual (%)
  investmentEffect: number;       // Efecto de inversiones en reducción de pérdidas
  
  // Parámetros climáticos
  temperatureEffect: number;      // Efecto de temperatura en pérdidas (% por °C)
  humidityEffect: number;         // Efecto de humedad en pérdidas
  altitudeEffect: number;         // Efecto de altitud
}

export class TechnicalLossesEngine {
  private static instance: TechnicalLossesEngine;
  private modelParameters: LossModelParameters;
  private projectionHistory: Map<string, TechnicalLossProjection[]> = new Map();
  
  private constructor() {
    this.initializeModelParameters();
  }

  public static getInstance(): TechnicalLossesEngine {
    if (!TechnicalLossesEngine.instance) {
      TechnicalLossesEngine.instance = new TechnicalLossesEngine();
    }
    return TechnicalLossesEngine.instance;
  }

  private initializeModelParameters(): void {
    this.modelParameters = {
      resistivityFactor: 1.02,     // Factor típico para conductores de aluminio
      temperatureCoefficient: 0.004, // 0.4% por °C
      loadFactorEffect: 0.15,      // 15% de efecto del factor de carga
      voltageLevelCoefficients: {
        [VoltageLevel.TRANSMISSION]: 0.02,      // 2% pérdidas típicas
        [VoltageLevel.SUBTRANSMISSION]: 0.04,   // 4% pérdidas típicas
        [VoltageLevel.DISTRIBUTION_MV]: 0.08,   // 8% pérdidas típicas
        [VoltageLevel.DISTRIBUTION_LV]: 0.12    // 12% pérdidas típicas
      },
      agingDegradationRate: 0.002,  // 0.2% anual
      maintenanceEffectiveness: 0.8, // 80% efectividad
      efficiencyImprovementRate: 0.01, // 1% anual
      investmentEffect: 0.02,       // 2% reducción por inversión
      temperatureEffect: 0.004,     // 0.4% por °C
      humidityEffect: 0.001,        // 0.1% por % humedad
      altitudeEffect: 0.0001        // 0.01% por metro de altitud
    };
  }

  public async projectTechnicalLosses(input: TechnicalLossInput): Promise<TechnicalLossProjection[]> {
    const validated = TechnicalLossInputSchema.parse(input);
    
    console.log(`Iniciando proyección de pérdidas técnicas para ${validated.company}`);
    
    const projections: TechnicalLossProjection[] = [];
    const baselineLosses = this.calculateBaselineLosses(validated.historicalLosses);
    
    for (const demandProjection of validated.demandProjections) {
      for (const voltageLevel of Object.values(VoltageLevel)) {
        const projection = await this.projectLossesForPeriod(
          validated,
          demandProjection,
          voltageLevel,
          baselineLosses
        );
        projections.push(projection);
      }
    }
    
    this.projectionHistory.set(validated.company, projections);
    
    console.log(`Proyección completada: ${projections.length} proyecciones generadas`);
    return projections;
  }

  private calculateBaselineLosses(historicalData: any[]): Map<VoltageLevel, LossComponent> {
    const baseline = new Map<VoltageLevel, LossComponent>();
    
    for (const voltageLevel of Object.values(VoltageLevel)) {
      const levelData = historicalData.filter(d => d.voltageLevel === voltageLevel);
      
      if (levelData.length === 0) {
        // Usar valores típicos si no hay datos históricos
        baseline.set(voltageLevel, {
          voltageLevel,
          lossType: LossType.TOTAL,
          value: this.modelParameters.voltageLevelCoefficients[voltageLevel] * 100,
          uncertainty: 15, // ±15% de incertidumbre para valores típicos
          methodology: 'Valores típicos por nivel de tensión',
          lastMeasurement: new Date(),
          isRegulated: true
        });
        continue;
      }
      
      const recentData = levelData
        .filter(d => d.measurement) // Solo mediciones reales
        .sort((a, b) => b.year - a.year)
        .slice(0, 12); // Últimos 12 períodos
      
      if (recentData.length === 0) {
        continue;
      }
      
      const avgLoss = recentData.reduce((sum, d) => sum + d.percentage, 0) / recentData.length;
      const stdDev = Math.sqrt(
        recentData.reduce((sum, d) => sum + Math.pow(d.percentage - avgLoss, 2), 0) / recentData.length
      );
      
      baseline.set(voltageLevel, {
        voltageLevel,
        lossType: LossType.TOTAL,
        value: avgLoss,
        uncertainty: (stdDev / avgLoss) * 100,
        methodology: 'Promedio de mediciones históricas',
        lastMeasurement: new Date(Math.max(...recentData.map(d => new Date(d.year, d.month || 0).getTime()))),
        isRegulated: true
      });
    }
    
    return baseline;
  }

  private async projectLossesForPeriod(
    input: TechnicalLossInput,
    demandProjection: any,
    voltageLevel: VoltageLevel,
    baselineLosses: Map<VoltageLevel, LossComponent>
  ): Promise<TechnicalLossProjection> {
    const baseline = baselineLosses.get(voltageLevel);
    if (!baseline) {
      throw new Error(`No se encontró línea base para nivel de tensión: ${voltageLevel}`);
    }

    const yearsFromBaseline = demandProjection.year - new Date().getFullYear();
    
    // Calcular pérdidas fijas
    const fixedLosses = this.calculateFixedLosses(
      baseline, 
      input.networkCharacteristics, 
      yearsFromBaseline,
      input.projectionParameters
    );
    
    // Calcular pérdidas variables
    const variableLosses = this.calculateVariableLosses(
      baseline,
      demandProjection,
      input.networkCharacteristics,
      yearsFromBaseline,
      input.projectionParameters
    );
    
    // Calcular pérdidas totales
    const totalLossPercentage = fixedLosses.percentage + variableLosses.percentage;
    const totalLossAbsolute = fixedLosses.absoluteValue + variableLosses.absoluteValue;
    
    // Verificar cumplimiento regulatorio
    const regulatoryLimit = input.regulatoryLimits?.[voltageLevel];
    const compliance = regulatoryLimit ? totalLossPercentage <= regulatoryLimit : true;
    
    // Calcular confianza
    const confidence = this.calculateProjectionConfidence(
      baseline,
      yearsFromBaseline,
      input.projectionParameters
    );

    return {
      company: input.company,
      region: input.region,
      voltageLevel,
      projectionYear: demandProjection.year,
      projectionMonth: demandProjection.month,
      
      fixedLosses,
      variableLosses,
      
      totalLosses: {
        percentage: totalLossPercentage,
        absoluteValue: totalLossAbsolute,
        regulatoryLimit,
        compliance
      },
      
      confidence,
      methodology: 'Modelo físico-estadístico con componentes fijas y variables',
      assumptions: this.generateAssumptions(input.projectionParameters)
    };
  }

  private calculateFixedLosses(
    baseline: LossComponent,
    network: any,
    yearsFromBaseline: number,
    parameters: any
  ): TechnicalLossProjection['fixedLosses'] {
    let baseFixedPercentage = baseline.value * 0.3; // 30% son pérdidas fijas típicamente
    
    // Efecto del envejecimiento
    if (parameters.includeInfrastructureAging) {
      const agingEffect = yearsFromBaseline * this.modelParameters.agingDegradationRate * 100;
      baseFixedPercentage += agingEffect;
    }
    
    // Efecto del mantenimiento
    const maintenanceMultiplier = {
      'current': 1.0,
      'improved': 0.95,
      'optimized': 0.90
    }[parameters.maintenanceScenario];
    
    baseFixedPercentage *= maintenanceMultiplier;
    
    // Efecto de mejoras en eficiencia
    if (parameters.includeEfficiencyImprovements) {
      const efficiencyReduction = yearsFromBaseline * this.modelParameters.efficiencyImprovementRate * 100;
      baseFixedPercentage -= efficiencyReduction;
    }
    
    baseFixedPercentage = Math.max(0, baseFixedPercentage);
    
    // Descomponer en componentes específicos
    const corona = baseFixedPercentage * 0.4;     // 40% efecto corona
    const insulation = baseFixedPercentage * 0.3; // 30% aislamiento
    const noLoad = baseFixedPercentage * 0.3;     // 30% pérdidas en vacío
    
    // Calcular valor absoluto (requiere demanda base)
    const estimatedBaseDemand = 1000; // MWh - esto debería venir de los datos reales
    const absoluteValue = (baseFixedPercentage / 100) * estimatedBaseDemand;
    
    return {
      percentage: baseFixedPercentage,
      absoluteValue,
      components: {
        corona,
        insulation,
        noLoad
      }
    };
  }

  private calculateVariableLosses(
    baseline: LossComponent,
    demandProjection: any,
    network: any,
    yearsFromBaseline: number,
    parameters: any
  ): TechnicalLossProjection['variableLosses'] {
    let baseVariablePercentage = baseline.value * 0.7; // 70% son pérdidas variables típicamente
    
    // Efecto del crecimiento de carga (pérdidas aumentan con el cuadrado de la corriente)
    if (parameters.includeLoadGrowth) {
      const currentYear = new Date().getFullYear();
      const growthRate = Math.pow(1.03, yearsFromBaseline); // 3% crecimiento anual típico
      const loadEffect = Math.pow(growthRate, 2) - 1;
      baseVariablePercentage *= (1 + loadEffect);
    }
    
    // Efecto de características de red
    const networkEfficiencyFactor = this.calculateNetworkEfficiencyFactor(network);
    baseVariablePercentage *= networkEfficiencyFactor;
    
    // Efecto climático
    if (parameters.climaticAdjustment) {
      const climaticFactor = this.calculateClimaticEffect(network.climaticZone);
      baseVariablePercentage *= climaticFactor;
    }
    
    baseVariablePercentage = Math.max(0, baseVariablePercentage);
    
    // Descomponer en componentes específicos
    const joule = baseVariablePercentage * 0.6;           // 60% pérdidas Joule
    const loadTransformers = baseVariablePercentage * 0.3; // 30% transformadores con carga
    const reactive = baseVariablePercentage * 0.1;        // 10% potencia reactiva
    
    // Calcular valor absoluto
    const absoluteValue = (baseVariablePercentage / 100) * demandProjection.energy;
    
    return {
      percentage: baseVariablePercentage,
      absoluteValue,
      components: {
        joule,
        loadTransformers,
        reactive
      }
    };
  }

  private calculateNetworkEfficiencyFactor(network: any): number {
    let factor = 1.0;
    
    // Efecto de la edad de la infraestructura
    if (network.averageAge > 20) {
      factor *= 1.1; // 10% más pérdidas para infraestructura antigua
    } else if (network.averageAge < 10) {
      factor *= 0.95; // 5% menos pérdidas para infraestructura nueva
    }
    
    // Efecto del índice de mantenimiento
    factor *= (2 - network.maintenanceIndex); // Mejor mantenimiento reduce pérdidas
    
    // Efecto de la densidad de carga
    if (network.loadDensity > 100) { // MW/km²
      factor *= 0.95; // Mejor eficiencia en áreas de alta densidad
    } else if (network.loadDensity < 10) {
      factor *= 1.1; // Menor eficiencia en áreas rurales
    }
    
    return Math.max(0.8, Math.min(1.3, factor)); // Limitar entre 80% y 130%
  }

  private calculateClimaticEffect(climaticZone: string): number {
    const climaticFactors: Record<string, number> = {
      'tropical_humid': 1.05,    // 5% más pérdidas por humedad
      'tropical_dry': 1.02,      // 2% más pérdidas por temperatura
      'temperate': 1.0,          // Condiciones base
      'highland': 0.98,          // 2% menos pérdidas por altitud
      'coastal': 1.03            // 3% más pérdidas por salinidad
    };
    
    return climaticFactors[climaticZone] || 1.0;
  }

  private calculateProjectionConfidence(
    baseline: LossComponent,
    yearsFromBaseline: number,
    parameters: any
  ): number {
    let confidence = 0.9; // Confianza base del 90%
    
    // Reducir confianza con el tiempo
    confidence *= Math.exp(-0.05 * yearsFromBaseline); // Decaimiento exponencial
    
    // Ajustar por incertidumbre de la línea base
    confidence *= (1 - baseline.uncertainty / 200); // Reducir por incertidumbre
    
    // Ajustar por parámetros incluidos
    const parametersCount = Object.values(parameters).filter(Boolean).length;
    confidence *= Math.min(1.1, 1 + parametersCount * 0.02); // Bonificación por parámetros
    
    return Math.max(0.3, Math.min(0.95, confidence));
  }

  private generateAssumptions(parameters: any): string[] {
    const assumptions: string[] = [
      'Condiciones operativas normales del sistema eléctrico',
      'Mantenimiento preventivo según cronograma establecido',
      'No ocurrencia de eventos climáticos extremos'
    ];
    
    if (parameters.includeLoadGrowth) {
      assumptions.push('Crecimiento de demanda según proyecciones económicas');
    }
    
    if (parameters.includeInfrastructureAging) {
      assumptions.push('Degradación natural de infraestructura según modelos de envejecimiento');
    }
    
    if (parameters.includeEfficiencyImprovements) {
      assumptions.push('Implementación de mejoras tecnológicas planificadas');
    }
    
    if (parameters.climaticAdjustment) {
      assumptions.push('Condiciones climáticas promedio histórico');
    }
    
    switch (parameters.maintenanceScenario) {
      case 'improved':
        assumptions.push('Mejora en programas de mantenimiento predictivo');
        break;
      case 'optimized':
        assumptions.push('Implementación de mantenimiento basado en condición óptimo');
        break;
    }
    
    return assumptions;
  }

  public validateProjection(projection: TechnicalLossProjection): {
    isValid: boolean;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];
    
    // Validar rangos razonables
    if (projection.totalLosses.percentage > 20) {
      errors.push(`Pérdidas totales excesivamente altas: ${projection.totalLosses.percentage.toFixed(2)}%`);
    }
    
    if (projection.totalLosses.percentage < 0.5) {
      warnings.push(`Pérdidas totales muy bajas: ${projection.totalLosses.percentage.toFixed(2)}%`);
    }
    
    // Validar componentes
    const fixedVsVariable = projection.fixedLosses.percentage / projection.variableLosses.percentage;
    if (fixedVsVariable > 2 || fixedVsVariable < 0.1) {
      warnings.push('Proporción inusual entre pérdidas fijas y variables');
    }
    
    // Validar cumplimiento regulatorio
    if (!projection.totalLosses.compliance && projection.totalLosses.regulatoryLimit) {
      warnings.push(`Incumplimiento regulatorio: ${projection.totalLosses.percentage.toFixed(2)}% > ${projection.totalLosses.regulatoryLimit}%`);
    }
    
    // Validar confianza
    if (projection.confidence < 0.5) {
      warnings.push(`Baja confianza en proyección: ${(projection.confidence * 100).toFixed(1)}%`);
    }
    
    return {
      isValid: errors.length === 0,
      warnings,
      errors
    };
  }

  public getProjectionHistory(company: string): TechnicalLossProjection[] {
    return this.projectionHistory.get(company) || [];
  }

  public updateModelParameters(newParameters: Partial<LossModelParameters>): void {
    this.modelParameters = { ...this.modelParameters, ...newParameters };
  }

  public getModelParameters(): LossModelParameters {
    return { ...this.modelParameters };
  }

  public clearHistory(): void {
    this.projectionHistory.clear();
  }
}

export const technicalLossesEngine = TechnicalLossesEngine.getInstance();