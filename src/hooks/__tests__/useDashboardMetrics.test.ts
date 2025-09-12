import { renderHook, waitFor } from '@testing-library/react'
import { useDashboardMetrics } from '../useDashboardMetrics'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock data
const mockDashboardData = {
  summary: {
    totalCompanies: 10,
    totalStations: 150,
    stationsInMaintenance: 5,
    lastUpdate: '2024-01-01T00:00:00Z',
  },
  recentEnergyData: [
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
  ],
  residentialData: [
    {
      id: 1,
      powerCompany: 'CNEL Guayas Los Ríos',
      date: '2024-01-01',
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
  ],
  monthlyTrends: [
    {
      month: 1,
      model: 'prophet',
      _sum: { energy: 5000 },
    },
    {
      month: 1,
      model: 'gru',
      _sum: { energy: 4900 },
    },
  ],
  sectorData: [
    {
      category: 'residential',
      model: 'prophet',
      _sum: { energy: 10000 },
      _avg: { accuracy: 0.95 },
    },
    {
      category: 'commercial',
      model: 'prophet',
      _sum: { energy: 8000 },
      _avg: { accuracy: 0.92 },
    },
  ],
}

describe('useDashboardMetrics', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should fetch and return dashboard metrics successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockDashboardData),
    })

    const { result } = renderHook(() => useDashboardMetrics())

    // Initially loading
    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBe(null)
    expect(result.current.error).toBe(null)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBeDefined()
    expect(result.current.data?.summary).toEqual(mockDashboardData.summary)
    expect(result.current.error).toBe(null)
    expect(mockFetch).toHaveBeenCalledWith('/api/dashboard-metrics')
  })

  it('should handle fetch errors correctly', async () => {
    const errorMessage = 'Network error'
    mockFetch.mockRejectedValueOnce(new Error(errorMessage))

    const { result } = renderHook(() => useDashboardMetrics())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBe(null)
    expect(result.current.error).toBe(errorMessage)
  })

  it('should handle HTTP error responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    const { result } = renderHook(() => useDashboardMetrics())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBe(null)
    expect(result.current.error).toBe('Error al obtener métricas del dashboard')
  })

  it('should process data correctly with maps', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockDashboardData),
    })

    const { result } = renderHook(() => useDashboardMetrics())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data?.monthlyTrendsMap).toBeDefined()
    expect(result.current.data?.monthlyTrendsMap.prophet).toHaveLength(1)
    expect(result.current.data?.monthlyTrendsMap.gru).toHaveLength(1)

    expect(result.current.data?.sectorDataMap).toBeDefined()
    expect(result.current.data?.sectorDataMap.residential).toHaveLength(1)
    expect(result.current.data?.sectorDataMap.commercial).toHaveLength(1)
  })

  it('should refetch data when refetch is called', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockDashboardData),
    })

    const { result } = renderHook(() => useDashboardMetrics())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)

    // Call refetch
    result.current.refetch()

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  it('should set up interval for automatic refreshing', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockDashboardData),
    })

    const { unmount } = renderHook(() => useDashboardMetrics())

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    // Fast-forward 5 minutes
    jest.advanceTimersByTime(5 * 60 * 1000)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    // Clean up
    unmount()
  })

  it('should cleanup interval on unmount', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockDashboardData),
    })

    const { unmount } = renderHook(() => useDashboardMetrics())

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    unmount()

    // Fast-forward 5 minutes after unmount
    jest.advanceTimersByTime(5 * 60 * 1000)

    // Should not call fetch again after unmount
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('should handle unknown errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce('Unknown error type')

    const { result } = renderHook(() => useDashboardMetrics())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Error desconocido')
  })
})