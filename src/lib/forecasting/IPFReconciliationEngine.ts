import { z } from 'zod';

export interface ReconciledMatrix {
  reconciledValues: number[][];
  convergenceReached: boolean;
  iterations: number;
  finalError: number;
  sectorTotals: number[];
  companyTotals: number[];
  metadata: {
    processingTime: number;
    maxError: number;
    convergenceCriteria: number;
  };
}

export interface IPFConfiguration {
  maxIterations: number;
  convergenceTolerance: number;
  dampingFactor: number;
  minCellValue: number;
  maxCellValue?: number;
  enableLogging: boolean;
}

export interface ConstraintMatrix {
  sectors: string[];
  companies: string[];
  sectorTargets: number[];
  companyTargets: number[];
  bottomUpMatrix: number[][];
  topDownMatrix?: number[][];
  weights?: number[][];
}

const IPFInputSchema = z.object({
  bottomUpMatrix: z.array(z.array(z.number().min(0))),
  sectorTargets: z.array(z.number().min(0)),
  companyTargets: z.array(z.number().min(0)),
  configuration: z.object({
    maxIterations: z.number().min(1).max(10000).default(1000),
    convergenceTolerance: z.number().min(1e-10).max(1e-2).default(1e-6),
    dampingFactor: z.number().min(0.1).max(1.0).default(0.8),
    minCellValue: z.number().min(0).default(1e-8),
    maxCellValue: z.number().optional(),
    enableLogging: z.boolean().default(false)
  }).default({})
});

export type IPFInput = z.infer<typeof IPFInputSchema>;

export class IterativeProportionalFittingEngine {
  private static instance: IterativeProportionalFittingEngine;
  private processingHistory: Map<string, ReconciledMatrix[]> = new Map();
  private performanceMetrics: Map<string, { avgIterations: number; avgError: number; successRate: number }> = new Map();

  private constructor() {}

  public static getInstance(): IterativeProportionalFittingEngine {
    if (!IterativeProportionalFittingEngine.instance) {
      IterativeProportionalFittingEngine.instance = new IterativeProportionalFittingEngine();
    }
    return IterativeProportionalFittingEngine.instance;
  }

  public async reconcile(input: IPFInput): Promise<ReconciledMatrix> {
    const startTime = performance.now();
    
    const validated = IPFInputSchema.parse(input);
    const { bottomUpMatrix, sectorTargets, companyTargets, configuration } = validated;

    this.validateInputDimensions(bottomUpMatrix, sectorTargets, companyTargets);

    const initialMatrix = this.deepCloneMatrix(bottomUpMatrix);
    let currentMatrix = this.deepCloneMatrix(bottomUpMatrix);
    
    let iteration = 0;
    let convergenceReached = false;
    let currentError = Infinity;
    const maxError = Math.max(...sectorTargets, ...companyTargets) * configuration.convergenceTolerance;

    const log = configuration.enableLogging ? console.log : () => {};

    log(`IPF iniciado: ${currentMatrix.length}x${currentMatrix[0].length} matrix`);
    log(`Objetivos sectores: [${sectorTargets.map(x => x.toFixed(2)).join(', ')}]`);
    log(`Objetivos empresas: [${companyTargets.map(x => x.toFixed(2)).join(', ')}]`);

    while (iteration < configuration.maxIterations && !convergenceReached) {
      currentMatrix = this.performIPFIteration(
        currentMatrix, 
        sectorTargets, 
        companyTargets, 
        configuration
      );

      currentError = this.calculateConvergenceError(currentMatrix, sectorTargets, companyTargets);
      convergenceReached = currentError < configuration.convergenceTolerance;

      if (configuration.enableLogging && iteration % 100 === 0) {
        log(`Iteración ${iteration}: Error = ${currentError.toExponential(3)}`);
      }

      iteration++;
    }

    const processingTime = performance.now() - startTime;
    
    const result: ReconciledMatrix = {
      reconciledValues: currentMatrix,
      convergenceReached,
      iterations: iteration,
      finalError: currentError,
      sectorTotals: this.calculateRowSums(currentMatrix),
      companyTotals: this.calculateColumnSums(currentMatrix),
      metadata: {
        processingTime,
        maxError,
        convergenceCriteria: configuration.convergenceTolerance
      }
    };

    this.recordProcessingHistory(input, result);
    this.updatePerformanceMetrics(result);

    log(`IPF completado en ${iteration} iteraciones (${processingTime.toFixed(2)}ms)`);
    log(`Convergencia: ${convergenceReached ? 'SÍ' : 'NO'}, Error final: ${currentError.toExponential(3)}`);

    return result;
  }

