import { QueryClient } from '@tanstack/react-query'
import { FetchError } from 'ofetch'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: Infinity,
      retryDelay: 1000,
      retry(failureCount, error) {
        console.error(error)

        if (error instanceof FetchError && error.statusCode === undefined) {
          return false
        }

        if ('statusCode' in error && typeof error.statusCode === 'number') {
          const { statusCode } = error
          // only retry on network issues or transient errors
          const retryableStatusCodes = [408, 429, 502, 503, 504]
          if (statusCode >= 400 && !retryableStatusCodes.includes(statusCode)) {
            return false
          }
        }

        // Retry up to 3 times for other errors
        return failureCount < 3
      },
      // throwOnError: import.meta.env.DEV,
    },
  },
})

export { queryClient }
