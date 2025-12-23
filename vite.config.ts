
import tailwindcss from '@tailwindcss/vite'
import reactRefresh from '@vitejs/plugin-react'
import { codeInspectorPlugin } from 'code-inspector-plugin'
import { defineConfig } from 'vite'
import { checker } from 'vite-plugin-checker'
import tsconfigPaths from 'vite-tsconfig-paths'

import PKG from './package.json'

export default defineConfig({
  plugins: [
    codeInspectorPlugin({
      bundler: 'vite',
      hotKeys: ['altKey'],
    }),
    reactRefresh(),
    tsconfigPaths(),
    checker({
      typescript: true,
      enableBuild: true,
    }),

    tailwindcss(),
    // Temporarily disabled due to path issue with spaces
    // routeBuilderPlugin({
    //   pagePattern: `${resolve(ROOT, './src/pages')}/**/*.tsx`,
    //   outputPath: `${resolve(ROOT, './src/generated-routes.ts')}`,
    //   enableInDev: true,
    // }),
  ],
  define: {
    APP_DEV_CWD: JSON.stringify(process.cwd()),
    APP_NAME: JSON.stringify(PKG.name),
  },
  server: {
    proxy: {
      '/v1': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/v1/, '/v1'),
      },
    },
  },
})
