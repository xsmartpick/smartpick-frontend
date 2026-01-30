/**
 * AuditLogTable Component
 * Paginated table of audit logs
 */

import { Activity, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAuditLogs } from '../hooks'
import type { AuditFilters } from '../types'

interface AuditLogTableProps {
  filters?: AuditFilters
}

export function AuditLogTable({ filters }: AuditLogTableProps) {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const limit = 20

  const { data, isLoading, error } = useAuditLogs({
    ...filters,
    page,
    limit,
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const formatActionType = (actionType: string) => {
    const [module, action] = actionType.split('.')
    return (
      <span>
        <span className="font-medium text-accent">{module}</span>
        <span className="text-text-secondary">.</span>
        <span className="text-text">{action}</span>
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-text-secondary">
        {t('audit.table.error', 'Failed to load audit logs')}
      </div>
    )
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-text-secondary">
        {t('audit.table.noData', 'No audit logs found')}
      </div>
    )
  }

  const totalPages = Math.ceil((data.pagination?.total || 0) / limit)

  return (
    <div>
      {/* Table Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-accent" />
          <h3 className="font-semibold text-text">
            {t('audit.table.title', 'Audit Logs')}
          </h3>
          <span className="text-sm text-text-secondary">
            ({data.pagination?.total.toLocaleString()} {t('audit.table.total', 'total')})
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-fill">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                  {t('audit.table.time', 'Time')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                  {t('audit.table.user', 'User')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                  {t('audit.table.action', 'Action')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                  {t('audit.table.resource', 'Resource')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                  {t('audit.table.ip', 'IP Address')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background">
              {data.data.map((log) => (
                <tr
                  key={log.id}
                  className="transition-colors hover:bg-fill/50"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-text">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="font-medium text-text">
                      {log.actor?.displayName || 'Unknown'}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    {formatActionType(log.actionType)}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {log.resourceType ? (
                      <span className="rounded bg-fill px-2 py-1 text-xs font-medium">
                        {log.resourceType}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-mono text-text-secondary">
                    {log.ipAddress || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-text-secondary">
            {t('audit.table.showing', 'Showing')}{' '}
            {(page - 1) * limit + 1}-{Math.min(page * limit, data.pagination?.total || 0)}{' '}
            {t('audit.table.of', 'of')} {data.pagination?.total.toLocaleString()}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-border bg-fill px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-border/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <button
                    type="button"
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      page === pageNum
                        ? 'bg-accent text-white'
                        : 'bg-fill text-text hover:bg-border/20'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-border bg-fill px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-border/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
