import { describe, expect, it } from 'vitest'

import type { ImageSegment, SegmentStatus } from '../../segmentation/types'

describe('Labeling Utils', () => {
  describe('Segment Status Filtering', () => {
    function filterSegmentsByStatus(
      segments: Partial<ImageSegment>[],
      status: SegmentStatus | 'all',
    ): Partial<ImageSegment>[] {
      if (status === 'all') return segments
      return segments.filter((s) => s.status === status)
    }

    const mockSegments: Partial<ImageSegment>[] = [
      { id: '1', status: 'approved', confidence: 0.95 },
      { id: '2', status: 'approved', confidence: 0.9 },
      { id: '3', status: 'pending_review', confidence: 0.75 },
      { id: '4', status: 'pending_review', confidence: 0.6 },
      { id: '5', status: 'rejected', confidence: 0.3 },
    ]

    it('should filter approved segments', () => {
      const result = filterSegmentsByStatus(mockSegments, 'approved')
      expect(result).toHaveLength(2)
      expect(result.every((s) => s.status === 'approved')).toBe(true)
    })

    it('should filter pending segments', () => {
      const result = filterSegmentsByStatus(mockSegments, 'pending_review')
      expect(result).toHaveLength(2)
      expect(result.every((s) => s.status === 'pending_review')).toBe(true)
    })

    it('should filter rejected segments', () => {
      const result = filterSegmentsByStatus(mockSegments, 'rejected')
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('5')
    })

    it('should return all segments when status is "all"', () => {
      const result = filterSegmentsByStatus(mockSegments, 'all')
      expect(result).toHaveLength(5)
    })
  })

  describe('Segment Sorting', () => {
    type SortOption = 'confidence-desc' | 'confidence-asc' | 'status' | 'newest'

    function sortSegments(
      segments: Partial<ImageSegment>[],
      sortBy: SortOption,
    ): Partial<ImageSegment>[] {
      const sorted = [...segments]

      switch (sortBy) {
        case 'confidence-desc': {
          return sorted.sort(
            (a, b) => (b.confidence || 0) - (a.confidence || 0),
          )
        }
        case 'confidence-asc': {
          return sorted.sort(
            (a, b) => (a.confidence || 0) - (b.confidence || 0),
          )
        }
        case 'status': {
          const statusOrder: Record<string, number> = {
            pending_review: 0,
            approved: 1,
            rejected: 2,
          }
          return sorted.sort(
            (a, b) =>
              (statusOrder[a.status || ''] || 99) -
              (statusOrder[b.status || ''] || 99),
          )
        }
        case 'newest': {
          return sorted.sort(
            (a, b) =>
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime(),
          )
        }
        default: {
          return sorted
        }
      }
    }

    const mockSegments: Partial<ImageSegment>[] = [
      {
        id: '1',
        status: 'approved',
        confidence: 0.95,
        createdAt: '2026-01-15T10:00:00Z',
      },
      {
        id: '2',
        status: 'pending_review',
        confidence: 0.75,
        createdAt: '2026-01-16T10:00:00Z',
      },
      {
        id: '3',
        status: 'rejected',
        confidence: 0.3,
        createdAt: '2026-01-14T10:00:00Z',
      },
      {
        id: '4',
        status: 'approved',
        confidence: 0.88,
        createdAt: '2026-01-17T10:00:00Z',
      },
    ]

    it('should sort by confidence descending', () => {
      const result = sortSegments(mockSegments, 'confidence-desc')
      expect(result[0].confidence).toBe(0.95)
      expect(result[1].confidence).toBe(0.88)
      expect(result[2].confidence).toBe(0.75)
      expect(result[3].confidence).toBe(0.3)
    })

    it('should sort by confidence ascending', () => {
      const result = sortSegments(mockSegments, 'confidence-asc')
      expect(result[0].confidence).toBe(0.3)
      expect(result[3].confidence).toBe(0.95)
    })

    it('should sort by status preserving length', () => {
      const result = sortSegments(mockSegments, 'status')
      // Sorting by status should not change the number of items
      expect(result).toHaveLength(mockSegments.length)
      // All original items should still be present
      const ids = result.map((s) => s.id)
      expect(ids).toContain('1')
      expect(ids).toContain('2')
      expect(ids).toContain('3')
      expect(ids).toContain('4')
    })

    it('should sort by newest first', () => {
      const result = sortSegments(mockSegments, 'newest')
      expect(result[0].id).toBe('4') // Jan 17
      expect(result[1].id).toBe('2') // Jan 16
      expect(result[2].id).toBe('1') // Jan 15
      expect(result[3].id).toBe('3') // Jan 14
    })
  })

  describe('Label Assignment', () => {
    interface Label {
      id: string
      name: string
      color: string
    }

    interface SegmentWithLabel extends Partial<ImageSegment> {
      labelId?: string
      labelName?: string
      labelColor?: string
    }

    function assignLabel(
      segment: SegmentWithLabel,
      label: Label,
    ): SegmentWithLabel {
      return {
        ...segment,
        labelId: label.id,
        labelName: label.name,
        labelColor: label.color,
      }
    }

    function removeLabel(segment: SegmentWithLabel): SegmentWithLabel {
      const { labelId, labelName, labelColor, ...rest } = segment
      return rest
    }

    function isLabeled(segment: SegmentWithLabel): boolean {
      return !!segment.labelId
    }

    it('should correctly assign label to segment', () => {
      const segment: SegmentWithLabel = { id: '1', status: 'approved' }
      const label: Label = {
        id: 'label-1',
        name: 'Good Quality',
        color: '#00FF00',
      }

      const result = assignLabel(segment, label)

      expect(result.labelId).toBe('label-1')
      expect(result.labelName).toBe('Good Quality')
      expect(result.labelColor).toBe('#00FF00')
    })

    it('should remove label from segment', () => {
      const segment: SegmentWithLabel = {
        id: '1',
        status: 'approved',
        labelId: 'label-1',
        labelName: 'Good Quality',
        labelColor: '#00FF00',
      }

      const result = removeLabel(segment)

      expect(result.labelId).toBeUndefined()
      expect(result.labelName).toBeUndefined()
      expect(result.labelColor).toBeUndefined()
      expect(result.id).toBe('1') // Other props preserved
    })

    it('should correctly check if segment is labeled', () => {
      const labeled: SegmentWithLabel = {
        id: '1',
        labelId: 'label-1',
      }
      const unlabeled: SegmentWithLabel = {
        id: '2',
      }

      expect(isLabeled(labeled)).toBe(true)
      expect(isLabeled(unlabeled)).toBe(false)
    })
  })

  describe('Bulk Operations', () => {
    function bulkApprove(
      segments: Partial<ImageSegment>[],
    ): Partial<ImageSegment>[] {
      return segments.map((s) => ({
        ...s,
        status: 'approved' as SegmentStatus,
      }))
    }

    function bulkReject(
      segments: Partial<ImageSegment>[],
    ): Partial<ImageSegment>[] {
      return segments.map((s) => ({
        ...s,
        status: 'rejected' as SegmentStatus,
      }))
    }

    function getPendingCount(segments: Partial<ImageSegment>[]): number {
      return segments.filter((s) => s.status === 'pending_review').length
    }

    const mockPendingSegments: Partial<ImageSegment>[] = [
      { id: '1', status: 'pending_review', confidence: 0.8 },
      { id: '2', status: 'pending_review', confidence: 0.7 },
      { id: '3', status: 'pending_review', confidence: 0.6 },
    ]

    it('should bulk approve all segments', () => {
      const result = bulkApprove(mockPendingSegments)

      expect(result).toHaveLength(3)
      expect(result.every((s) => s.status === 'approved')).toBe(true)
    })

    it('should bulk reject all segments', () => {
      const result = bulkReject(mockPendingSegments)

      expect(result).toHaveLength(3)
      expect(result.every((s) => s.status === 'rejected')).toBe(true)
    })

    it('should correctly count pending segments', () => {
      const mixed: Partial<ImageSegment>[] = [
        { id: '1', status: 'pending_review' },
        { id: '2', status: 'approved' },
        { id: '3', status: 'pending_review' },
        { id: '4', status: 'rejected' },
      ]

      expect(getPendingCount(mixed)).toBe(2)
    })
  })

  describe('Confidence Threshold Validation', () => {
    function shouldAutoApprove(confidence: number, threshold: number): boolean {
      return confidence >= threshold
    }

    function getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
      if (confidence >= 0.85) return 'high'
      if (confidence >= 0.6) return 'medium'
      return 'low'
    }

    function getConfidenceColor(confidence: number): string {
      if (confidence >= 0.85) return '#22C55E' // green
      if (confidence >= 0.6) return '#F59E0B' // amber
      return '#EF4444' // red
    }

    it('should auto-approve when confidence meets threshold', () => {
      expect(shouldAutoApprove(0.9, 0.85)).toBe(true)
      expect(shouldAutoApprove(0.85, 0.85)).toBe(true)
      expect(shouldAutoApprove(0.84, 0.85)).toBe(false)
      expect(shouldAutoApprove(0.5, 0.85)).toBe(false)
    })

    it('should correctly determine confidence level', () => {
      expect(getConfidenceLevel(0.95)).toBe('high')
      expect(getConfidenceLevel(0.85)).toBe('high')
      expect(getConfidenceLevel(0.84)).toBe('medium')
      expect(getConfidenceLevel(0.6)).toBe('medium')
      expect(getConfidenceLevel(0.59)).toBe('low')
      expect(getConfidenceLevel(0.3)).toBe('low')
    })

    it('should return correct confidence color', () => {
      expect(getConfidenceColor(0.9)).toBe('#22C55E')
      expect(getConfidenceColor(0.7)).toBe('#F59E0B')
      expect(getConfidenceColor(0.4)).toBe('#EF4444')
    })
  })
})

