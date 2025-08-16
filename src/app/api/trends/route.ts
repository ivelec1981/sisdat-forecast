import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category'); // res, com, ind, ap, otr
    const type = searchParams.get('type') || 'energy'; // energy o power
    
    // Obtener fecha de corte histórico
    const lastHistoricalRecord = await prisma.energyRecord.findFirst({
      where: { model: 'hist' },
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    });

    const historicalCutoffYear = lastHistoricalRecord?.year || 2024;
    const historicalCutoffMonth = lastHistoricalRecord?.month || 12;

    // Datos históricos (modelo 'hist')
    const historicalData = await prisma.energyRecord.groupBy({
      by: ['year', 'month'],
      where: {
        model: 'hist',
        month: type === 'energy' ? { not: null } : null, // Para energía: mensual, para potencia: anual
        ...(category && { category }),
        OR: [
          { year: { lt: historicalCutoffYear } },
          { 
            year: historicalCutoffYear,
            ...(type === 'energy' && { month: { lte: historicalCutoffMonth } })
          }
        ]
      },
      _sum: {
        energy: true
      },
      _max: {
        energy: true  // Para potencia máxima
      },
      orderBy: [{ year: 'asc' }, { month: 'asc' }]
    });

    // Datos proyectados (modelos ML excluyendo 'hist')
    const projectedData = await prisma.energyRecord.groupBy({
      by: ['year', 'month', 'model'],
      where: {
        model: { not: 'hist' },
        month: type === 'energy' ? { not: null } : null, // Para energía: mensual, para potencia: anual
        ...(category && { category }),
        OR: [
          { year: { gt: historicalCutoffYear } },
          { 
            year: historicalCutoffYear,
            ...(type === 'energy' && { month: { gt: historicalCutoffMonth } })
          }
        ]
      },
      _sum: {
        energy: true
      },
      _max: {
        energy: true
      },
      orderBy: [{ year: 'asc' }, { month: 'asc' }]
    });

    // Datos anuales históricos
    const historicalAnnual = await prisma.energyRecord.groupBy({
      by: ['year'],
      where: {
        model: 'hist',
        ...(category && { category }),
        year: { lte: historicalCutoffYear }
      },
      _sum: {
        energy: true
      },
      _max: {
        energy: true
      },
      orderBy: { year: 'asc' }
    });

    // Datos anuales proyectados
    const projectedAnnual = await prisma.energyRecord.groupBy({
      by: ['year', 'model'],
      where: {
        model: { not: 'hist' },
        ...(category && { category }),
        year: { gte: historicalCutoffYear }
      },
      _sum: {
        energy: true
      },
      _max: {
        energy: true
      },
      orderBy: [{ year: 'asc' }]
    });

    // Formatear datos mensuales
    const monthlyTrends = {
      historical: historicalData.map(item => ({
        year: item.year,
        month: type === 'energy' ? item.month : null, // Para potencia no hay mes específico
        value: type === 'energy' ? item._sum.energy : item._max.energy,
        type: 'historical'
      })),
      projected: projectedData.map(item => ({
        year: item.year,
        month: type === 'energy' ? item.month : null, // Para potencia no hay mes específico  
        model: item.model,
        value: type === 'energy' ? item._sum.energy : item._max.energy,
        type: 'projected'
      }))
    };

    // Formatear datos anuales
    const annualTrends = {
      historical: historicalAnnual.map(item => ({
        year: item.year,
        value: type === 'energy' ? item._sum.energy : item._max.energy,
        type: 'historical'
      })),
      projected: projectedAnnual.map(item => ({
        year: item.year,
        model: item.model,
        value: type === 'energy' ? item._sum.energy : item._max.energy,
        type: 'projected'
      }))
    };

    // Evolución últimos 12 meses vs proyectados
    const last12Months = [];
    
    if (type === 'energy') {
      // Para energía: usar datos mensuales como antes
      const currentDate = new Date();
      
      for (let i = 11; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        
        // Determinar si es histórico o proyectado
        const isHistorical = year < historicalCutoffYear || 
                            (year === historicalCutoffYear && month <= historicalCutoffMonth);
        
        if (isHistorical) {
          const historicalValue = historicalData.find(h => 
            h.year === year && h.month === month
          );
          if (historicalValue) {
            last12Months.push({
              year,
              month,
              date: `${year}-${month.toString().padStart(2, '0')}`,
              value: historicalValue._sum.energy,
              type: 'historical'
            });
          }
        } else {
          // Buscar proyectado (usar prophet por defecto)
          const projectedValue = projectedData.find(p => 
            p.year === year && p.month === month && p.model === 'prophet'
          );
          if (projectedValue) {
            last12Months.push({
              year,
              month,
              date: `${year}-${month.toString().padStart(2, '0')}`,
              value: projectedValue._sum.energy,
              type: 'projected',
              model: 'prophet'
            });
          }
        }
      }
    } else {
      // Para potencia: usar datos anuales únicamente
      const currentYear = new Date().getFullYear();
      const startYear = Math.max(2020, currentYear - 5); // Últimos 5 años
      
      for (let year = startYear; year <= currentYear + 2; year++) {
        const isHistorical = year <= historicalCutoffYear;
        
        if (isHistorical) {
          const historicalValue = historicalData.find(h => h.year === year);
          if (historicalValue) {
            last12Months.push({
              year,
              month: null,
              date: year.toString(),
              value: historicalValue._max.energy,
              type: 'historical'
            });
          }
        } else {
          // Buscar proyectado (usar prophet por defecto)
          const projectedValue = projectedData.find(p => 
            p.year === year && p.model === 'prophet'
          );
          if (projectedValue) {
            last12Months.push({
              year,
              month: null,
              date: year.toString(),
              value: projectedValue._max.energy,
              type: 'projected',
              model: 'prophet'
            });
          }
        }
      }
    }

    return NextResponse.json({
      historicalCutoffDate: `${historicalCutoffYear}-${historicalCutoffMonth.toString().padStart(2, '0')}-01`,
      monthlyTrends,
      annualTrends,
      last12Months,
      category: category || 'all',
      type
    });

  } catch (error) {
    console.error('Error fetching trends:', error);
    return NextResponse.json(
      { error: 'Error al obtener tendencias' },
      { status: 500 }
    );
  }
}