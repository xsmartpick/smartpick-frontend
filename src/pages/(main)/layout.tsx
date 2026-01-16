import { useAtomValue } from 'jotai'
import { m } from 'motion/react'
import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'

import { isAuthenticatedAtom } from '~/atoms/auth'
import { AppSidebar } from '~/components/common/AppSidebar'
import { useMobile } from '~/hooks/common/useMobile'
import { cn } from '~/lib/cn'
import { Spring } from '~/lib/spring'
import { useAtomValue } from 'jotai'
import { isAuthenticatedAtom } from '~/atoms/auth'
/**
 * Main layout with sidebar navigation
 * Wraps all pages in the (main) route group
 */
export const Component = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const isMobile = useMobile()
  const location = useLocation()
  const navigate = useNavigate()
  const isAuthenticated = useAtomValue(isAuthenticatedAtom)

  const isLoginPage = location.pathname === '/login'

  // Handle authentication redirects
  useEffect(() => {
    if (isAuthenticated && isLoginPage) {
      // Redirect authenticated users away from login page
      navigate('/', { replace: true })
    } else if (!isAuthenticated && !isLoginPage) {
      // Redirect unauthenticated users to login
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, isLoginPage, navigate])
  
  // Login page has its own full layout, no sidebar needed
  if (isLoginPage) {
    return <Outlet />
  }
  
  // Don't render protected content while redirecting
  if (!isAuthenticated) {
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
