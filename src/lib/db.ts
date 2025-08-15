import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Funciones helper para consultas comunes
export class DatabaseService {
  // Obtener todas las empresas
  static async getCompanies() {
    return await prisma.company.findMany({
      orderBy: { name: 'asc' }
    });
  }

  // Obtener datos energéticos con filtros
  static async getEnergyData(filters: {
    companyId?: number;
    category?: string;
    year?: number;
    model?: string;
  }) {
    return await prisma.energyRecord.findMany({
      where: filters,
      include: {
        company: true
      },
      orderBy: [
        { year: 'asc' },
        { month: 'asc' }
      ]
    });
  }

  // Obtener datos históricos para gráficos
  static async getHistoricalData(companyId: number, category: string) {
    return await prisma.energyRecord.findMany({
      where: {
        companyId,
        category,
        model: 'hist'
      },
      orderBy: { year: 'asc' }
    });
  }

  // Obtener predicciones para un año específico
  static async getPredictions(companyId: number, category: string, year: number) {
    return await prisma.energyRecord.findMany({
      where: {
        companyId,
        category,
        year,
        model: { not: 'hist' }
      },
      orderBy: { model: 'asc' }
    });
  }

  // Obtener estaciones de transmisión
  static async getTransmissionStations(companyId?: number) {
    return await prisma.transmissionStation.findMany({
      where: companyId ? { companyId } : {},
      include: {
        company: true
      },
      orderBy: { name: 'asc' }
    });
  }

  // Obtener modelos activos
  static async getActiveModels() {
    return await prisma.modelConfig.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
  }

  // Crear registro de energía
  static async createEnergyRecord(data: {
    companyId: number;
    category: string;
    year: number;
    month?: number;
    model: string;
    energy: number;
    accuracy?: number;
  }) {
    return await prisma.energyRecord.create({
      data,
      include: {
        company: true
      }
    });
  }

  // Actualizar predicción con valor real
  static async updateWithActualValue(
    companyId: number, 
    category: string, 
    year: number, 
    actualValue: number
  ) {
    return await prisma.energyRecord.updateMany({
      where: {
        companyId,
        category,
        year,
        model: 'hist'
      },
      data: {
        energy: actualValue,
        updatedAt: new Date()
      }
    });
  }

  // Obtener precisión promedio de modelos
  static async getModelAccuracies() {
    const result = await prisma.energyRecord.groupBy({
      by: ['model'],
      where: {
        accuracy: { not: null }
      },
      _avg: {
        accuracy: true
      }
    });
    
    return result.map(item => ({
      model: item.model,
      avgAccuracy: item._avg.accuracy || 0
    }));
  }

  // Registrar log del sistema
  static async logSystemEvent(
    level: 'info' | 'warn' | 'error',
    message: string,
    component: string,
    metadata?: any
  ) {
    return await prisma.systemLog.create({
      data: {
        level,
        message,
        component,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });
  }
}