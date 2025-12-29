import { useEffect } from 'react'

interface UseKeyboardShortcutOptions {
  /**
   * The key to listen for (e.g., 'n', 'Escape', 'ArrowLeft')
   */
  key: string
  /**
   * Callback function to execute when the key is pressed
   */
  handler: () => void
  /**
   * Whether the shortcut is enabled
   * @default true
   */
  enabled?: boolean
  /**
   * Whether to require meta/ctrl key
   * @default false
   */
  metaKey?: boolean
  /**
   * Whether to require ctrl key
   * @default false
   */
  ctrlKey?: boolean
  /**
   * Whether to ignore the shortcut when user is typing in input/textarea
   * @default true
   */
  ignoreInputs?: boolean
}

/**
 * Hook for handling keyboard shortcuts
 *
 * @example
 * ```tsx
 * useKeyboardShortcut({
 *   key: 'n',
 *   handler: () => setIsModalOpen(true),
 * })
 * ```
 */
export function useKeyboardShortcut({
  key,
  handler,
  enabled = true,
  metaKey = false,
  ctrlKey = false,
  ignoreInputs = true,
}: UseKeyboardShortcutOptions) {
  useEffect(() => {
    if (!enabled) return

    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if user is typing in an input/textarea
      if (ignoreInputs) {
        const target = e.target as HTMLElement
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          return
        }
      }

      // Check if the key matches
      const keyMatches =
        e.key.toLowerCase() === key.toLowerCase() || e.key === key

      if (!keyMatches) return

      // Check modifier keys
      if (metaKey && !e.metaKey) return
      if (ctrlKey && !e.ctrlKey) return
      if (!metaKey && !ctrlKey && (e.metaKey || e.ctrlKey)) return

      e.preventDefault()
      handler()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [key, handler, enabled, metaKey, ctrlKey, ignoreInputs])
}
