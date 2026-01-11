import * as React from 'react'

/**
 * Hook that detects clicks outside of the referenced element
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false)
 * const ref = useClickOutside<HTMLDivElement>(open, () => setOpen(false))
 *
 * return <div ref={ref}>...</div>
 * ```
 */
export function useClickOutside<T extends HTMLElement>(
  open: boolean,
  onClose: () => void,
): React.RefObject<T | null> {
  const ref = React.useRef<T>(null)

  React.useEffect(() => {
    if (!open) return

    function onDown(e: MouseEvent) {
      const el = ref.current
      if (!el) return
      if (e.target instanceof Node && !el.contains(e.target)) onClose()
    }

    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [open, onClose])

  return ref
}
