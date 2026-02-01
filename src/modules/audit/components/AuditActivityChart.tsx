/**
 * AuditActivityChart Component
 * Line/Area chart showing audit activity over time
 */

import { TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useAuditTimeline } from '../hooks'
import type { AuditFilters } from '../types'

interface AuditActivityChartProps {
  filters?: AuditFilters
}

export function AuditActivityChart(_props: AuditActivityChartProps) {
  const { t } = useTranslation()
  const { data, isLoading, error } = useAuditTimeline(30)

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  if (error) {
    console.error('[AuditActivityChart] Error details:', error)
    return (
      <div className="flex h-64 items-center justify-center text-sm text-text-secondary">
        {t('audit.chart.error', 'Failed to load activity data')}
      </div>
    )
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-text-secondary">
        {t('audit.chart.noData', 'No activity data available')}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-accent" />
          <h3 className="font-semibold text-text">
            {t('audit.chart.title', 'Activity Timeline (30 days)')}
          </h3>
        </div>
        <div className="text-sm text-text-secondary">
          {t('audit.chart.total', 'Total')}:{' '}
          {data.data.reduce((sum, d) => sum + d.count, 0).toLocaleString()}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data.data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="rgb(var(--color-accent))"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="rgb(var(--color-accent))"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgb(var(--color-border))"
            opacity={0.3}
          />
          <XAxis
            dataKey="date"
            stroke="rgb(var(--color-text-secondary))"
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) => {
              const date = new Date(value)
              return `${date.getMonth() + 1}/${date.getDate()}`
            }}
          />
          <YAxis
            stroke="rgb(var(--color-text-secondary))"
            fontSize={12}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgb(var(--color-background))',
              border: '1px solid rgb(var(--color-border))',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelStyle={{ color: 'rgb(var(--color-text))' }}
            itemStyle={{ color: 'rgb(var(--color-accent))' }}
            labelFormatter={(value) => {
              const date = new Date(value)
              return date.toLocaleDateString()
            }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="rgb(var(--color-accent))"
            strokeWidth={2}
            fill="url(#colorActivity)"
            name={t('audit.chart.actions', 'Actions')}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
