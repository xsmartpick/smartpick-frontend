import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FolderOpen,
  ImageIcon,
  Layers,
  PenTool,
  TrendingUp,
} from 'lucide-react'
import { m } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useUserValue } from '~/atoms/auth'
import { LoadingState } from '~/components/common'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/cn'
import { relativeTime } from '~/lib/date-utils'
import { Spring } from '~/lib/spring'
import type { ActivityItem } from '~/modules/dashboard'
import { useDashboardStats } from '~/modules/dashboard'

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

const QuickActionCard = ({
  icon,
  title,
  description,
  href,
  variant = 'default',
  delay,
}: {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  variant?: 'default' | 'primary'
  delay: number
}) => {
  const { t } = useTranslation()

  return (
    <StaggerItem delay={delay}>
      <Link
        to={href}
        className={cn(
          'group relative flex flex-col overflow-hidden rounded-2xl border p-5 transition-all duration-300',
          variant === 'primary'
            ? 'border-accent/30 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10'
            : 'border-border bg-background hover:border-border hover:bg-fill/50 hover:shadow-md',
        )}
      >
        <div
          className={cn(
            'mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110',
            variant === 'primary'
              ? 'bg-accent text-background shadow-lg shadow-accent/20'
              : 'bg-fill text-text-secondary',
          )}
        >
          {icon}
        </div>
        <h3
          className={cn(
            'text-base font-semibold',
            variant === 'primary' ? 'text-accent' : 'text-text',
          )}
        >
          {title}
        </h3>
        <p className="mt-1 text-sm text-text-secondary">{description}</p>
        <div
          className={cn(
            'mt-4 flex items-center gap-1 text-sm font-medium transition-all duration-300',
            variant === 'primary'
              ? 'text-accent'
              : 'text-text-tertiary group-hover:text-text',
          )}
        >
          <span>{t('common.getStarted')}</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </Link>
    </StaggerItem>
  )
}

const StatCard = ({
  icon,
  label,
  value,
  trend,
  delay,
  isLoading,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  trend?: { value: string; positive: boolean }
  delay: number
  isLoading?: boolean
}) => (
  <StaggerItem delay={delay}>
    <div className="rounded-2xl border border-border bg-background p-5">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fill text-text-secondary">
          {icon}
        </div>
        {trend && (
          <span
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              trend.positive ? 'bg-green/10 text-green' : 'bg-red/10 text-red',
            )}
          >
            <TrendingUp
              className={cn('h-3 w-3', !trend.positive && 'rotate-180')}
            />
            {trend.value}
          </span>
        )}
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

