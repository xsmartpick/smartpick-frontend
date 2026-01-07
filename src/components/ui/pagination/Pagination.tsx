import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import * as React from 'react'

import { cn } from '~/lib/cn'

/* -------------------------------------------------------------------------- */
/* Pagination Container                                                       */
/* -------------------------------------------------------------------------- */

interface PaginationProps extends React.ComponentPropsWithoutRef<'nav'> {
  /** Total number of pages */
  totalPages: number
  /** Current active page (1-indexed) */
  currentPage: number
  /** Callback when a page is selected */
  onPageChange: (page: number) => void
  /** Number of pages to show on each side of the current page */
  siblingCount?: number
}

function generatePagination(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
): (number | 'ellipsis')[] {
  const totalPageNumbers = siblingCount * 2 + 5 // first, last, current, 2 ellipsis

  if (totalPages <= totalPageNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

  const showLeftEllipsis = leftSiblingIndex > 2
  const showRightEllipsis = rightSiblingIndex < totalPages - 1

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftItemCount = 3 + 2 * siblingCount
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1)
    return [...leftRange, 'ellipsis', totalPages]
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightItemCount = 3 + 2 * siblingCount
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + 1 + i,
    )
    return [1, 'ellipsis', ...rightRange]
  }

  const middleRange = Array.from(
    { length: rightSiblingIndex - leftSiblingIndex + 1 },
    (_, i) => leftSiblingIndex + i,
  )
  return [1, 'ellipsis', ...middleRange, 'ellipsis', totalPages]
}

export function Pagination({
  totalPages,
  currentPage,
  onPageChange,
  siblingCount = 1,
  className,
  ...props
}: PaginationProps) {
  const paginationRange = generatePagination(
    currentPage,
    totalPages,
    siblingCount,
  )

  if (totalPages <= 1) {
    return null
  }

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn('flex items-center justify-center gap-1', className)}
      {...props}
    >
      <PaginationButton
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous</span>
      </PaginationButton>

      {paginationRange.map((page, index) =>
        page === 'ellipsis' ? (
          <PaginationEllipsis key={`ellipsis-${index}`} />
        ) : (
          <PaginationButton
            key={page}
            onClick={() => onPageChange(page)}
            isActive={currentPage === page}
            aria-label={`Go to page ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </PaginationButton>
        ),
      )}

      <PaginationButton
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
      >
        <span className="sr-only">Next</span>
        <ChevronRight className="h-4 w-4" />
      </PaginationButton>
    </nav>
  )
}

/* -------------------------------------------------------------------------- */
/* Pagination Button                                                          */
/* -------------------------------------------------------------------------- */

interface PaginationButtonProps
  extends React.ComponentPropsWithoutRef<'button'> {
  isActive?: boolean
}

function PaginationButton({
  className,
  isActive,
  disabled,
  children,
  ...props
}: PaginationButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors',
        'border border-transparent',
        isActive
          ? 'bg-accent text-background'
          : 'text-text-secondary hover:bg-fill hover:text-text',
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

/* -------------------------------------------------------------------------- */
/* Pagination Ellipsis                                                        */
/* -------------------------------------------------------------------------- */

function PaginationEllipsis() {
  return (
    <span
      aria-hidden
      className="flex h-9 w-9 items-center justify-center text-text-tertiary"
    >
      <MoreHorizontal className="h-4 w-4" />
    </span>
  )
}
