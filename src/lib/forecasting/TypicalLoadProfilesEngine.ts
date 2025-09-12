import { z } from 'zod';

export interface LoadProfilePoint {
  hour: number;          // 0-23
  dayType: DayType;      // Laborable, Sábado, Domingo/Festivo
  month: number;         // 1-12
  loadFactor: number;    // Factor de carga normalizado (0-1)
  temperature?: number;  // Temperatura promedio (°C)
  humidity?: number;     // Humedad relativa (%)
}

export enum DayType {
  WEEKDAY = 'weekday',     // Día laborable
  SATURDAY = 'saturday',   // Sábado
  SUNDAY = 'sunday'        // Domingo y festivos
}

export enum Season {
  DRY = 'dry',            // Época seca (Jun-Nov)
  RAINY = 'rainy'         // Época lluviosa (Dic-May)
}

export interface TypicalLoadProfile {
  id: string;
  sector: string;                    // residential, commercial, industrial, etc.
  region: string;                    // Costa, Sierra, Oriente, Galápagos
  company: string;                   // Empresa eléctrica
  dayType: DayType;
  season: Season;
  profile: LoadProfilePoint[];       // 24 puntos horarios
  metadata: {
    clusterSize: number;             // Número de días en el cluster
    silhouetteScore: number;         // Calidad del clustering
    representativeness: number;      // Qué tan representativo es (0-1)
    lastUpdated: Date;
    dataQuality: 'high' | 'medium' | 'low';
    avgTemperature?: number;
    avgHumidity?: number;
  };
}

export interface ClusteringConfiguration {
  numberOfClusters: number;          // Número de clusters K
  maxIterations: number;             // Máximo de iteraciones para K-means
  convergenceTolerance: number;      // Tolerancia de convergencia
  initializationMethod: 'random' | 'kmeans++' | 'manual';
  featureWeights: {
    hour: number;                    // Peso de la hora del día
    dayType: number;                 // Peso del tipo de día
    season: number;                  // Peso de la estación
    temperature: number;             // Peso de la temperatura
    loadMagnitude: number;           // Peso de la magnitud de carga
  };
  distanceMetric: 'euclidean' | 'manhattan' | 'cosine';
  enableSeasonalAdjustment: boolean;
  minClusterSize: number;            // Tamaño mínimo de cluster
}

export interface HistoricalLoadData {
  timestamp: Date;
  load: number;                      // Carga en MW
  temperature?: number;
  humidity?: number;
  dayType: DayType;
  sector: string;
  company: string;
  region: string;
}

const TLPInputSchema = z.object({
  historicalData: z.array(z.object({
    timestamp: z.date(),
    load: z.number().min(0),
    temperature: z.number().optional(),
    humidity: z.number().min(0).max(100).optional(),
    dayType: z.nativeEnum(DayType),
    sector: z.string(),
    company: z.string(),
    region: z.string()
  })),
  configuration: z.object({
    numberOfClusters: z.number().min(2).max(20).default(6),
    maxIterations: z.number().min(10).max(1000).default(300),
    convergenceTolerance: z.number().min(1e-8).max(1e-2).default(1e-5),
    initializationMethod: z.enum(['random', 'kmeans++', 'manual']).default('kmeans++'),
    featureWeights: z.object({
      hour: z.number().min(0).max(2).default(1.0),
      dayType: z.number().min(0).max(2).default(0.8),
      season: z.number().min(0).max(2).default(0.6),
      temperature: z.number().min(0).max(2).default(0.4),
      loadMagnitude: z.number().min(0).max(2).default(1.2)
    }).default({}),
    distanceMetric: z.enum(['euclidean', 'manhattan', 'cosine']).default('euclidean'),
    enableSeasonalAdjustment: z.boolean().default(true),
    minClusterSize: z.number().min(5).max(100).default(20)
  }).default({})
});

export type TLPInput = z.infer<typeof TLPInputSchema>;

export interface ClusterResult {
  centroid: number[];                // Centroide del cluster (24 valores horarios)
  members: HistoricalLoadData[];     // Datos miembros del cluster
  silhouetteScore: number;           // Puntuación de silhouette
  intraClusterVariance: number;      // Varianza intra-cluster
  representativeDay: Date;           // Día más representativo del cluster
}

export class TypicalLoadProfilesEngine {
  private static instance: TypicalLoadProfilesEngine;
  private profileCache: Map<string, TypicalLoadProfile[]> = new Map();
  private clusteringHistory: Map<string, ClusterResult[]> = new Map();

