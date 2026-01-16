import { m } from 'motion/react'
import { useState } from 'react'
import { Outlet } from 'react-router'
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
  const isAuthenticated = useAtomValue(isAuthenticatedAtom)

  // Don't show sidebar if not authenticated (e.g., on login page)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    )
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
