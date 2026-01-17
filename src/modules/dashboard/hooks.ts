import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'

import { useIsAuthenticated } from '~/atoms/auth'

import { getDashboardStats } from './api'

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
}

/**
 * Check if we have auth data in localStorage (synchronous check)
 * This is used to prevent queries from running before Jotai hydrates
 */
function hasStoredAuth(): boolean {
  try {
    const token = localStorage.getItem('smartpick_token')
    const user = localStorage.getItem('smartpick_user')
    return !!token && token !== 'null' && !!user && user !== 'null'
  } catch {
    return false
  }
}

export function useDashboardStats() {
  const isAuthenticated = useIsAuthenticated()
  const location = useLocation()
  // Track hydration state to prevent premature queries
  const [isHydrated, setIsHydrated] = useState(false)

  // Don't fetch on login page
  const isLoginPage = location.pathname === '/login'

  useEffect(() => {
    // Small delay to ensure Jotai has hydrated from localStorage
    const timer = setTimeout(() => setIsHydrated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Only enable query when:
  // 1. NOT on login page AND
  // 2. Hydration is complete AND
  // 3. Either Jotai says we're authenticated OR localStorage has auth data
  const shouldFetch =
    !isLoginPage && isHydrated && (isAuthenticated || hasStoredAuth())

  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: getDashboardStats,
    enabled: shouldFetch,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: shouldFetch ? 60 * 1000 : false, // Only refetch when authenticated
  })
}