  private constructor() {}

  public static getInstance(): TypicalLoadProfilesEngine {
    if (!TypicalLoadProfilesEngine.instance) {
      TypicalLoadProfilesEngine.instance = new TypicalLoadProfilesEngine();
    }
    return TypicalLoadProfilesEngine.instance;
  }

  public async generateTypicalLoadProfiles(input: TLPInput): Promise<TypicalLoadProfile[]> {
    const validated = TLPInputSchema.parse(input);
    const { historicalData, configuration } = validated;

    console.log(`Iniciando generación de TLPs para ${historicalData.length} registros históricos`);

    const groupedData = this.groupDataByCriteria(historicalData);
    const profiles: TypicalLoadProfile[] = [];

    for (const [groupKey, groupData] of groupedData.entries()) {
      console.log(`Procesando grupo: ${groupKey} (${groupData.length} registros)`);
      
      if (groupData.length < configuration.minClusterSize) {
        console.warn(`Grupo ${groupKey} tiene pocos datos (${groupData.length}), omitiendo`);
        continue;
      }

      const groupProfiles = await this.processGroup(groupKey, groupData, configuration);
      profiles.push(...groupProfiles);
    }

    this.cacheProfiles(profiles);
    console.log(`Generación completada: ${profiles.length} perfiles típicos creados`);

    return profiles;
  }

  private groupDataByCriteria(data: HistoricalLoadData[]): Map<string, HistoricalLoadData[]> {
    const groups = new Map<string, HistoricalLoadData[]>();

    for (const record of data) {
      const season = this.determineSeason(record.timestamp);
      const groupKey = `${record.sector}-${record.region}-${record.company}-${record.dayType}-${season}`;
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(record);
    }

    return groups;
  }

  private async processGroup(
    groupKey: string, 
    groupData: HistoricalLoadData[], 
    config: ClusteringConfiguration
  ): Promise<TypicalLoadProfile[]> {
    const dailyProfiles = this.extractDailyProfiles(groupData);
    
    if (dailyProfiles.length < config.numberOfClusters) {
      console.warn(`Grupo ${groupKey}: ajustando clusters de ${config.numberOfClusters} a ${dailyProfiles.length}`);
      config.numberOfClusters = Math.max(1, Math.floor(dailyProfiles.length / 2));
    }

    const clusterResults = await this.performKMeansClustering(dailyProfiles, config);
    this.clusteringHistory.set(groupKey, clusterResults);

    const profiles: TypicalLoadProfile[] = [];
    const [sector, region, company, dayType, season] = groupKey.split('-');

    for (let i = 0; i < clusterResults.length; i++) {
      const cluster = clusterResults[i];
      const profile = this.createTypicalLoadProfile(
        groupKey, 
        cluster, 
        sector, 
        region, 
        company, 
        dayType as DayType, 
        season as Season,
        i
      );
      profiles.push(profile);
    }

    return profiles;
  }

  private extractDailyProfiles(data: HistoricalLoadData[]): Map<string, HistoricalLoadData[]> {
    const dailyProfiles = new Map<string, HistoricalLoadData[]>();

    for (const record of data) {
      const dayKey = record.timestamp.toISOString().split('T')[0];
      
      if (!dailyProfiles.has(dayKey)) {
        dailyProfiles.set(dayKey, []);
      }
      dailyProfiles.get(dayKey)!.push(record);
    }

    const completeDays = new Map<string, HistoricalLoadData[]>();
    for (const [dayKey, dayData] of dailyProfiles.entries()) {
      if (dayData.length >= 20) { // Al menos 20 horas de datos
        const sortedData = dayData.sort((a, b) => a.timestamp.getHours() - b.timestamp.getHours());
        completeDays.set(dayKey, sortedData);
      }
    }

    return completeDays;
  }

