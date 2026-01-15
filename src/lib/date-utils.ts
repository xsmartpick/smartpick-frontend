import type { TFunction } from 'i18next'

/**
 * Format a date string to a readable format
 * @param dateString - ISO date string
 * @param options - Formatting options
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string,
  options?: {
    includeTime?: boolean
  },
): string {
  try {
    const date = new Date(dateString)

    // Check if date is valid
    if (Number.isNaN(date.getTime())) {
      return 'Invalid date'
    }

    const formatOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }

    if (options?.includeTime) {
      formatOptions.hour = '2-digit'
      formatOptions.minute = '2-digit'
    }

    return date.toLocaleDateString(undefined, formatOptions)
  } catch {
    return 'Invalid date'
  }
}

/**
 * Get a human-readable relative time string (e.g., "2 hours ago", "3 days ago")
 * @param dateString - ISO date string
 * @param t - Translation function from i18next
 * @returns Relative time string
 */
export function relativeTime(dateString: string, t: TFunction): string {
  try {
    const date = new Date(dateString)
    const now = new Date()

    // Check if date is valid
    if (Number.isNaN(date.getTime())) {
      return t('time.invalidDate')
    }

    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)
    const diffWeek = Math.floor(diffDay / 7)
    const diffMonth = Math.floor(diffDay / 30)
    const diffYear = Math.floor(diffDay / 365)

    // Handle future dates
    if (diffMs < 0) {
      return t('time.future')
    }

    // Seconds
    if (diffSec < 10) return t('time.justNow')
    if (diffSec < 60) return t('time.secondsAgo', { count: diffSec })

    // Minutes
    if (diffMin < 60) return t('time.minutesAgo', { count: diffMin })

    // Hours
    if (diffHour < 24) return t('time.hoursAgo', { count: diffHour })

    // Days
    if (diffDay < 7) return t('time.daysAgo', { count: diffDay })

    // Weeks
    if (diffWeek < 4) return t('time.weeksAgo', { count: diffWeek })

    // Months
    if (diffMonth < 12) return t('time.monthsAgo', { count: diffMonth })

    // Years
    if (diffYear >= 1) return t('time.yearsAgo', { count: diffYear })

    // Fallback to formatted date
    return formatDate(dateString)
  } catch {
    return t('time.invalidDate')
  }
}
