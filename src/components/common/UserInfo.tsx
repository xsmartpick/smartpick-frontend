import { ChevronDown, LogOut, Pencil } from 'lucide-react'
import { m } from 'motion/react'

import { useUserValue } from '~/atoms/auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu/DropdownMenu'
import { clsxm } from '~/lib/cn'
import { Spring } from '~/lib/spring'
import { useAuth } from '~/modules/auth/hooks/useAuth'

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon?: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={clsxm(
        'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200',
        'hover:bg-fill focus:bg-fill active:bg-fill-secondary',
        danger ? 'text-red hover:text-red focus:text-red' : 'text-text',
      )}
      type="button"
    >
      {icon ? (
        <span
          className={clsxm(
            'h-4 w-4 shrink-0 transition-transform duration-200',
            danger
              ? 'text-red group-hover:text-red'
              : 'text-text-secondary group-hover:translate-x-0.5',
          )}
        >
          {icon}
        </span>
      ) : null}
      <span className="flex-1">{label}</span>
      {!danger && (
        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-accent opacity-0 transition-all duration-200 group-hover:opacity-100" />
      )}
    </button>
  )
}

export function UserInfo() {
  const user = useUserValue()
  const { logout } = useAuth()

  if (!user) {
    return null
  }

  const displayName = user.fullName ?? user.username

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <m.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={Spring.presets.smooth}
          className="flex items-center gap-2 rounded-full px-2 py-2 transition-colors hover:bg-fill focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <span className="sr-only">Open user menu</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-background text-xs font-semibold">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={displayName}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              getInitials(displayName)
            )}
          </div>
          <div className="hidden items-center gap-1.5 text-left sm:flex">
            <div className="max-w-[140px]">
              <div className="truncate text-sm font-semibold leading-none text-text">
                {displayName}
              </div>
              <div className="mt-0.5 truncate text-xs leading-none text-text-secondary">
                {user.email}
              </div>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 text-text-tertiary" />
          </div>
        </m.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-72 rounded-2xl border-border bg-background p-0 shadow-xl backdrop-blur-sm"
      >
        <div className="px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-text">
                {displayName}
              </div>
              <div className="truncate text-xs text-text-secondary mt-0.5">
                {user.email}
              </div>
            </div>
            <div className="shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-background text-sm font-semibold shadow-md ring-2 ring-accent/20">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={displayName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(displayName)
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-border mx-4" />

        <div className="p-2">
          <MenuItem
            icon={<Pencil className="h-4 w-4" />}
            label="Edit profile"
            onClick={() => {
              // TODO: Implement edit profile
            }}
          />
          <MenuItem
            icon={<LogOut className="h-4 w-4" />}
            label="Sign out"
            onClick={logout}
            danger
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
