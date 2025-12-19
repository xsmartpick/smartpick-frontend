import * as React from 'react'


export interface SectionTitleProps {
  icon?: React.ReactNode
  title: string
  subtitle?: string
  right?: React.ReactNode
}

export function SectionTitle({
  icon,
  title,
  subtitle,
  right,
}: SectionTitleProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        {icon ? (
          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl border border-border bg-background shadow-sm">
            {icon}
          </div>
        ) : null}
        <div>
          <div className="text-lg font-semibold tracking-tight text-text">
            {title}
          </div>
          {subtitle ? (
            <div className="text-sm text-text-secondary">{subtitle}</div>
          ) : null}
        </div>
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  )
}
