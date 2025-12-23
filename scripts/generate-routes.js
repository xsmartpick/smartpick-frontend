import { readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const pagesDir = join(__dirname, '../src/pages')
const outputPath = join(__dirname, '../src/generated-routes.ts')

function scanPages(dir, baseDir = dir, isInRouteGroup = false) {
  const routes = []
  const files = readdirSync(dir)

  for (const file of files) {
    const fullPath = join(dir, file)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      // Skip route groups (folders with parentheses) - don't process their children
      if (file.startsWith('(') && file.endsWith(')')) {
        // Ignore route groups entirely for now
        continue
      } else {
        routes.push(...scanPages(fullPath, baseDir, isInRouteGroup))
      }
    } else if (file.endsWith('.tsx') && !isInRouteGroup) {
      const relativePath = relative(baseDir, fullPath)
      const importPath =
        `./pages/${  relativePath.replaceAll('\\', '/').replace('.tsx', '')}`

      // Convert file path to route path
      let routePath = relativePath
        .replaceAll('\\', '/')
        .replace(/\.sync\.tsx$/, '')
        .replace(/\.tsx$/, '')
        .replace(/index$/, '')

      // Normalize path
      if (routePath === '' || routePath === 'login') {
        routePath = '/'
      } else if (!routePath.startsWith('/')) {
        routePath = `/${  routePath}`
      }

      routes.push({
        path: routePath,
        importPath,
      })
    }
  }

  return routes
}

const routes = scanPages(pagesDir)

// Generate TypeScript file
const content = `// Auto-generated file by generate-routes.js
import type { RouteObject } from 'react-router'

export const routes: RouteObject[] = [
${routes
  .map(
    (r) => `  {
    path: '${r.path}',
    lazy: () => import('${r.importPath}'),
  }`,
  )
  .join(',\n')}
]
`

writeFileSync(outputPath, content, 'utf-8')
console.info(`✓ Generated routes file: ${outputPath}`)
console.info(`✓ Found ${routes.length} route(s)`)
