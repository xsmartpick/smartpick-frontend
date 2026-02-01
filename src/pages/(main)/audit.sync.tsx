/**
 * Audit Logs Page
 * Admin dashboard for viewing system audit logs
 */

import { Activity, Clock, Shield, Users } from 'lucide-react'
import { m } from 'motion/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Spring } from '~/lib/spring'
import type {AuditFilters} from '~/modules/audit';
import {
  AuditActivityChart,
  AuditFilterBar,
  AuditLogTable,
  useAuditStats
} from '~/modules/audit'

const StaggerItem = ({
  children,
  delay,
  className,
}: {
  children: React.ReactNode
  delay: number
  className?: string
}) => (
  <m.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ ...Spring.presets.smooth, delay }}
    className={className}
  >
    {children}
  </m.div>
)

const StatCard = ({
  icon,
  label,
  value,
  delay,
  isLoading,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  delay: number
  isLoading?: boolean
}) => (
  <StaggerItem delay={delay}>
    <div className="rounded-2xl border border-border bg-background p-5">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fill text-text-secondary">
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold tabular-nums text-text">
          {isLoading ? (
            <span className="inline-block h-7 w-16 animate-pulse rounded bg-fill" />
          ) : (
            value
          )}
        </div>
        <div className="mt-0.5 text-sm text-text-secondary">{label}</div>
      </div>
    </div>
  </StaggerItem>
)

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toLocaleString()
}

export const Component = () => {
  const { t } = useTranslation()
  const [filters, setFilters] = useState<AuditFilters>({})
  const { data: statsData, isLoading: statsLoading } = useAuditStats()

  const stats = statsData?.stats

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <StaggerItem delay={0}>
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-normal text-text">
                  {t('audit.title', 'Audit Logs')}
                </h1>
                <p className="mt-1 text-text-secondary">
                  {t('audit.subtitle', 'Monitor and review system activity')}
                </p>
              </div>
            </div>
          </div>
        </StaggerItem>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Activity className="h-5 w-5" />}
            label={t('audit.stats.totalActions', 'Total Actions (30d)')}
            value={formatNumber(stats?.totalActions ?? 0)}
            delay={0.05}
            isLoading={statsLoading}
          />
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label={t('audit.stats.activeUsers', 'Active Users (7d)')}
            value={stats?.activeUsers ?? 0}
            delay={0.1}
            isLoading={statsLoading}
          />
          <StatCard
            icon={<Clock className="h-5 w-5" />}
            label={t('audit.stats.actionsToday', 'Actions Today')}
            value={formatNumber(stats?.actionsToday ?? 0)}
            delay={0.15}
            isLoading={statsLoading}
          />
          <StatCard
            icon={<Shield className="h-5 w-5" />}
            label={t('audit.stats.criticalActions', 'Critical Actions (7d)')}
            value={stats?.criticalActions ?? 0}
            delay={0.2}
            isLoading={statsLoading}
          />
        </div>

        {/* Activity Chart */}
        <StaggerItem delay={0.25}>
          <div className="mb-8 rounded-2xl border border-border bg-background p-6">
            <AuditActivityChart filters={filters} />
          </div>
        </StaggerItem>

        {/* Filter Bar */}
        <StaggerItem delay={0.3}>
          <div className="mb-6">
            <AuditFilterBar onFiltersChange={setFilters} />
          </div>
        </StaggerItem>

        {/* Audit Log Table */}
        <StaggerItem delay={0.35}>
          <div className="rounded-2xl border border-border bg-background p-6">
            <AuditLogTable filters={filters} />
          </div>
        </StaggerItem>
      </div>
    </div>
  )
}