  private performIPFIteration(
    matrix: number[][], 
    sectorTargets: number[], 
    companyTargets: number[], 
    config: IPFConfiguration
  ): number[][] {
    const damped = config.dampingFactor;
    let result = this.deepCloneMatrix(matrix);

    const currentRowSums = this.calculateRowSums(result);
    for (let i = 0; i < result.length; i++) {
      if (currentRowSums[i] > config.minCellValue) {
        const scaleFactor = sectorTargets[i] / currentRowSums[i];
        const dampedFactor = 1 + damped * (scaleFactor - 1);
        
        for (let j = 0; j < result[i].length; j++) {
          result[i][j] *= dampedFactor;
          result[i][j] = Math.max(config.minCellValue, result[i][j]);
          if (config.maxCellValue) {
            result[i][j] = Math.min(config.maxCellValue, result[i][j]);
          }
        }
      }
    }

    const currentColSums = this.calculateColumnSums(result);
    for (let j = 0; j < result[0].length; j++) {
      if (currentColSums[j] > config.minCellValue) {
        const scaleFactor = companyTargets[j] / currentColSums[j];
        const dampedFactor = 1 + damped * (scaleFactor - 1);
        
        for (let i = 0; i < result.length; i++) {
          result[i][j] *= dampedFactor;
          result[i][j] = Math.max(config.minCellValue, result[i][j]);
          if (config.maxCellValue) {
            result[i][j] = Math.min(config.maxCellValue, result[i][j]);
          }
        }
      }
    }

    return result;
  }

  private calculateConvergenceError(matrix: number[][], sectorTargets: number[], companyTargets: number[]): number {
    const rowSums = this.calculateRowSums(matrix);
    const colSums = this.calculateColumnSums(matrix);

    const rowErrors = sectorTargets.map((target, i) => 
      target > 0 ? Math.abs(rowSums[i] - target) / target : 0
    );
    
    const colErrors = companyTargets.map((target, j) => 
      target > 0 ? Math.abs(colSums[j] - target) / target : 0
    );

    return Math.max(...rowErrors, ...colErrors);
  }

  public reconcileWithTopDown(constraintMatrix: ConstraintMatrix, config?: Partial<IPFConfiguration>): Promise<ReconciledMatrix> {
    const fullConfig: IPFConfiguration = {
      maxIterations: 1000,
      convergenceTolerance: 1e-6,
      dampingFactor: 0.8,
      minCellValue: 1e-8,
      enableLogging: false,
      ...config
    };

    if (!constraintMatrix.topDownMatrix) {
      return this.reconcile({
        bottomUpMatrix: constraintMatrix.bottomUpMatrix,
        sectorTargets: constraintMatrix.sectorTargets,
        companyTargets: constraintMatrix.companyTargets,
        configuration: fullConfig
      });
    }

    const weights = constraintMatrix.weights || this.calculateDefaultWeights(constraintMatrix.bottomUpMatrix);
    
    const hybridMatrix = this.combineBottomUpTopDown(
      constraintMatrix.bottomUpMatrix,
      constraintMatrix.topDownMatrix,
      weights
    );

    return this.reconcile({
      bottomUpMatrix: hybridMatrix,
      sectorTargets: constraintMatrix.sectorTargets,
      companyTargets: constraintMatrix.companyTargets,
      configuration: fullConfig
    });
  }

  private combineBottomUpTopDown(bottomUp: number[][], topDown: number[][], weights: number[][]): number[][] {
    const result: number[][] = [];
    
    for (let i = 0; i < bottomUp.length; i++) {
      result[i] = [];
      for (let j = 0; j < bottomUp[i].length; j++) {
        const weight = weights[i][j];
        result[i][j] = weight * bottomUp[i][j] + (1 - weight) * topDown[i][j];
      }
    }
    
    return result;
  }

  private calculateDefaultWeights(matrix: number[][]): number[][] {
    const weights: number[][] = [];
    const totalSum = matrix.flat().reduce((sum, val) => sum + val, 0);
    
    for (let i = 0; i < matrix.length; i++) {
      weights[i] = [];
      const rowSum = matrix[i].reduce((sum, val) => sum + val, 0);
      const rowWeight = totalSum > 0 ? rowSum / totalSum : 0;
      
      for (let j = 0; j < matrix[i].length; j++) {
        const cellWeight = rowSum > 0 ? matrix[i][j] / rowSum : 0;
        weights[i][j] = Math.max(0.1, Math.min(0.9, rowWeight * cellWeight * matrix.length));
      }
    }
    
    return weights;
  }

