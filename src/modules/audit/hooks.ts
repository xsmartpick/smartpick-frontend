/**
 * Audit Hooks
 * TanStack Query hooks for audit data
 */

import { useQuery } from '@tanstack/react-query'

import { fetchAuditLogs, fetchAuditStats, fetchAuditTimeline } from './api'
import type { AuditFilters } from './types'

/**
 * Hook to fetch audit logs with filters
 */
export function useAuditLogs(filters?: AuditFilters) {
  return useQuery({
    queryKey: ['audit', 'logs', filters],
    queryFn: () => fetchAuditLogs(filters),
    staleTime: 30_000, // 30 seconds
    refetchInterval: 30_000, // Auto-refresh every 30s
  })
}

/**
 * Hook to fetch audit statistics
 */
export function useAuditStats() {
  return useQuery({
    queryKey: ['audit', 'stats'],
    queryFn: fetchAuditStats,
    staleTime: 30_000,
    refetchInterval: 30_000,
  })
}

/**
 * Hook to fetch audit timeline
 */
export function useAuditTimeline(days = 30) {
  return useQuery({
    queryKey: ['audit', 'timeline', days],
    queryFn: () => fetchAuditTimeline(days),
    staleTime: 60_000, // 1 minute
    refetchInterval: 60_000,
  })
}
