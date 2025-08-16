import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Obtener datos energéticos recientes
    const recentEnergyData = await prisma.energyRecord.findMany({
      where: {
        year: 2024
      },
      include: {
        company: true
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ],
      take: 100
    });

    // Datos de ResidentialData para métricas más detalladas
    const residentialData = await prisma.residentialData.findMany({
      orderBy: { date: 'desc' },
      take: 50
    });

    // Calcular métricas generales
    const totalCompanies = await prisma.company.count();
    const totalStations = await prisma.transmissionStation.count({ 
      where: { status: 'activa' } 
    });
    const stationsInMaintenance = await prisma.transmissionStation.count({ 
      where: { status: 'mantenimiento' } 
    });

    // Obtener datos por empresa para análisis
    const companiesData = await prisma.company.findMany({
      include: {
        energyRecords: {
          where: { year: 2024 },
          orderBy: { month: 'desc' },
          take: 12
        },
        transmissionData: {
          where: { status: 'activa' },
          select: {
            demand: true,
            maxDemand: true,
            sector: true
          }
        }
      }
    });

    // Calcular tendencias mensuales
    const monthlyTrends = await prisma.energyRecord.groupBy({
      by: ['month', 'model'],
      where: {
        year: 2024,
        month: { not: null }
      },
      _sum: {
        energy: true
      },
      orderBy: {
        month: 'asc'
      }
    });

    // Datos por sector
    const sectorData = await prisma.energyRecord.groupBy({
      by: ['category', 'model'],
      where: {
        year: 2024
      },
      _sum: {
        energy: true
      },
      _avg: {
        accuracy: true
      }
    });

    return NextResponse.json({
      summary: {
        totalCompanies,
        totalStations,
        stationsInMaintenance,
        lastUpdate: new Date().toISOString()
      },
      recentEnergyData,
      residentialData,
      companiesData,
      monthlyTrends,
      sectorData
    });

  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return NextResponse.json(
      { error: 'Error al obtener métricas del dashboard' },
      { status: 500 }
    );
  }
}