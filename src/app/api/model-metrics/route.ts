import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modelName = searchParams.get('model');
    const category = searchParams.get('category');

    // Obtener métricas de precisión por modelo (excluyendo 'hist')
    const modelConfigs = await prisma.modelConfig.findMany({
      where: {
        name: { not: 'hist' },
        ...(modelName && { name: modelName })
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Obtener precisión promedio por modelo desde los registros de energía (excluyendo 'hist')
    const energyRecords = await prisma.energyRecord.groupBy({
      by: ['model'],
      where: {
        model: { not: 'hist' },
        accuracy: { not: null },
        ...(category && { category })
      },
      _avg: {
        accuracy: true
      },
      _count: {
        accuracy: true
      }
    });

    // Obtener histórico de predicciones para calcular precisión real (excluyendo 'hist')
    const predictionHistory = await prisma.predictionHistory.findMany({
      where: {
        model: { not: 'hist' },
        actualValue: { not: null },
        ...(category && { category })
      },
      orderBy: { predictionDate: 'desc' },
      take: 100
    });

    // Calcular métricas de precisión en tiempo real
    const accuracyByModel = predictionHistory.reduce((acc, record) => {
      if (!acc[record.model]) {
        acc[record.model] = {
          predictions: [],
          totalCount: 0,
          avgAccuracy: 0
        };
      }
      
      if (record.actualValue && record.predictedValue) {
        const error = Math.abs(record.actualValue - record.predictedValue) / record.actualValue;
        const accuracy = (1 - error) * 100;
        acc[record.model].predictions.push(accuracy);
        acc[record.model].totalCount++;
      }
      
      return acc;
    }, {} as any);

    // Calcular promedios
    Object.keys(accuracyByModel).forEach(model => {
      const predictions = accuracyByModel[model].predictions;
      accuracyByModel[model].avgAccuracy = predictions.length > 0 
        ? predictions.reduce((sum: number, val: number) => sum + val, 0) / predictions.length 
        : 0;
    });

    return NextResponse.json({
      modelConfigs,
      energyRecordsAccuracy: energyRecords,
      realTimeAccuracy: accuracyByModel,
      predictionHistory: predictionHistory.slice(0, 20) // últimas 20 predicciones
    });

  } catch (error) {
    console.error('Error fetching model metrics:', error);
    return NextResponse.json(
      { error: 'Error al obtener métricas de modelos' },
      { status: 500 }
    );
  }
}