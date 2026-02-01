/**
 * Audit Log Types
 * TypeScript interfaces for audit logging system
 */

export interface AuditLog {
  id: string
  actorUserId: string
  actor?: {
    id: string
    displayName: string
  }
  actionType: string
  resourceType?: string
  resourceId?: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

export interface AuditStats {
  stats: {
    totalActions: number
    activeUsers: number
    actionsToday: number
    criticalActions: number
  }
  topUsers: Array<{
    userId: string
    displayName: string
    actionCount: number
  }>
  actionBreakdown: Record<string, number>
}

export interface AuditTimeline {
  data: Array<{
    date: string
    count: number
  }>
}

export interface AuditLogsResponse {
  data: AuditLog[]
  pagination: {
    page: number
    limit: number
    total: number
  }
}

export interface AuditFilters {
  userId?: string
  actionType?: string
  resourceType?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}