  private async performKMeansClustering(
    dailyProfiles: Map<string, HistoricalLoadData[]>, 
    config: ClusteringConfiguration
  ): Promise<ClusterResult[]> {
    const profileVectors = this.createFeatureVectors(dailyProfiles, config);
    const k = config.numberOfClusters;

    let centroids = this.initializeCentroids(profileVectors, k, config.initializationMethod);
    let assignments = new Array(profileVectors.length).fill(0);
    let converged = false;
    let iteration = 0;

    while (!converged && iteration < config.maxIterations) {
      const newAssignments = this.assignToCentroids(profileVectors, centroids, config.distanceMetric);
      converged = this.checkConvergence(assignments, newAssignments, config.convergenceTolerance);
      assignments = newAssignments;
      centroids = this.updateCentroids(profileVectors, assignments, k);
      iteration++;
    }

    console.log(`K-means convergió en ${iteration} iteraciones`);

    return this.createClusterResults(dailyProfiles, profileVectors, assignments, centroids);
  }

  private createFeatureVectors(
    dailyProfiles: Map<string, HistoricalLoadData[]>, 
    config: ClusteringConfiguration
  ): number[][] {
    const vectors: number[][] = [];
    
    for (const [dayKey, dayData] of dailyProfiles.entries()) {
      const vector = this.extractFeatures(dayData, config);
      vectors.push(vector);
    }

    return this.normalizeFeatures(vectors);
  }

  private extractFeatures(dayData: HistoricalLoadData[], config: ClusteringConfiguration): number[] {
    const features: number[] = [];

    const hourlyLoads = new Array(24).fill(0);
    for (const record of dayData) {
      hourlyLoads[record.timestamp.getHours()] = record.load;
    }

    for (let hour = 0; hour < 24; hour++) {
      features.push(hourlyLoads[hour] * config.featureWeights.loadMagnitude);
    }

    const avgTemp = dayData.reduce((sum, r) => sum + (r.temperature || 20), 0) / dayData.length;
    features.push(avgTemp * config.featureWeights.temperature);

    const dayTypeValue = {
      [DayType.WEEKDAY]: 1,
      [DayType.SATURDAY]: 2,
      [DayType.SUNDAY]: 3
    }[dayData[0].dayType];
    features.push(dayTypeValue * config.featureWeights.dayType);

    const season = this.determineSeason(dayData[0].timestamp);
    const seasonValue = season === Season.DRY ? 1 : 2;
    features.push(seasonValue * config.featureWeights.season);

    return features;
  }

