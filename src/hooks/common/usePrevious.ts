import { useEffect, useRef } from 'react'

export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>(void 0)
  useEffect(() => {
    ref.current = value
  })
  // eslint-disable-next-line react-hooks/refs
  return ref.current
}
