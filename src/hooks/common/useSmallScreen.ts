import { useViewport } from './useViewport'

export const useSmallScreen = () => {
  return useViewport((v) => v.w < 640 && v.w !== 0)
}

export const isSmallScreen = () => {
  const w = window.innerWidth
  return w < 640 && w !== 0
}
