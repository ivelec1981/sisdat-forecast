import { NextRequest, NextResponse } from 'next/server';
import { prisma, QueryCache } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit');

    // Build cache key
    const cacheKey = `residential:${company || 'all'}:${startDate || ''}:${endDate || ''}:${limit || 'all'}`;

    // Check cache
    const cached = QueryCache.get<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Build where clause
    const where: any = {};

    if (company) {
      where.powerCompany = company;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    // Get residential data with optimized query
    const [residentialData, summary, companies] = await Promise.all([
      prisma.residentialData.findMany({
        where,
        orderBy: { date: 'asc' },
        take: limit ? parseInt(limit) : undefined,
        select: {
          date: true,
          powerCompany: true,
          type: true,
          enerComb: true,
          enerProphet: true,
          enerGru: true,
          enerWavenet: true,
          enerGbr: true,
          potComb: true,
          potProphet: true,
          potGbr: true,
          potGru: true,
          potWavenet: true,
        }
      }),
      // Get summary statistics
      prisma.residentialData.aggregate({
        where,
        _count: { id: true },
        _avg: {
          enerProphet: true,
          potProphet: true
        },
        _min: { date: true },
        _max: { date: true }
      }),
      // Get companies
      prisma.residentialData.groupBy({
        by: ['powerCompany'],
        where,
        _count: { powerCompany: true }
      })
    ]);
    
    // Format data for charts
    const chartData = residentialData.map(record => ({
      date: record.date.toISOString().split('T')[0],
      year: record.date.getFullYear(),
      month: record.date.getMonth() + 1,
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
    }));
    
    // Group by year for annual trends
    const yearlyData = residentialData.reduce((acc, record) => {
      const year = record.date.getFullYear();
      if (!acc[year]) {
        acc[year] = {
          year,
          records: [],
          totalEnergy: 0,
          avgPower: 0,
          recordCount: 0
        };
      }
      
      acc[year].records.push(record);
      acc[year].totalEnergy += record.enerProphet || 0;
      acc[year].avgPower += record.potProphet || 0;
      acc[year].recordCount++;
      
      return acc;
    }, {} as any);
    
    // Calculate yearly averages
    Object.values(yearlyData).forEach((yearData: any) => {
      yearData.avgPower = yearData.avgPower / yearData.recordCount;
    });

    const response = {
      success: true,
      data: chartData,
      summary: {
        totalRecords: summary._count.id,
        averageEnergy: summary._avg.enerProphet,
        averagePower: summary._avg.potProphet,
        dateRange: {
          start: summary._min.date,
          end: summary._max.date
        },
        companies: companies.map(c => ({
          name: c.powerCompany,
          recordCount: c._count.powerCompany
        }))
      },
      yearlyTrends: Object.values(yearlyData).sort((a: any, b: any) => a.year - b.year)
    };

    // Cache response for 5 minutes
    QueryCache.set(cacheKey, response, 5 * 60 * 1000);

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching residential data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener datos residenciales',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}