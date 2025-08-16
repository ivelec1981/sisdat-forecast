import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Obtener la fecha del último dato histórico disponible
    const lastHistoricalRecord = await prisma.energyRecord.findFirst({
      where: {
        model: 'hist'
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ]
    });

    // Por defecto, corte al 1 de febrero de 2025
    let historicalCutoffDate = '2025-02-01';
    
    if (lastHistoricalRecord) {
      const year = lastHistoricalRecord.year;
      const month = lastHistoricalRecord.month || 1;
      historicalCutoffDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    }

    // Determinar modelos de ML (excluyendo 'hist')
    const mlModels = await prisma.modelConfig.findMany({
      where: {
        name: { not: 'hist' },
        isActive: true
      },
      select: {
        name: true,
        displayName: true
      }
    });

    return NextResponse.json({
      historicalCutoffDate,
      currentDate: new Date().toISOString().split('T')[0],
      mlModels: mlModels.map(m => ({ name: m.name, displayName: m.displayName })),
      categories: [
        { code: 'res', name: 'Residencial' },
        { code: 'com', name: 'Comercial' },
        { code: 'ind', name: 'Industrial' },
        { code: 'ap', name: 'Alumbrado Público' },
        { code: 'otr', name: 'Otros' }
      ]
    });

  } catch (error) {
    console.error('Error fetching system info:', error);
    return NextResponse.json(
      { error: 'Error al obtener información del sistema' },
      { status: 500 }
    );
  }
}