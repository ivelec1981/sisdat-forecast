import { renderHook, act } from '@testing-library/react'
import { usePagination } from '../usePagination'

describe('usePagination', () => {
  const mockData = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
  }))

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() =>
      usePagination({ data: mockData })
    )

    expect(result.current.currentPage).toBe(1)
    expect(result.current.totalPages).toBe(10) // 100 items / 10 per page
    expect(result.current.totalItems).toBe(100)
    expect(result.current.itemsPerPage).toBe(10)
    expect(result.current.hasNextPage).toBe(true)
    expect(result.current.hasPreviousPage).toBe(false)
    expect(result.current.currentData).toHaveLength(10)
  })

  it('should initialize with custom values', () => {
    const { result } = renderHook(() =>
      usePagination({
        data: mockData,
        itemsPerPage: 25,
        initialPage: 2,
      })
    )

    expect(result.current.currentPage).toBe(2)
    expect(result.current.totalPages).toBe(4) // 100 items / 25 per page
    expect(result.current.itemsPerPage).toBe(25)
    expect(result.current.currentData).toHaveLength(25)
  })

  it('should go to next page correctly', () => {
    const { result } = renderHook(() =>
      usePagination({ data: mockData })
    )

    act(() => {
      result.current.goToNextPage()
    })

    expect(result.current.currentPage).toBe(2)
    expect(result.current.hasNextPage).toBe(true)
    expect(result.current.hasPreviousPage).toBe(true)
  })

  it('should go to previous page correctly', () => {
    const { result } = renderHook(() =>
      usePagination({ data: mockData, initialPage: 3 })
    )

    act(() => {
      result.current.goToPreviousPage()
    })

    expect(result.current.currentPage).toBe(2)
    expect(result.current.hasNextPage).toBe(true)
    expect(result.current.hasPreviousPage).toBe(true)
  })

  it('should go to specific page correctly', () => {
    const { result } = renderHook(() =>
      usePagination({ data: mockData })
    )

    act(() => {
      result.current.goToPage(5)
    })

    expect(result.current.currentPage).toBe(5)
    expect(result.current.hasNextPage).toBe(true)
    expect(result.current.hasPreviousPage).toBe(true)
  })

  it('should not go beyond last page', () => {
    const { result } = renderHook(() =>
      usePagination({ data: mockData, initialPage: 10 })
    )

    act(() => {
      result.current.goToNextPage()
    })

    expect(result.current.currentPage).toBe(10)
    expect(result.current.hasNextPage).toBe(false)
  })

  it('should not go before first page', () => {
    const { result } = renderHook(() =>
      usePagination({ data: mockData })
    )

    act(() => {
      result.current.goToPreviousPage()
    })

    expect(result.current.currentPage).toBe(1)
    expect(result.current.hasPreviousPage).toBe(false)
  })

  it('should go to first page', () => {
    const { result } = renderHook(() =>
      usePagination({ data: mockData, initialPage: 5 })
    )

    act(() => {
      result.current.goToFirstPage()
    })

    expect(result.current.currentPage).toBe(1)
  })

  it('should go to last page', () => {
    const { result } = renderHook(() =>
      usePagination({ data: mockData })
    )

    act(() => {
      result.current.goToLastPage()
    })

    expect(result.current.currentPage).toBe(10)
  })

  it('should change items per page and reset to first page', () => {
    const { result } = renderHook(() =>
      usePagination({ data: mockData, initialPage: 5 })
    )

    act(() => {
      result.current.setItemsPerPage(25)
    })

    expect(result.current.currentPage).toBe(1)
    expect(result.current.itemsPerPage).toBe(25)
    expect(result.current.totalPages).toBe(4)
    expect(result.current.currentData).toHaveLength(25)
  })

  it('should handle empty data correctly', () => {
    const { result } = renderHook(() =>
      usePagination({ data: [] })
    )

    expect(result.current.totalPages).toBe(0)
    expect(result.current.totalItems).toBe(0)
    expect(result.current.currentData).toHaveLength(0)
    expect(result.current.hasNextPage).toBe(false)
    expect(result.current.hasPreviousPage).toBe(false)
  })

  it('should return correct slice of data', () => {
    const { result } = renderHook(() =>
      usePagination({ data: mockData, itemsPerPage: 5 })
    )

    expect(result.current.currentData[0]).toEqual({ id: 1, name: 'Item 1' })
    expect(result.current.currentData[4]).toEqual({ id: 5, name: 'Item 5' })

    act(() => {
      result.current.goToPage(2)
    })

    expect(result.current.currentData[0]).toEqual({ id: 6, name: 'Item 6' })
    expect(result.current.currentData[4]).toEqual({ id: 10, name: 'Item 10' })
  })

  it('should validate page bounds', () => {
    const { result } = renderHook(() =>
      usePagination({ data: mockData })
    )

    // Try to go to invalid pages
    act(() => {
      result.current.goToPage(-1)
    })
    expect(result.current.currentPage).toBe(1)

    act(() => {
      result.current.goToPage(999)
    })
    expect(result.current.currentPage).toBe(10) // Should clamp to max page
  })
})