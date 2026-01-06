import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FolderOpen,
  PenTool,
  TrendingUp,
} from 'lucide-react'
import { m } from 'motion/react'
import { Link } from 'react-router'

import { useUserValue } from '~/atoms/user'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/cn'
import { Spring } from '~/lib/spring'

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
}) => (
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
        <span>Get started</span>
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </div>
    </Link>
  </StaggerItem>
)

const StatCard = ({
  icon,
  label,
  value,
  trend,
  delay,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  trend?: { value: string; positive: boolean }
  delay: number
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
        <div className="text-2xl font-bold tabular-nums text-text">{value}</div>
        <div className="mt-0.5 text-sm text-text-secondary">{label}</div>
      </div>
    </div>
  </StaggerItem>
)

export const Component = () => {
  const user = useUserValue()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Header */}
        <StaggerItem delay={0}>
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-text">
              {getGreeting()}, {user?.name?.split(' ')[0] ?? 'there'}
            </h1>
            <p className="mt-2 text-text-secondary">
              Here&apos;s your labeling activity overview. Keep up the great
              work!
            </p>
          </div>
        </StaggerItem>

        {/* Stats Grid */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Labeled today"
            value={47}
            trend={{ value: '+12%', positive: true }}
            delay={0.05}
          />
          <StatCard
            icon={<PenTool className="h-5 w-5" />}
            label="Total labeled"
            value="1,247"
            delay={0.1}
          />
          <StatCard
            icon={<Clock className="h-5 w-5" />}
            label="Avg. time/image"
            value="2.4s"
            trend={{ value: '-8%', positive: true }}
            delay={0.15}
          />
          <StatCard
            icon={<FolderOpen className="h-5 w-5" />}
            label="Pending batches"
            value={3}
            delay={0.2}
          />
        </div>

        {/* Quick Actions */}
        <StaggerItem delay={0.25}>
          <h2 className="mb-4 text-lg font-semibold text-text">
            Quick Actions
          </h2>
        </StaggerItem>
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QuickActionCard
            icon={<PenTool className="h-6 w-6" />}
            title="Start Labeling"
            description="Continue where you left off or start a new batch"
            href="/label"
            variant="primary"
            delay={0.3}
          />
          <QuickActionCard
            icon={<FolderOpen className="h-5 w-5" />}
            title="Browse Batches"
            description="View and manage your assigned image batches"
            href="/batches"
            delay={0.35}
          />
          <QuickActionCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            title="Review Labels"
            description="Check your recent labeling work and accuracy"
            href="/batches"
            delay={0.4}
          />
        </div>

        {/* Recent Activity */}
        <StaggerItem delay={0.45}>
          <div className="rounded-2xl border border-border bg-background p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text">
                Recent Activity
              </h2>
              <Link
                to="/batches"
                className="text-sm font-medium text-accent hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {[
                {
                  batch: 'Batch #1042 - Cashew Grade W240',
                  action: 'Completed labeling',
                  time: '2 hours ago',
                  count: 48,
                },
                {
                  batch: 'Batch #1041 - Quality Check',
                  action: 'In progress',
                  time: '4 hours ago',
                  count: 32,
                },
                {
                  batch: 'Batch #1039 - Grade W320',
                  action: 'Completed labeling',
                  time: 'Yesterday',
                  count: 64,
                },
              ].map((activity, i) => (
                <m.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    ...Spring.presets.smooth,
                    delay: 0.5 + i * 0.05,
                  }}
                  className="flex items-center justify-between rounded-xl bg-fill/50 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full',
                        activity.action === 'In progress'
                          ? 'bg-yellow/10 text-yellow'
                          : 'bg-green/10 text-green',
                      )}
                    >
                      {activity.action === 'In progress' ? (
                        <Clock className="h-5 w-5" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-text">
                        {activity.batch}
                      </div>
                      <div className="text-sm text-text-secondary">
                        {activity.action} • {activity.count} images
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-text-tertiary">
                    {activity.time}
                  </div>
                </m.div>
              ))}
            </div>
          </div>
        </StaggerItem>

        {/* CTA Section */}
        <StaggerItem delay={0.65}>
          <div className="mt-8 overflow-hidden rounded-2xl bg-gradient-to-br from-accent/20 via-accent/10 to-transparent p-8">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h3 className="text-xl font-bold text-text">
                  Ready to continue labeling?
                </h3>
                <p className="mt-1 text-text-secondary">
                  You have 3 batches waiting for your review.
                </p>
              </div>
              <Button variant="primary" asChild>
                <Link to="/label" className="flex items-center gap-2">
                  <PenTool className="h-4 w-4" />
                  Start Labeling
                </Link>
              </Button>
            </div>
          </div>
        </StaggerItem>
      </div>
    </div>
  )
}
