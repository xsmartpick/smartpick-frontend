import { apiClient } from '~/lib/api-client'
import { API_ENDPOINTS } from '~/lib/endpoints'

export interface DashboardStats {
  labeledToday: number
  totalLabeled: number
  avgTimeSeconds: number
  pendingBatches: number
  totalBatches: number
  totalImages: number
  totalSegments: number
}

export interface ActivityItem {
  id: string
  batchId: string
  batchName: string
  action: string
  count: number
  timestamp: string
}

export interface DashboardResponse {
  stats: DashboardStats
  recentActivity: ActivityItem[]
}

/**
 * Check if we have auth token in localStorage
 */
function hasAuthToken(): boolean {
  try {
    const token = localStorage.getItem('smartpick_token')
    return !!token && token !== 'null'
  } catch {
    return false
  }
}

export async function getDashboardStats(): Promise<DashboardResponse> {
  // Don't make the API call if there's no token
  // This prevents 401 errors during hydration/navigation
  if (!hasAuthToken()) {
    throw new Error('Not authenticated')
  }

  return apiClient<DashboardResponse>(API_ENDPOINTS.DASHBOARD.STATS, {
    method: 'GET',
  })
}
