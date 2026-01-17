import { useAtomValue } from 'jotai'
import { m } from 'motion/react'
import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'

import { isAuthenticatedAtom } from '~/atoms/auth'
import { AppSidebar } from '~/components/common/AppSidebar'
import { useMobile } from '~/hooks/common/useMobile'
import { cn } from '~/lib/cn'
import { Spring } from '~/lib/spring'

/**
 * Check if localStorage has auth data (synchronous check to avoid flash)
 * This handles the hydration delay from atomWithStorage
 */
function hasStoredAuth(): boolean {
  try {
    const token = localStorage.getItem('smartpick_token')
    const user = localStorage.getItem('smartpick_user')
    // Check if both exist and are not 'null' (JSON string)
    return !!token && token !== 'null' && !!user && user !== 'null'
  } catch {
    return false
  }
}

/**
 * Main layout with sidebar navigation
 * Wraps all pages in the (main) route group
 */
export const Component = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  // Track if we've finished checking auth state (to avoid flash redirects)
  const [isHydrated, setIsHydrated] = useState(false)
  const isMobile = useMobile()
  const location = useLocation()
  const navigate = useNavigate()
  const isAuthenticated = useAtomValue(isAuthenticatedAtom)

  const isLoginPage = location.pathname === '/login'

  // Check hydration state on mount
  useEffect(() => {
    // Small delay to allow atomWithStorage to hydrate
    const timer = setTimeout(() => setIsHydrated(true), 50)
    return () => clearTimeout(timer)
  }, [])

  // Handle authentication redirects (only after hydration)
  useEffect(() => {
    if (!isHydrated) return

    // Double-check with localStorage for extra safety
    const hasAuth = hasStoredAuth()
    const actuallyAuthenticated = isAuthenticated || hasAuth

    if (actuallyAuthenticated && isLoginPage) {
      // Redirect authenticated users away from login page
      navigate('/', { replace: true })
    } else if (!actuallyAuthenticated && !isLoginPage) {
      // Redirect unauthenticated users to login
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, isLoginPage, navigate, isHydrated])

  // Login page has its own full layout, no sidebar needed
  if (isLoginPage) {
    return <Outlet />
  }

  // Show nothing while hydrating (to avoid flash)
  if (!isHydrated) {
    return null
  }

  // Don't render protected content while redirecting
  if (!isAuthenticated && !hasStoredAuth()) {
    return null
  }
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main content area */}
      <m.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={Spring.presets.smooth}
        className={cn(
          'min-h-screen transition-[margin] duration-300 ease-out',
          isMobile
            ? 'pb-20' // Space for mobile bottom nav
            : sidebarCollapsed
              ? 'ml-[72px]'
              : 'ml-64',
        )}
      >
        <Outlet />
      </m.main>
    </div>
  )
}