  public validateReconciliation(result: ReconciledMatrix, tolerance: number = 1e-3): {
    isValid: boolean;
    rowValidation: boolean[];
    colValidation: boolean[];
    issues: string[];
  } {
    const issues: string[] = [];
    const rowValidation: boolean[] = [];
    const colValidation: boolean[] = [];

    for (let i = 0; i < result.sectorTotals.length; i++) {
      const isValid = Math.abs(result.sectorTotals[i] - result.sectorTotals[i]) < tolerance;
      rowValidation.push(isValid);
      if (!isValid) {
        issues.push(`Sector ${i}: diferencia excesiva en totales`);
      }
    }

    for (let j = 0; j < result.companyTotals.length; j++) {
      const isValid = Math.abs(result.companyTotals[j] - result.companyTotals[j]) < tolerance;
      colValidation.push(isValid);
      if (!isValid) {
        issues.push(`Empresa ${j}: diferencia excesiva en totales`);
      }
    }

    if (!result.convergenceReached) {
      issues.push('Convergencia no alcanzada en el número máximo de iteraciones');
    }

    if (result.finalError > tolerance) {
      issues.push(`Error final (${result.finalError.toExponential(3)}) excede tolerancia (${tolerance})`);
    }

    return {
      isValid: issues.length === 0,
      rowValidation,
      colValidation,
      issues
    };
  }

  private validateInputDimensions(matrix: number[][], sectorTargets: number[], companyTargets: number[]): void {
    if (matrix.length !== sectorTargets.length) {
      throw new Error(`Dimensiones inconsistentes: matriz tiene ${matrix.length} filas, pero hay ${sectorTargets.length} objetivos de sector`);
    }
    
    if (matrix.length === 0 || matrix[0].length !== companyTargets.length) {
      throw new Error(`Dimensiones inconsistentes: matriz tiene ${matrix[0]?.length || 0} columnas, pero hay ${companyTargets.length} objetivos de empresa`);
    }

    for (let i = 0; i < matrix.length; i++) {
      if (matrix[i].length !== matrix[0].length) {
        throw new Error(`Matriz inconsistente: fila ${i} tiene ${matrix[i].length} elementos, esperados ${matrix[0].length}`);
      }
    }
  }

  private calculateRowSums(matrix: number[][]): number[] {
    return matrix.map(row => row.reduce((sum, val) => sum + val, 0));
  }

  private calculateColumnSums(matrix: number[][]): number[] {
    const colSums: number[] = new Array(matrix[0].length).fill(0);
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        colSums[j] += matrix[i][j];
      }
    }
    return colSums;
  }

  private deepCloneMatrix(matrix: number[][]): number[][] {
    return matrix.map(row => [...row]);
  }

  private recordProcessingHistory(input: IPFInput, result: ReconciledMatrix): void {
    const key = `${input.bottomUpMatrix.length}x${input.bottomUpMatrix[0].length}`;
    const history = this.processingHistory.get(key) || [];
    history.push(result);
    
    if (history.length > 100) {
      history.shift();
    }
    
    this.processingHistory.set(key, history);
  }

  private updatePerformanceMetrics(result: ReconciledMatrix): void {
    const key = `${result.reconciledValues.length}x${result.reconciledValues[0].length}`;
    const current = this.performanceMetrics.get(key) || { avgIterations: 0, avgError: 0, successRate: 0 };
    const history = this.processingHistory.get(key) || [];
    
    const totalRuns = history.length;
    if (totalRuns > 0) {
      const avgIterations = history.reduce((sum, r) => sum + r.iterations, 0) / totalRuns;
      const avgError = history.reduce((sum, r) => sum + r.finalError, 0) / totalRuns;
      const successCount = history.filter(r => r.convergenceReached).length;
      const successRate = successCount / totalRuns;
      
      this.performanceMetrics.set(key, { avgIterations, avgError, successRate });
    }
  }

  public getPerformanceMetrics(matrixSize?: string): Map<string, { avgIterations: number; avgError: number; successRate: number }> {
    if (matrixSize) {
      const metrics = this.performanceMetrics.get(matrixSize);
      return metrics ? new Map([[matrixSize, metrics]]) : new Map();
    }
    return new Map(this.performanceMetrics);
  }

  public clearHistory(): void {
    this.processingHistory.clear();
    this.performanceMetrics.clear();
  }
}

export const ipfEngine = IterativeProportionalFittingEngine.getInstance();