  private normalizeFeatures(vectors: number[][]): number[][] {
    if (vectors.length === 0) return vectors;

    const numFeatures = vectors[0].length;
    const means = new Array(numFeatures).fill(0);
    const stds = new Array(numFeatures).fill(0);

    for (let j = 0; j < numFeatures; j++) {
      const values = vectors.map(v => v[j]);
      means[j] = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - means[j], 2), 0) / values.length;
      stds[j] = Math.sqrt(variance) || 1;
    }

    return vectors.map(vector => 
      vector.map((value, j) => (value - means[j]) / stds[j])
    );
  }

  private initializeCentroids(vectors: number[][], k: number, method: string): number[][] {
    const centroids: number[][] = [];
    
    if (method === 'kmeans++') {
      centroids.push(vectors[Math.floor(Math.random() * vectors.length)].slice());
      
      for (let i = 1; i < k; i++) {
        const distances = vectors.map(vector => {
          const minDist = Math.min(...centroids.map(centroid => 
            this.calculateDistance(vector, centroid, 'euclidean')
          ));
          return minDist * minDist;
        });
        
        const totalDist = distances.reduce((sum, dist) => sum + dist, 0);
        const random = Math.random() * totalDist;
        
        let cumSum = 0;
        for (let j = 0; j < vectors.length; j++) {
          cumSum += distances[j];
          if (cumSum >= random) {
            centroids.push(vectors[j].slice());
            break;
          }
        }
      }
    } else {
      for (let i = 0; i < k; i++) {
        centroids.push(vectors[Math.floor(Math.random() * vectors.length)].slice());
      }
    }
    
    return centroids;
  }

  private assignToCentroids(vectors: number[][], centroids: number[][], metric: string): number[] {
    return vectors.map(vector => {
      let minDist = Infinity;
      let assignment = 0;
      
      for (let i = 0; i < centroids.length; i++) {
        const dist = this.calculateDistance(vector, centroids[i], metric);
        if (dist < minDist) {
          minDist = dist;
          assignment = i;
        }
      }
      
      return assignment;
    });
  }

  private calculateDistance(a: number[], b: number[], metric: string): number {
    switch (metric) {
      case 'euclidean':
        return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
      case 'manhattan':
        return a.reduce((sum, val, i) => sum + Math.abs(val - b[i]), 0);
      case 'cosine':
        const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
        const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
        const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
        return 1 - (dotProduct / (normA * normB));
      default:
        throw new Error(`Métrica de distancia no soportada: ${metric}`);
    }
  }

  private checkConvergence(oldAssignments: number[], newAssignments: number[], tolerance: number): boolean {
    const changes = oldAssignments.filter((old, i) => old !== newAssignments[i]).length;
    const changeRate = changes / oldAssignments.length;
    return changeRate < tolerance;
  }

  private updateCentroids(vectors: number[][], assignments: number[], k: number): number[][] {
    const centroids: number[][] = [];
    
    for (let cluster = 0; cluster < k; cluster++) {
      const clusterVectors = vectors.filter((_, i) => assignments[i] === cluster);
      
      if (clusterVectors.length === 0) {
        centroids.push(vectors[Math.floor(Math.random() * vectors.length)].slice());
        continue;
      }
      
      const centroid = clusterVectors[0].map((_, j) => 
        clusterVectors.reduce((sum, vector) => sum + vector[j], 0) / clusterVectors.length
      );
      
      centroids.push(centroid);
    }
    
    return centroids;
  }

  private createClusterResults(
    dailyProfiles: Map<string, HistoricalLoadData[]>, 
    vectors: number[][], 
    assignments: number[], 
    centroids: number[][]
  ): ClusterResult[] {
    const results: ClusterResult[] = [];
    const profileDays = Array.from(dailyProfiles.keys());
    
    for (let cluster = 0; cluster < centroids.length; cluster++) {
      const memberIndices = assignments.map((assignment, i) => assignment === cluster ? i : -1).filter(i => i >= 0);
      const members: HistoricalLoadData[] = [];
      
      for (const index of memberIndices) {
        const dayKey = profileDays[index];
        members.push(...dailyProfiles.get(dayKey)!);
      }
      
      const silhouetteScore = this.calculateSilhouetteScore(vectors, assignments, cluster);
      const intraClusterVariance = this.calculateIntraClusterVariance(vectors, assignments, centroids[cluster], cluster);
      const representativeDay = this.findRepresentativeDay(memberIndices, profileDays, vectors, centroids[cluster]);
      
      results.push({
        centroid: centroids[cluster].slice(0, 24), // Solo las primeras 24 características (cargas horarias)
        members,
        silhouetteScore,
        intraClusterVariance,
        representativeDay: new Date(representativeDay)
      });
    }
    
    return results;
  }

  private calculateSilhouetteScore(vectors: number[][], assignments: number[], cluster: number): number {
    const clusterMembers = assignments.map((assignment, i) => assignment === cluster ? i : -1).filter(i => i >= 0);
    
    if (clusterMembers.length <= 1) return 0;
    
    let totalScore = 0;
    
    for (const memberIndex of clusterMembers) {
      const a = this.calculateAverageIntraClusterDistance(vectors, assignments, memberIndex, cluster);
      const b = this.calculateMinInterClusterDistance(vectors, assignments, memberIndex, cluster);
      
      const silhouette = b > 0 ? (b - a) / Math.max(a, b) : 0;
      totalScore += silhouette;
    }
    
    return totalScore / clusterMembers.length;
  }

  private calculateAverageIntraClusterDistance(vectors: number[][], assignments: number[], pointIndex: number, cluster: number): number {
    const clusterMembers = assignments.map((assignment, i) => assignment === cluster ? i : -1).filter(i => i >= 0 && i !== pointIndex);
    
    if (clusterMembers.length === 0) return 0;
    
    const totalDistance = clusterMembers.reduce((sum, memberIndex) => 
      sum + this.calculateDistance(vectors[pointIndex], vectors[memberIndex], 'euclidean'), 0
    );
    
    return totalDistance / clusterMembers.length;
  }

  private calculateMinInterClusterDistance(vectors: number[][], assignments: number[], pointIndex: number, currentCluster: number): number {
    const otherClusters = [...new Set(assignments)].filter(cluster => cluster !== currentCluster);
    
    let minAvgDistance = Infinity;
    
    for (const cluster of otherClusters) {
      const clusterMembers = assignments.map((assignment, i) => assignment === cluster ? i : -1).filter(i => i >= 0);
      
      if (clusterMembers.length > 0) {
        const avgDistance = clusterMembers.reduce((sum, memberIndex) => 
          sum + this.calculateDistance(vectors[pointIndex], vectors[memberIndex], 'euclidean'), 0
        ) / clusterMembers.length;
        
        minAvgDistance = Math.min(minAvgDistance, avgDistance);
      }
    }
    
    return minAvgDistance === Infinity ? 0 : minAvgDistance;
  }

  private calculateIntraClusterVariance(vectors: number[][], assignments: number[], centroid: number[], cluster: number): number {
    const clusterMembers = assignments.map((assignment, i) => assignment === cluster ? i : -1).filter(i => i >= 0);
    
    if (clusterMembers.length === 0) return 0;
    
    const totalVariance = clusterMembers.reduce((sum, memberIndex) => 
      sum + Math.pow(this.calculateDistance(vectors[memberIndex], centroid, 'euclidean'), 2), 0
    );
    
    return totalVariance / clusterMembers.length;
  }

  private findRepresentativeDay(memberIndices: number[], profileDays: string[], vectors: number[][], centroid: number[]): string {
    let minDistance = Infinity;
    let representativeIndex = 0;
    
    for (const index of memberIndices) {
      const distance = this.calculateDistance(vectors[index], centroid, 'euclidean');
      if (distance < minDistance) {
        minDistance = distance;
        representativeIndex = index;
      }
    }
    
    return profileDays[representativeIndex];
  }

  private createTypicalLoadProfile(
    groupKey: string,
    cluster: ClusterResult,
    sector: string,
    region: string,
    company: string,
    dayType: DayType,
    season: Season,
    clusterIndex: number
  ): TypicalLoadProfile {
    const profile: LoadProfilePoint[] = [];
    
    for (let hour = 0; hour < 24; hour++) {
      const loadFactor = cluster.centroid[hour];
      const monthRange = season === Season.DRY ? [6, 7, 8, 9, 10, 11] : [12, 1, 2, 3, 4, 5];
      const month = monthRange[Math.floor(monthRange.length / 2)]; // Mes representativo
      
      profile.push({
        hour,
        dayType,
        month,
        loadFactor: Math.max(0, Math.min(1, loadFactor)),
        temperature: cluster.members.find(m => m.timestamp.getHours() === hour)?.temperature,
        humidity: cluster.members.find(m => m.timestamp.getHours() === hour)?.humidity
      });
    }

    const avgTemp = cluster.members.reduce((sum, m) => sum + (m.temperature || 20), 0) / cluster.members.length;
    const avgHumidity = cluster.members.reduce((sum, m) => sum + (m.humidity || 50), 0) / cluster.members.length;

    return {
      id: `${groupKey}-cluster-${clusterIndex}`,
      sector,
      region,
      company,
      dayType,
      season,
      profile,
      metadata: {
        clusterSize: cluster.members.length,
        silhouetteScore: cluster.silhouetteScore,
        representativeness: Math.max(0, Math.min(1, cluster.silhouetteScore)),
        lastUpdated: new Date(),
        dataQuality: cluster.silhouetteScore > 0.5 ? 'high' : cluster.silhouetteScore > 0.2 ? 'medium' : 'low',
        avgTemperature: avgTemp,
        avgHumidity: avgHumidity
      }
    };
  }

  private determineSeason(date: Date): Season {
    const month = date.getMonth() + 1; // 1-12
    return (month >= 6 && month <= 11) ? Season.DRY : Season.RAINY;
  }

  private cacheProfiles(profiles: TypicalLoadProfile[]): void {
    for (const profile of profiles) {
      const cacheKey = `${profile.sector}-${profile.region}-${profile.company}`;
      const existing = this.profileCache.get(cacheKey) || [];
      existing.push(profile);
      this.profileCache.set(cacheKey, existing);
    }
  }

  public getTypicalLoadProfiles(sector: string, region: string, company: string): TypicalLoadProfile[] {
    const cacheKey = `${sector}-${region}-${company}`;
    return this.profileCache.get(cacheKey) || [];
  }

  public getAllProfiles(): TypicalLoadProfile[] {
    const allProfiles: TypicalLoadProfile[] = [];
    for (const profiles of this.profileCache.values()) {
      allProfiles.push(...profiles);
    }
    return allProfiles;
  }

  public clearCache(): void {
    this.profileCache.clear();
    this.clusteringHistory.clear();
  }

  public getClusteringHistory(groupKey: string): ClusterResult[] | undefined {
    return this.clusteringHistory.get(groupKey);
  }
}

export const tlpEngine = TypicalLoadProfilesEngine.getInstance();