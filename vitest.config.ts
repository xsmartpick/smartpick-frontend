import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./test/setup.ts'],
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        exclude: [
          'node_modules/',
          'test/',
          '**/*.d.ts',
          '**/*.config.*',
          'src/generated-routes.ts',
          'src/vite-env.d.ts',
        ],
        all: true,
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
      mockReset: true,
      restoreMocks: true,
      clearMocks: true,
      testTimeout: 10000,
      hookTimeout: 10000,
    },
  }),
)
