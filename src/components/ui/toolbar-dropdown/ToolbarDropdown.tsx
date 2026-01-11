import { ChevronDown } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import * as React from 'react'
import { useState } from 'react'

import { useClickOutside } from '~/hooks/common'
import { clsxm } from '~/lib/cn'
import { Spring } from '~/lib/spring'

export interface ToolbarDropdownProps {
  label: React.ReactNode
  children: React.ReactNode
  align?: 'left' | 'right'
  badge?: number
  showChevron?: boolean
}

export function ToolbarDropdown({
  label,
  children,
  align = 'right',
  badge,
  showChevron = true,
}: ToolbarDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useClickOutside<HTMLDivElement>(open, () => setOpen(false))

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className={clsxm(
          'inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm',
          'hover:bg-fill focus:outline-none focus:ring-2 focus:ring-primary/20',
          badge && 'pr-2',
        )}
        aria-haspopup="menu"
        aria-expanded={open}
        type="button"
      >
        {label}
        {badge ? (
          <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-semibold text-background">
            {badge}
          </span>
        ) : null}
        {showChevron && <ChevronDown className="h-4 w-4 text-text-tertiary" />}
      </button>

      <AnimatePresence>
        {open ? (
          <m.div
            role="menu"
            initial={{ opacity: 0, y: 6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.99 }}
            transition={Spring.presets.smooth}
            className={clsxm(
              'absolute z-20 mt-2 min-w-[220px] overflow-hidden rounded-2xl border border-border bg-background shadow-xl',
              align === 'right' ? 'right-0' : 'left-0',
            )}
          >
            <div className="p-1" onClick={() => setOpen(false)}>
              {children}
            </div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export interface ToolbarMenuItemProps {
  icon?: React.ReactNode
  label: string
  danger?: boolean
  onClick: () => void
}

export function ToolbarMenuItem({
  icon,
  label,
  danger,
  onClick,
}: ToolbarMenuItemProps) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={clsxm(
        'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition',
        danger ? 'text-red-700 hover:bg-red-50' : 'text-text hover:bg-fill',
      )}
      type="button"
    >
      {icon ? (
        <span
          className={clsxm(
            'h-4 w-4',
            danger ? 'text-red-700' : 'text-text-secondary',
          )}
        >
          {icon}
        </span>
      ) : null}
      <span className="flex-1">{label}</span>
    </button>
  )
}

export interface ToolbarCheckboxMenuItemProps {
  label: string
  checked: boolean
  count?: number
  onChange: (checked: boolean) => void
}

export function ToolbarCheckboxMenuItem({
  label,
  checked,
  count,
  onChange,
}: ToolbarCheckboxMenuItemProps) {
  return (
    <button
      role="menuitemcheckbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={clsxm(
        'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition',
        'text-text hover:bg-fill',
      )}
      type="button"
    >
      <span className="h-4 w-4">
        {checked ? (
          <svg
            className="h-4 w-4 text-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : null}
      </span>
      <span className="flex-1">{label}</span>
      {count !== undefined && (
        <span className="text-xs text-text-tertiary tabular-nums">
          ({count})
        </span>
      )}
    </button>
  )
}

export function ToolbarMenuDivider() {
  return <div className="my-1 border-t border-border" />
}

export function ToolbarMenuLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2 pb-2 pt-1 text-xs font-semibold text-text-tertiary">
      {children}
    </div>
  )
}
