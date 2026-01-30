/**
 * AuditFilterBar Component
 * Filter controls for audit logs
 */

import { Calendar, Filter, User, Zap } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { AuditFilters } from '../types'

const INITIAL_FILTERS: AuditFilters = {}

interface AuditFilterBarProps {
  filters?: AuditFilters
  onFiltersChange: (filters: AuditFilters) => void
}

export function AuditFilterBar({
  filters = INITIAL_FILTERS,
  onFiltersChange,
}: AuditFilterBarProps) {
  const { t } = useTranslation()
  const [localFilters, setLocalFilters] = useState<AuditFilters>(filters)

  const handleApply = () => {
    onFiltersChange(localFilters)
  }

  const handleReset = () => {
    const emptyFilters: AuditFilters = {}
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  return (
    <div className="mb-6 rounded-2xl border border-border bg-background p-4">
      <div className="mb-3 flex items-center gap-2">
        <Filter className="h-5 w-5 text-accent" />
        <h3 className="font-semibold text-text">
          {t('audit.filters.title', 'Filters')}
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Action Type Filter */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            <Zap className="mr-1.5 inline h-4 w-4" />
            {t('audit.filters.actionType', 'Action Type')}
          </label>
          <select
            value={localFilters.actionType || ''}
            onChange={(e) =>
              setLocalFilters({
                ...localFilters,
                actionType: e.target.value || undefined,
              })
            }
            className="w-full rounded-lg border border-border bg-fill px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="">{t('audit.filters.all', 'All')}</option>
            <option value="auth.login">auth.login</option>
            <option value="dataset.create">dataset.create</option>
            <option value="dataset.update">dataset.update</option>
            <option value="dataset.delete">dataset.delete</option>
            <option value="batch.create">batch.create</option>
            <option value="batch.delete">batch.delete</option>
            <option value="project.create">project.create</option>
            <option value="task.create">task.create</option>
            <option value="labeling.save">labeling.save</option>
            <option value="labeling.remove">labeling.remove</option>
            <option value="labeling.bulk_save">labeling.bulk_save</option>
          </select>
        </div>

        {/* Resource Type Filter */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            <User className="mr-1.5 inline h-4 w-4" />
            {t('audit.filters.resourceType', 'Resource Type')}
          </label>
          <select
            value={localFilters.resourceType || ''}
            onChange={(e) =>
              setLocalFilters({
                ...localFilters,
                resourceType: e.target.value || undefined,
              })
            }
            className="w-full rounded-lg border border-border bg-fill px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="">{t('audit.filters.all', 'All')}</option>
            <option value="dataset">Dataset</option>
            <option value="batch">Batch</option>
            <option value="project">Project</option>
            <option value="task">Task</option>
            <option value="segment">Segment</option>
          </select>
        </div>

        {/* Date From */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            <Calendar className="mr-1.5 inline h-4 w-4" />
            {t('audit.filters.dateFrom', 'Date From')}
          </label>
          <input
            type="date"
            value={localFilters.dateFrom || ''}
            onChange={(e) =>
              setLocalFilters({
                ...localFilters,
                dateFrom: e.target.value || undefined,
              })
            }
            className="w-full rounded-lg border border-border bg-fill px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {/* Date To */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            <Calendar className="mr-1.5 inline h-4 w-4" />
            {t('audit.filters.dateTo', 'Date To')}
          </label>
          <input
            type="date"
            value={localFilters.dateTo || ''}
            onChange={(e) =>
              setLocalFilters({
                ...localFilters,
                dateTo: e.target.value || undefined,
              })
            }
            className="w-full rounded-lg border border-border bg-fill px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={handleApply}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          {t('audit.filters.apply', 'Apply Filters')}
        </button>
        <button
          onClick={handleReset}
          className="rounded-lg border border-border bg-fill px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-border/20"
        >
          {t('audit.filters.reset', 'Reset')}
        </button>
      </div>
    </div>
  )
}
