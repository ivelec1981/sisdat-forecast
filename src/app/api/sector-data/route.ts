import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'energy'; // energy o power
    
    // Obtener fecha de corte histórico
    const lastHistoricalRecord = await prisma.energyRecord.findFirst({
      where: { model: 'hist' },
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    });

    const historicalCutoffYear = lastHistoricalRecord?.year || 2024;

    // Para datos históricos
    const historicalEnergyData = await prisma.energyRecord.groupBy({
      by: ['category'],
      where: {
        model: 'hist',
        year: historicalCutoffYear,
        month: { not: null } // Solo registros mensuales para energía
      },
      _sum: {
        energy: true  // Suma de todos los meses para energía total anual
      }
    });

    const historicalPowerData = await prisma.energyRecord.groupBy({
      by: ['category'],
      where: {
        model: 'hist',
        year: historicalCutoffYear,
        month: null // Registros anuales para potencia máxima
      },
      _max: {
        energy: true  // Máxima potencia del año
      }
    });

    // Para datos proyectados (siguiente año)
    const projectedYear = historicalCutoffYear + 1;
    
    const projectedEnergyData = await prisma.energyRecord.groupBy({
      by: ['category'],
      where: {
        model: 'prophet',
        year: projectedYear,
        month: { not: null } // Solo registros mensuales para energía
      },
      _sum: {
        energy: true  // Suma proyectada anual
      }
    });

    const projectedPowerData = await prisma.energyRecord.groupBy({
      by: ['category'],
      where: {
        model: 'prophet',
        year: projectedYear,
        month: null // Registros anuales para potencia máxima
      },
      _max: {
        energy: true  // Máxima potencia proyectada
      }
    });

    // Formatear datos según el tipo solicitado
    const formatSectorData = (data: any[], isEnergy: boolean) => {
      const sectorNames: Record<string, string> = {
        res: 'Residencial',
        com: 'Comercial',
        ind: 'Industrial',
        ap: 'Alumbrado Público',
        otr: 'Otros'
      };

      const sectorColors: Record<string, string> = {
        res: '#3B82F6',
        com: '#10B981',
        ind: '#F59E0B',
        ap: '#EF4444',
        otr: '#8B5CF6'
      };

      return data.map(item => {
        // Para energía: usar _sum, para potencia: usar _max
        const rawValue = isEnergy ? (item._sum?.energy || 0) : (item._max?.energy || 0);
        
        // Convertir unidades:
        // Energía: MWh (dividir por 1000 si está en kWh)
        // Potencia: MW (dividir por 1000 si está en kW)
        const value = rawValue / 1000;

        return {
          category: item.category,
          name: sectorNames[item.category] || item.category,
          value: value,
          color: sectorColors[item.category] || '#6B7280'
        };
      });
    };

    const isEnergy = type === 'energy';
    
    const historicalFormatted = formatSectorData(
      isEnergy ? historicalEnergyData : historicalPowerData, 
      isEnergy
    );
    
    const projectedFormatted = formatSectorData(
      isEnergy ? projectedEnergyData : projectedPowerData, 
      isEnergy
    );

    // Calcular porcentajes
    const addPercentages = (data: any[]) => {
      const total = data.reduce((sum, item) => sum + item.value, 0);
      return data.map(item => ({
        ...item,
        percentage: total > 0 ? (item.value / total * 100) : 0
      }));
    };

    return NextResponse.json({
      type,
      unit: isEnergy ? 'MWh' : 'MW',
      historicalYear: historicalCutoffYear,
      projectedYear: projectedYear,
      historical: addPercentages(historicalFormatted),
      projected: addPercentages(projectedFormatted)
    });

  } catch (error) {
    console.error('Error fetching sector data:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos por sector' },
      { status: 500 }
    );
  }
}