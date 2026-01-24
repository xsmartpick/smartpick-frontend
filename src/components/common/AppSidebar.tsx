import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Database,
  FolderKanban,
  FolderOpen,
  Home,
  Languages,
  Moon,
  MoreHorizontal,
  PenTool,
  Sun,
  Tag,
  User,
} from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useUserValue } from '~/atoms/auth'
import { useReadonlyRouteSelector } from '~/atoms/route'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import {
  useIsDark,
  useSetTheme,
  useThemeAtomValue,
} from '~/hooks/common/useDark'
import { useMobile } from '~/hooks/common/useMobile'
import { cn } from '~/lib/cn'
import { isAdmin } from '~/lib/rbac'
import { Spring } from '~/lib/spring'

import { UserInfo } from './UserInfo'

interface NavItem {
  id: string
  label: string
  icon: ReactNode
  href: string
  description?: string
  badge?: string | number
  adminOnly?: boolean
}

interface AppSidebarProps {
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

export function AppSidebar({
  collapsed = false,
  onCollapsedChange,
}: AppSidebarProps) {
  const pathname = useReadonlyRouteSelector((r) => r.location.pathname)
  const user = useUserValue()
  const isMobile = useMobile()
  const isDark = useIsDark()
  const theme = useThemeAtomValue()
  const setTheme = useSetTheme()
  const { i18n } = useTranslation()
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const manualToggleRef = useRef(false)
  const isUserAdmin = isAdmin(user)

  // Navigation items - labeler focused
  const navItems: NavItem[] = [
    {
      id: 'home',
      label: i18n.t('navigation.home.label'),
      icon: <Home className="h-5 w-5" />,
      href: '/',
      description: i18n.t('navigation.home.description'),
    },
    {
      id: 'projects',
      label: i18n.t('navigation.projects.label'),
      icon: <FolderKanban className="h-5 w-5" />,
      href: '/projects',
      description: i18n.t('navigation.projects.description'),
      adminOnly: true,
    },
    {
      id: 'batches',
      label: i18n.t('navigation.batches.label'),
      icon: <FolderOpen className="h-5 w-5" />,
      href: '/batches',
      description: i18n.t('navigation.batches.description'),
      adminOnly: true,
    },
    {
      id: 'admin-tasks',
      label: i18n.t('navigation.adminTasks.label'),
      icon: <ClipboardList className="h-5 w-5" />,
      href: '/admintasks',
      description: i18n.t('navigation.adminTasks.description'),
      adminOnly: true,
    },
    {
      id: 'label',
      label: i18n.t('navigation.label.label'),
      icon: <PenTool className="h-5 w-5" />,
      href: '/label',
      description: i18n.t('navigation.label.description'),
    },
    {
      id: 'datasets',
      label: i18n.t('navigation.datasets.label'),
      icon: <Database className="h-5 w-5" />,
      href: '/datasets',
      description: i18n.t('navigation.datasets.description'),
      adminOnly: true,
    },
    {
      id: 'label-sets',
      label: i18n.t('navigation.labelSets.label'),
      icon: <Tag className="h-5 w-5" />,
      href: '/label-sets',
      description: i18n.t('navigation.labelSets.description'),
      adminOnly: true,
    },
  ]
  const visibleNavItems = navItems.filter(
    (item) => !item.adminOnly || isUserAdmin,
  )

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    // Exact match or starts with href followed by a slash
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  // Auto-switch to More page if active route is in overflow items (mobile only)
  // But respect manual user toggles
  useEffect(() => {
    if (isMobile && !manualToggleRef.current) {
      const MAX_MOBILE_VISIBLE = 4
      const overflowItems = visibleNavItems.slice(MAX_MOBILE_VISIBLE)
      const isActiveInOverflow = overflowItems.some((item) =>
        isActive(item.href),
      )

      // This is a legitimate case of syncing URL state with UI state
      // We need to update the menu visibility based on the current route

      setShowMoreMenu((current) => {
        if (isActiveInOverflow && !current) return true
        if (!isActiveInOverflow && current) return false
        return current
      })
    }
    // isActive is stable (defined above), so we can safely disable the exhaustive-deps warning
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, isMobile, visibleNavItems])

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme(isDark ? 'light' : 'dark')
    } else if (theme === 'dark') {
      setTheme('light')
    } else {
      setTheme('dark')
    }
  }

  const toggleLanguage = () => {
    const currentLang = i18n.language
    const newLang = currentLang.startsWith('vi') ? 'en' : 'vi'
    i18n.changeLanguage(newLang)
  }

  // Mobile bottom navigation
  if (isMobile) {
    const MAX_MOBILE_VISIBLE = 4
    const visibleItems = visibleNavItems.slice(0, MAX_MOBILE_VISIBLE)
    const overflowItems = visibleNavItems.slice(MAX_MOBILE_VISIBLE)

    return (
      <>
        <m.nav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={Spring.presets.smooth}
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl overflow-hidden"
        >
          <AnimatePresence mode="wait" initial={false}>
            {!showMoreMenu ? (
              <m.div
                key="main-nav"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={Spring.presets.smooth}
                className="flex items-center justify-around px-2 py-2"
              >
                {visibleItems.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      onClick={() => {
                        manualToggleRef.current = false
                      }}
                      className={cn(
                        'relative flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-colors',
                        active
                          ? 'text-accent'
                          : 'text-text-secondary hover:text-text',
                      )}
                    >
                      {active && (
                        <m.div
                          layoutId="mobile-nav-indicator"
                          className="absolute inset-0 rounded-xl bg-accent/10"
                          transition={Spring.presets.bouncy}
                        />
                      )}
                      <span className="relative">{item.icon}</span>
                      <span className="relative text-[10px] font-medium">
                        {item.label}
                      </span>
                    </Link>
                  )
                })}

                {/* More button */}
                {overflowItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      manualToggleRef.current = true
                      setShowMoreMenu(true)
                    }}
                    className="relative flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-text-secondary transition-colors hover:text-text"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                    <span className="text-[10px] font-medium">
                      {i18n.t('navigation.more')}
                    </span>
                  </button>
                )}
              </m.div>
            ) : (
              <m.div
                key="more-nav"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                transition={Spring.presets.smooth}
                className="flex items-center justify-around px-2 py-2"
              >
                {/* Back button */}
                <button
                  type="button"
                  onClick={() => {
                    manualToggleRef.current = true
                    setShowMoreMenu(false)
                  }}
                  className="relative flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-text-secondary transition-colors hover:text-text"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="text-[10px] font-medium">
                    {i18n.t('navigation.back')}
                  </span>
                </button>

                {/* Overflow items */}
                {overflowItems.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      className={cn(
                        'relative flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-colors',
                        active
                          ? 'text-accent'
                          : 'text-text-secondary hover:text-text',
                      )}
                    >
                      {active && (
                        <m.div
                          layoutId="mobile-nav-indicator"
                          className="absolute inset-0 rounded-xl bg-accent/10"
                          transition={Spring.presets.bouncy}
                        />
                      )}
                      <span className="relative">{item.icon}</span>
                      <span className="relative text-[10px] font-medium">
                        {item.label}
                      </span>
                    </Link>
                  )
                })}

                {/* Profile button */}
                <button
                  type="button"
                  onClick={() => setShowProfileModal(true)}
                  className="relative flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-text-secondary transition-colors hover:text-text"
                >
                  <User className="h-5 w-5" />
                  <span className="text-[10px] font-medium">
                    {i18n.t('navigation.profile')}
                  </span>
                </button>
              </m.div>
            )}
          </AnimatePresence>
        </m.nav>

        {/* Profile Modal */}
        <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
          <DialogContent className="max-w-sm" from="bottom">
            <DialogHeader>
              <DialogTitle>{i18n.t('profile.title')}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* User Info */}
              <div className="flex items-center gap-3 rounded-xl bg-fill/50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-background text-sm font-semibold">
                  {(user?.fullName ?? user?.username)
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-text truncate">
                    {user?.fullName ?? user?.username ?? 'User'}
                  </div>
                  <div className="text-sm text-text-secondary truncate">
                    {user?.email || 'user@example.com'}
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-2">
                {/* Theme Toggle */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-fill"
                >
                  <span className="shrink-0">
                    {isDark ? (
                      <Moon className="h-5 w-5" />
                    ) : (
                      <Sun className="h-5 w-5" />
                    )}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-text">
                      {i18n.t('profile.theme.title')}
                    </div>
                    <div className="text-xs text-text-tertiary">
                      {isDark
                        ? i18n.t('profile.theme.dark')
                        : i18n.t('profile.theme.light')}
                    </div>
                  </div>
                </button>

                {/* Language Toggle */}
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-fill"
                >
                  <span className="shrink-0">
                    <Languages className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-text">
                      Language
                    </div>
                    <div className="text-xs text-text-tertiary">
                      {i18n.language.startsWith('vi')
                        ? 'Tiếng Việt'
                        : 'English'}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Desktop sidebar
  return (
    <m.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={Spring.presets.smooth}
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-background transition-[width] duration-300 ease-out',
        collapsed ? 'w-[72px]' : 'w-64',
      )}
    >
      {/* Logo/Brand */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <Link to="/" className="flex items-center gap-3">
          <m.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent/70 shadow-lg shadow-accent/20"
          >
            <svg
              className="h-6 w-6 text-background"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </m.div>
          <AnimatePresence>
            {!collapsed && (
              <m.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={Spring.presets.smooth}
              >
                <div className="text-lg font-bold tracking-tight text-text">
                  SmartPick
                </div>
                <div className="text-[10px] font-medium uppercase tracking-widest text-text-tertiary">
                  Labeling
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </Link>

        <button
          type="button"
          onClick={() => onCollapsedChange?.(!collapsed)}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-fill hover:text-text',
            collapsed && 'mx-auto',
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {visibleNavItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.id}
                to={item.href}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all',
                  active
                    ? 'bg-accent/10 text-accent'
                    : 'text-text-secondary hover:bg-fill hover:text-text',
                  collapsed && 'justify-center px-2',
                )}
              >
                {active && (
                  <m.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-accent"
                    transition={Spring.presets.bouncy}
                  />
                )}
                <span
                  className={cn(
                    'shrink-0 transition-transform duration-200',
                    !collapsed && 'group-hover:scale-110',
                  )}
                >
                  {item.icon}
                </span>
                <AnimatePresence>
                  {!collapsed && (
                    <m.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={Spring.presets.smooth}
                      className="flex flex-1 items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-medium">{item.label}</div>
                        {item.description && (
                          <div className="text-xs text-text-tertiary">
                            {item.description}
                          </div>
                        )}
                      </div>
                      {item.badge && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-semibold text-background">
                          {item.badge}
                        </span>
                      )}
                    </m.div>
                  )}
                </AnimatePresence>

                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="pointer-events-none absolute left-full ml-2 hidden rounded-lg bg-background px-3 py-2 text-sm font-medium text-text shadow-lg ring-1 ring-border group-hover:block">
                    {item.label}
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border p-3">
        {/* Language toggle */}
        <button
          type="button"
          onClick={toggleLanguage}
          className={cn(
            'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-text-secondary transition-colors hover:bg-fill hover:text-text',
            collapsed && 'justify-center px-2',
          )}
        >
          <m.span
            key={i18n.language}
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={Spring.presets.bouncy}
            className="shrink-0"
          >
            <Languages className="h-5 w-5" />
          </m.span>
          <AnimatePresence>
            {!collapsed && (
              <m.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={Spring.presets.smooth}
                className="text-sm font-medium"
              >
                {i18n.language.startsWith('vi') ? 'Tiếng Việt' : 'English'}
              </m.span>
            )}
          </AnimatePresence>
        </button>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className={cn(
            'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-text-secondary transition-colors hover:bg-fill hover:text-text',
            collapsed && 'justify-center px-2',
          )}
        >
          <m.span
            key={isDark ? 'moon' : 'sun'}
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={Spring.presets.bouncy}
            className="shrink-0"
          >
            {isDark ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </m.span>
          <AnimatePresence>
            {!collapsed && (
              <m.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={Spring.presets.smooth}
                className="text-sm font-medium"
              >
                {isDark ? 'Dark mode' : 'Light mode'}
              </m.span>
            )}
          </AnimatePresence>
        </button>

        {/* User info */}
        <div
          className={cn(
            'mt-2 flex items-center gap-3 rounded-xl bg-fill/50 p-2',
            collapsed && 'justify-center',
          )}
        >
          {collapsed ? (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-background text-xs font-semibold">
              {(user?.fullName ?? user?.username)
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2) ?? '?'}
            </div>
          ) : (
            <UserInfo />
          )}
        </div>
      </div>
    </m.aside>
  )
}
