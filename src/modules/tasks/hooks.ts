import { useMemo } from 'react'

import { mockMyTasks } from './mock'

export function useMyTasks() {
  return useMemo(() => {
    return {
      data: mockMyTasks,
      isLoading: false,
      error: null,
    }
  }, [])
}
