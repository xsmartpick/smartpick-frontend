import { ArrowRight, Boxes, ImageIcon, Tag } from 'lucide-react'
import { m } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { EmptyState, ErrorState, LoadingState } from '~/components/common'
import { Button } from '~/components/ui/button'
import { relativeTime } from '~/lib/date-utils'
import { Spring } from '~/lib/spring'
import { useBatches } from '~/modules/batches/hooks'
import type { Batch } from '~/modules/batches/types'
import { CASHEW_LABELS } from '~/modules/labeling'

/**
 * Labeling hub page
 *
 * Shows available batches that can be labeled
 * Click on a batch to start labeling its segments
 */
export const Component = () => {
  const { t } = useTranslation()
  const { data: batches = [], isLoading, error, refetch } = useBatches()

  // Filter batches that have images (ready for labeling)
  const readyBatches = batches.filter(
    (batch) => batch.status === 'completed' || batch.imageCount > 0,
  )

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Page Header */}
      <div className="border-b border-border bg-background/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-6">
          <div className="flex items-center gap-4">
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={Spring.presets.bouncy}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-background shadow-lg shadow-accent/20"
            >
              <Tag className="h-6 w-6" />
            </m.div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                {t('label.hub.title')}
              </h1>
              <p className="text-sm text-text-secondary">
                {t('label.hub.selectBatch')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Available Labels Preview */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={Spring.presets.smooth}
          className="mb-8"
        >
          <h2 className="mb-4 text-sm font-semibold text-text">
            {t('label.hub.availableLabels')}
          </h2>
          <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-fill/30 p-4">
            {CASHEW_LABELS.map((label) => (
              <div
                key={label.id}
                className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5"
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: label.color }}
                />
                <span className="text-sm font-medium text-text">
                  {label.name}
                </span>
              </div>
            ))}
          </div>
        </m.div>

        {/* Batches Grid */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...Spring.presets.smooth, delay: 0.1 }}
        >
          <h2 className="mb-4 text-sm font-semibold text-text">
            {t('label.hub.sections.batchesReady')}
          </h2>

          {isLoading ? (
            <div className="rounded-2xl border border-border bg-background p-8">
              <LoadingState message={t('label.hub.loading.batches')} />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-border bg-background p-8">
              <ErrorState
                title={t('label.hub.error.batches')}
                onRetry={() => refetch()}
              />
            </div>
          ) : readyBatches.length === 0 ? (
            <div className="rounded-2xl border border-border bg-background p-8">
              <EmptyState
                title={t('label.hub.empty.batches.title')}
                message={t('label.hub.empty.batches.message')}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {readyBatches.map((batch) => (
                <BatchCard key={batch.id} batch={batch} t={t} />
              ))}
            </div>
          )}
        </m.div>
      </div>
    </div>
  )
}

function BatchCard({
  batch,
  t,
}: {
  batch: Batch
  t: ReturnType<typeof useTranslation>['t']
}) {
  return (
    <m.div
      whileHover={{ scale: 1.02 }}
      transition={Spring.presets.snappy}
      className="group rounded-2xl border border-border bg-background p-4 transition-shadow hover:shadow-lg"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fill">
          <Boxes className="h-5 w-5 text-text-secondary" />
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            batch.status === 'completed'
              ? 'bg-accent/10 text-accent'
              : batch.status === 'processing'
                ? 'bg-warning/10 text-warning'
                : 'bg-fill text-text-secondary'
          }`}
        >
          {t(`batches.card.status.${batch.status ?? 'draft'}`, {
            defaultValue: batch.status ?? t('batches.card.status.draft'),
          })}
        </span>
      </div>

      <h3 className="mb-1 font-semibold text-text">{batch.name}</h3>
      {batch.description && (
        <p className="mb-3 line-clamp-2 text-sm text-text-secondary">
          {batch.description}
        </p>
      )}

      <div className="mb-4 flex items-center gap-4 text-sm text-text-tertiary">
        <div className="flex items-center gap-1">
          <ImageIcon className="h-4 w-4" />
          <span>{t('common.images', { count: batch.imageCount })}</span>
        </div>
      </div>

      <div className="mb-4 text-xs text-text-tertiary">
        {t('label.hub.card.updated')} {relativeTime(batch.updatedAt, t)}
      </div>

      <Link to={`/label/${batch.id}`}>
        <Button
          variant="primary"
          className="w-full"
          disabled={batch.imageCount === 0}
        >
          {t('label.hub.card.actions.start')}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </m.div>
  )
}
