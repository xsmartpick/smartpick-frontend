import { createElement } from 'react'
import { vi } from 'vitest'

// Mock motion components to avoid animation issues in tests
// This makes motion components render as regular HTML elements

vi.mock('motion/react', async () => {
  const actual = await vi.importActual('motion/react')

  return {
    ...actual,
    // AnimatePresence just renders children without animation
    AnimatePresence: ({ children }: any) => children,

    // Motion components proxy - renders as regular HTML elements
    m: new Proxy(
      {},
      {
        get: (_, prop) => {
          return ({ children, ...props }: any) => {
            const Component = prop as string
            return createElement(Component, props, children)
          }
        },
      },
    ),

    // motion.div, motion.button, etc. with forwardRef support
    motion: new Proxy(
      {},
      {
        get: (_, prop) => {
          return ({ ref, children, ...props }) => {
            return createElement(prop as string, { ...props, ref }, children)
          }
        },
      },
    ),
  }
})
