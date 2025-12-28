import { useEffect } from 'react'

interface UseLabelingKeyboardShortcutsOptions {
  onPrevious: () => void
  onNext: () => void
  onSave: () => void
  onLabelSelect: (labelId: string) => void
  labels: Array<{ id: string }>
}

/**
 * Hook for handling keyboard shortcuts in labeling interface
 */
export function useLabelingKeyboardShortcuts({
  onPrevious,
  onNext,
  onSave,
  onLabelSelect,
  labels,
}: UseLabelingKeyboardShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      switch (e.key) {
        case 'ArrowLeft': {
          e.preventDefault()
          onPrevious()
          break
        }
        case 'ArrowRight': {
          e.preventDefault()
          onNext()
          break
        }
        case 's':
        case 'S': {
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault()
            onSave()
          }
          break
        }
        default: {
          // Number keys 1-9 for label selection
          const num = Number.parseInt(e.key, 10)
          if (num >= 1 && num <= 9 && labels[num - 1]) {
            e.preventDefault()
            onLabelSelect(labels[num - 1].id)
          }
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onPrevious, onNext, onSave, onLabelSelect, labels])
}
