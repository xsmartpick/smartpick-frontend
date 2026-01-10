import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type {RenderOptions} from '@testing-library/react';
import { render  } from '@testing-library/react'
import { createStore,Provider as JotaiProvider } from 'jotai'
import { LazyMotion, MotionConfig } from 'motion/react'
import type { ReactElement } from 'react'
import { I18nextProvider } from 'react-i18next'

import { Spring } from '../../src/lib/spring'
import { i18nForTests } from '../mocks/i18n'

const loadFeatures = () =>
  import('../../src/framer-lazy-feature').then((res) => res.default)

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
  jotaiStore?: ReturnType<typeof createStore>
  locale?: string
}

/**
 * Create a test QueryClient with appropriate settings for tests
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  })
}

/**
 * Custom render function that wraps components with all necessary providers
 *
 * @example
 * ```tsx
 * import { renderWithProviders, screen } from '~/test/utils/render'
 *
 * test('renders button', () => {
 *   renderWithProviders(<Button>Click me</Button>)
 *   expect(screen.getByRole('button')).toBeInTheDocument()
 * })
 * ```
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    queryClient = createTestQueryClient(),
    jotaiStore = createStore(),
    locale = 'en',
    ...renderOptions
  }: CustomRenderOptions = {},
) {
  if (locale !== 'en') {
    i18nForTests.changeLanguage(locale)
  }

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <LazyMotion features={loadFeatures} strict>
        <MotionConfig transition={Spring.presets.smooth}>
          <QueryClientProvider client={queryClient}>
            <JotaiProvider store={jotaiStore}>
              <I18nextProvider i18n={i18nForTests}>{children}</I18nextProvider>
            </JotaiProvider>
          </QueryClientProvider>
        </MotionConfig>
      </LazyMotion>
    )
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
    jotaiStore,
  }
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

// Re-export renderWithProviders as the default render
export { renderWithProviders as render }