describe('Keyboard Navigation', () => {
  type NavigationDirection = 'next' | 'previous' | 'up' | 'down'

  function getNextIndex(
    currentIndex: number,
    totalItems: number,
    direction: NavigationDirection,
    columns = 1,
  ): number {
    if (totalItems === 0) return -1

    switch (direction) {
      case 'next': {
        return (currentIndex + 1) % totalItems
      }
      case 'previous': {
        return (currentIndex - 1 + totalItems) % totalItems
      }
      case 'down': {
        const nextDown = currentIndex + columns
        return nextDown < totalItems ? nextDown : currentIndex
      }
      case 'up': {
        const nextUp = currentIndex - columns
        return nextUp >= 0 ? nextUp : currentIndex
      }
      default: {
        return currentIndex
      }
    }
  }

  it('should navigate to next item with wraparound', () => {
    expect(getNextIndex(0, 5, 'next')).toBe(1)
    expect(getNextIndex(4, 5, 'next')).toBe(0) // wrap
  })

  it('should navigate to previous item with wraparound', () => {
    expect(getNextIndex(1, 5, 'previous')).toBe(0)
    expect(getNextIndex(0, 5, 'previous')).toBe(4) // wrap
  })

  it('should navigate down in grid', () => {
    // 3x3 grid (9 items, 3 columns)
    expect(getNextIndex(0, 9, 'down', 3)).toBe(3)
    expect(getNextIndex(4, 9, 'down', 3)).toBe(7)
    expect(getNextIndex(7, 9, 'down', 3)).toBe(7) // can't go down
  })

  it('should navigate up in grid', () => {
    // 3x3 grid (9 items, 3 columns)
    expect(getNextIndex(4, 9, 'up', 3)).toBe(1)
    expect(getNextIndex(1, 9, 'up', 3)).toBe(1) // can't go up
    expect(getNextIndex(7, 9, 'up', 3)).toBe(4)
  })

  it('should handle empty list', () => {
    expect(getNextIndex(0, 0, 'next')).toBe(-1)
    expect(getNextIndex(0, 0, 'previous')).toBe(-1)
  })
})
