/**
 * Audit API Client
 * Functions for interacting with audit endpoints
 */

import { apiClient } from '~/lib/api-client'
import { API_ENDPOINTS } from '~/lib/endpoints'

import type {
  AuditFilters,
  AuditLogsResponse,
  AuditStats,
  AuditTimeline,
} from './types'

/**
 * Fetch audit logs with optional filters and pagination
 */
export async function fetchAuditLogs(
  filters?: AuditFilters,
): Promise<AuditLogsResponse> {
  const params = new URLSearchParams()

  if (filters?.userId) params.append('user_id', filters.userId)
  if (filters?.actionType) params.append('action_type', filters.actionType)
  if (filters?.resourceType)
    params.append('resource_type', filters.resourceType)
  if (filters?.dateFrom) params.append('date_from', filters.dateFrom)
  if (filters?.dateTo) params.append('date_to', filters.dateTo)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const url = `${API_ENDPOINTS.AUDIT.LOGS}?${params.toString()}`
  return apiClient<AuditLogsResponse>(url)
}

/**
 * Fetch audit statistics (actions today, active users, breakdown)
 */
export async function fetchAuditStats(): Promise<AuditStats> {
  return apiClient<AuditStats>(API_ENDPOINTS.AUDIT.STATS)
}

/**
 * Fetch audit timeline data (activity over time)
 */
export async function fetchAuditTimeline(days = 30): Promise<AuditTimeline> {
  const url = `${API_ENDPOINTS.AUDIT.TIMELINE}?days=${days}`
  return apiClient<AuditTimeline>(url)
}
