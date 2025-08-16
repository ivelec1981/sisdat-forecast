import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit');

    // Build where clause
    const where: any = {};
    
    if (company) {
      where.powerCompany = {
        contains: company
      };
    }
    
    if (startDate) {
      where.date = {
        ...where.date,
        gte: new Date(startDate)
      };
    }
    
    if (endDate) {
      where.date = {
        ...where.date,
        lte: new Date(endDate)
      };
    }

    // Fetch data with optional limit
    const publicLightingData = await prisma.publicLightingData.findMany({
      where,
      orderBy: { date: 'asc' },
      take: limit ? parseInt(limit) : undefined
    });

    // Transform data to match expected format
    const transformedData = publicLightingData.map(record => {
      // Use UTC methods to avoid timezone issues
      const date = new Date(record.date);
      return {
        date: record.date.toISOString(),
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        company: record.powerCompany,
        type: record.type,
        energy: {
          comb: record.enerComb,
          prophet: record.enerProphet,
          gru: record.enerGru,
          wavenet: record.enerWavenet,
          gbr: record.enerGbr
        },
        power: {
          comb: record.potComb,
          prophet: record.potProphet,
          gbr: record.potGbr,
          gru: record.potGru,
          wavenet: record.potWavenet
        }
      };
    });

    // Calculate summary statistics
    const summary = {
      totalRecords: publicLightingData.length,
      averageEnergy: publicLightingData.length > 0 
        ? publicLightingData.reduce((sum, record) => sum + (record.enerProphet || 0), 0) / publicLightingData.length 
        : 0,
      averagePower: publicLightingData.length > 0 
        ? publicLightingData.reduce((sum, record) => sum + (record.potProphet || 0), 0) / publicLightingData.length 
        : 0,
      dateRange: publicLightingData.length > 0 ? {
        start: publicLightingData[0].date.toISOString(),
        end: publicLightingData[publicLightingData.length - 1].date.toISOString()
      } : null,
      companies: publicLightingData.length > 0 ? [{
        name: publicLightingData[0].powerCompany,
        recordCount: publicLightingData.length
      }] : []
    };

    // Calculate yearly trends
    const yearlyTrends = transformedData.reduce((acc, record) => {
      const year = record.year;
      const existing = acc.find(trend => trend.year === year);
      
      if (existing) {
        existing.totalEnergy += record.energy.prophet || 0;
        existing.avgPower += record.power.prophet || 0;
        existing.recordCount += 1;
      } else {
        acc.push({
          year,
          totalEnergy: record.energy.prophet || 0,
          avgPower: record.power.prophet || 0,
          recordCount: 1
        });
      }
      
      return acc;
    }, [] as Array<{year: number, totalEnergy: number, avgPower: number, recordCount: number}>);

    // Calculate average power for each year
    yearlyTrends.forEach(trend => {
      trend.avgPower = trend.avgPower / trend.recordCount;
    });

    return NextResponse.json({
      success: true,
      data: transformedData,
      summary,
      yearlyTrends: yearlyTrends.sort((a, b) => a.year - b.year)
    });

  } catch (error) {
    console.error('Error fetching public lighting data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor al obtener datos de alumbrado público',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}