function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds.toFixed(0)}s`
}

function getActivityStatus(action: string) {
  if (action.includes('Completed')) {
    return 'completed'
  }
  if (action.includes('progress') || action.includes('Processing')) {
    return 'inProgress'
  }
  return null
}

function getActivityIcon(status: string | null) {
  if (status === 'completed') {
    return <CheckCircle2 className="h-5 w-5" />
  }
  if (status === 'inProgress') {
    return <Clock className="h-5 w-5" />
  }
  return <Layers className="h-5 w-5" />
}

function getActivityColor(status: string | null) {
  if (status === 'completed') {
    return 'bg-green/10 text-green'
  }
  if (status === 'inProgress') {
    return 'bg-yellow/10 text-yellow'
  }
  return 'bg-accent/10 text-accent'
}

export const Component = () => {
  const user = useUserValue()
  const { t } = useTranslation()
  const { data, isLoading } = useDashboardStats()

  const stats = data?.stats
  const recentActivity = data?.recentActivity ?? []

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return t('common.greeting.morning')
    if (hour < 18) return t('common.greeting.afternoon')
    return t('common.greeting.evening')
  }

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Header */}
        <StaggerItem delay={0}>
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-normal text-text">
              {getGreeting()},{' '}
              {(user?.fullName ?? user?.username)?.split(' ')[0] ??
                t('common.defaultName')}
            </h1>
            <p className="mt-2 text-text-secondary">
              {t('dashboard.welcomeSubtitle')}
            </p>
          </div>
        </StaggerItem>

        {/* Stats Grid */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            label={t('dashboard.stats.labeledToday')}
            value={formatNumber(stats?.labeledToday ?? 0)}
            delay={0.05}
            isLoading={isLoading}
          />
          <StatCard
            icon={<PenTool className="h-5 w-5" />}
            label={t('dashboard.stats.totalLabeled')}
            value={formatNumber(stats?.totalLabeled ?? 0)}
            delay={0.1}
            isLoading={isLoading}
          />
          <StatCard
            icon={<ImageIcon className="h-5 w-5" />}
            label={t('dashboard.stats.totalSegments')}
            value={formatNumber(stats?.totalSegments ?? 0)}
            delay={0.15}
            isLoading={isLoading}
          />
          <StatCard
            icon={<FolderOpen className="h-5 w-5" />}
            label={t('dashboard.stats.pendingBatches')}
            value={stats?.pendingBatches ?? 0}
            delay={0.2}
            isLoading={isLoading}
          />
        </div>

        {/* Secondary Stats */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={<Layers className="h-5 w-5" />}
            label={t('dashboard.stats.totalBatches')}
            value={stats?.totalBatches ?? 0}
            delay={0.25}
            isLoading={isLoading}
          />
          <StatCard
            icon={<ImageIcon className="h-5 w-5" />}
            label={t('dashboard.stats.totalImages')}
            value={formatNumber(stats?.totalImages ?? 0)}
            delay={0.3}
            isLoading={isLoading}
          />
          <StatCard
            icon={<Clock className="h-5 w-5" />}
            label={t('dashboard.stats.avgTime')}
            value={formatTime(stats?.avgTimeSeconds ?? 0)}
            delay={0.35}
            isLoading={isLoading}
          />
        </div>

        {/* Quick Actions */}
        <StaggerItem delay={0.4}>
          <h2 className="mb-4 text-lg font-semibold text-text">
            {t('dashboard.quickActions.title')}
          </h2>
        </StaggerItem>
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QuickActionCard
            icon={<PenTool className="h-6 w-6" />}
            title={t('dashboard.quickActions.startLabeling.title')}
            description={t('dashboard.quickActions.startLabeling.description')}
            href="/label"
            variant="primary"
            delay={0.45}
          />
          <QuickActionCard
            icon={<FolderOpen className="h-5 w-5" />}
            title={t('dashboard.quickActions.browseBatches.title')}
            description={t('dashboard.quickActions.browseBatches.description')}
            href="/batches"
            delay={0.5}
          />
          <QuickActionCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            title={t('dashboard.quickActions.reviewLabels.title')}
            description={t('dashboard.quickActions.reviewLabels.description')}
            href="/batches"
            delay={0.55}
          />
        </div>

        {/* Recent Activity */}
        <StaggerItem delay={0.6}>
          <div className="rounded-2xl border border-border bg-background p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text">
                {t('dashboard.recentActivity.title')}
              </h2>
              <Link
                to="/batches"
                className="text-sm font-medium text-accent hover:underline"
              >
                {t('common.seeAll')}
              </Link>
            </div>
            {isLoading ? (
              <LoadingState message={t('dashboard.recentActivity.loading')} />
            ) : recentActivity.length === 0 ? (
              <div className="py-8 text-center text-text-secondary">
                <Layers className="mx-auto mb-3 h-12 w-12 text-text-tertiary" />
                <p>{t('dashboard.recentActivity.empty')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity: ActivityItem, i: number) => {
                  const status = getActivityStatus(activity.action)
                  const statusLabel = status
                    ? t(`dashboard.recentActivity.status.${status}`)
                    : activity.action

                  return (
                    <m.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        ...Spring.presets.smooth,
                        delay: 0.65 + i * 0.05,
                      }}
                      className="flex items-center justify-between rounded-xl bg-fill/50 p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-full',
                            getActivityColor(status),
                          )}
                        >
                          {getActivityIcon(status)}
                        </div>
                        <div>
                          <div className="font-medium text-text">
                            {activity.batchName}
                          </div>
                          <div className="text-sm text-text-secondary">
                            {statusLabel} •{' '}
                            {t('common.images', { count: activity.count })}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-text-tertiary">
                        {relativeTime(activity.timestamp, t)}
                      </div>
                    </m.div>
                  )
                })}
              </div>
            )}
          </div>
        </StaggerItem>

        {/* CTA Section */}
        <StaggerItem delay={0.8}>
          <div className="mt-8 overflow-hidden rounded-2xl bg-gradient-to-br from-accent/20 via-accent/10 to-transparent p-8">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h3 className="text-xl font-bold text-text">
                  {t('dashboard.cta.title')}
                </h3>
                <p className="mt-1 text-text-secondary">
                  {t('dashboard.cta.description', {
                    count: stats?.pendingBatches ?? 0,
                  })}
                </p>
              </div>
              <Button variant="primary" asChild>
                <Link to="/label" className="flex items-center gap-2">
                  <PenTool className="h-4 w-4" />
                  {t('dashboard.cta.button')}
                </Link>
              </Button>
            </div>
          </div>
        </StaggerItem>
      </div>
    </div>
  )
}
