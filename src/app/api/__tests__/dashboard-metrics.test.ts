import { NextRequest } from 'next/server'
import { GET } from '../dashboard-metrics/route'

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    company: {
      count: jest.fn(),
    },
    transmissionStation: {
      count: jest.fn(),
    },
    energyData: {
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    residentialData: {
      findMany: jest.fn(),
    },
  },
}))

import { prisma } from '@/lib/db'

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('/api/dashboard-metrics', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return dashboard metrics successfully', async () => {
    // Mock data
    const mockCompanyCount = 10
    const mockStationCount = 150
    const mockEnergyData = [
      {
        id: 1,
        companyId: 1,
        category: 'residential',
        year: 2024,
        month: 1,
        model: 'prophet',
        energy: 1000,
        accuracy: 0.95,
        company: {
          name: 'CNEL Guayas Los Ríos',
          region: 'Costa',
        },
      },
    ]
    const mockResidentialData = [
      {
        id: 1,
        powerCompany: 'CNEL Guayas Los Ríos',
        date: '2024-01-01T00:00:00Z',
        enerComb: 1000,
        enerProphet: 950,
        enerGru: 980,
        enerWavenet: 1020,
        enerGbr: 990,
        potComb: 200,
        potProphet: 190,
        potGru: 196,
        potWavenet: 204,
        potGbr: 198,
      },
    ]
    const mockMonthlyTrends = [
      {
        month: 1,
        model: 'prophet',
        _sum: { energy: 5000 },
      },
    ]
    const mockSectorData = [
      {
        category: 'residential',
        model: 'prophet',
        _sum: { energy: 10000 },
        _avg: { accuracy: 0.95 },
      },
    ]

    // Setup mocks
    mockPrisma.company.count.mockResolvedValue(mockCompanyCount)
    mockPrisma.transmissionStation.count
      .mockResolvedValueOnce(mockStationCount)
      .mockResolvedValueOnce(5) // stationsInMaintenance

    mockPrisma.energyData.findMany
      .mockResolvedValueOnce(mockEnergyData as any)
      .mockResolvedValueOnce(mockResidentialData as any)

    mockPrisma.energyData.groupBy
      .mockResolvedValueOnce(mockMonthlyTrends as any)
      .mockResolvedValueOnce(mockSectorData as any)

    // Create request
    const request = new NextRequest('http://localhost:3000/api/dashboard-metrics')
    
    // Call the API
    const response = await GET(request)
    const data = await response.json()

    // Assertions
    expect(response.status).toBe(200)
    expect(data).toHaveProperty('summary')
    expect(data.summary).toEqual({
      totalCompanies: mockCompanyCount,
      totalStations: mockStationCount,
      stationsInMaintenance: 5,
      lastUpdate: expect.any(String),
    })
    expect(data).toHaveProperty('recentEnergyData')
    expect(data).toHaveProperty('residentialData')
    expect(data).toHaveProperty('monthlyTrends')
    expect(data).toHaveProperty('sectorData')
  })

  it('should handle database errors gracefully', async () => {
    // Mock database error
    mockPrisma.company.count.mockRejectedValue(new Error('Database connection failed'))

    const request = new NextRequest('http://localhost:3000/api/dashboard-metrics')
    
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toHaveProperty('error')
    expect(data.error).toContain('Error interno del servidor')
  })

  it('should return valid JSON structure', async () => {
    // Setup minimal mocks
    mockPrisma.company.count.mockResolvedValue(0)
    mockPrisma.transmissionStation.count.mockResolvedValue(0)
    mockPrisma.energyData.findMany.mockResolvedValue([])
    mockPrisma.energyData.groupBy.mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/dashboard-metrics')
    
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toMatchObject({
      summary: expect.objectContaining({
        totalCompanies: expect.any(Number),
        totalStations: expect.any(Number),
        stationsInMaintenance: expect.any(Number),
        lastUpdate: expect.any(String),
      }),
      recentEnergyData: expect.any(Array),
      residentialData: expect.any(Array),
      monthlyTrends: expect.any(Array),
      sectorData: expect.any(Array),
    })
  })

  it('should handle empty data gracefully', async () => {
    // Setup mocks with empty data
    mockPrisma.company.count.mockResolvedValue(0)
    mockPrisma.transmissionStation.count.mockResolvedValue(0)
    mockPrisma.energyData.findMany.mockResolvedValue([])
    mockPrisma.energyData.groupBy.mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/dashboard-metrics')
    
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.summary.totalCompanies).toBe(0)
    expect(data.summary.totalStations).toBe(0)
    expect(data.recentEnergyData).toEqual([])
    expect(data.residentialData).toEqual([])
    expect(data.monthlyTrends).toEqual([])
    expect(data.sectorData).toEqual([])
  })

  it('should have correct CORS headers', async () => {
    mockPrisma.company.count.mockResolvedValue(1)
    mockPrisma.transmissionStation.count.mockResolvedValue(1)
    mockPrisma.energyData.findMany.mockResolvedValue([])
    mockPrisma.energyData.groupBy.mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/dashboard-metrics')
    
    const response = await GET(request)

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET')
  })
})