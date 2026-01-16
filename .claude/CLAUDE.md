# Claude Code Onboarding

Welcome to the SmartPick Axon UI codebase! This document helps Claude Code understand and work effectively with this project.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Lint and format
pnpm lint && pnpm format
```

## Project Overview

SmartPick Axon UI is a modern web application for AI-powered cashew classification. Built with React 19, TypeScript, and TailwindCSS v4.

### Tech Stack

- **Framework**: Vite 7 + React 19 + TypeScript 5.9
- **Styling**: TailwindCSS v4 with Pastel color system
- **State**: Jotai (atomic state) + TanStack Query (server state)
- **UI**: Radix UI primitives + custom components
- **Animation**: Framer Motion with LazyMotion
- **Routing**: React Router 7 with file-based routing (vite-plugin-route-builder)
- **Package Manager**: pnpm (required)

## Directory Structure

```
src/
├── atoms/           # Jotai state atoms
├── components/
│   ├── ui/          # Base UI primitives (buttons, inputs, etc.)
│   ├── common/      # Shared non-domain components
│   └── animate-ui/  # Animated component primitives
├── hooks/common/    # Shared React hooks
├── lib/             # Utilities and configuration
├── modules/         # Feature modules (auth, batches, projects, etc.)
├── pages/           # File-based routing pages
└── providers/       # React context providers
```

## Key Patterns

### Imports

Always use the `~/` path alias for src imports:

```ts
import { Button } from '~/components/ui/button'
import { UPLOAD_CONFIG } from '~/lib/upload-config'
```

### Animation

Use `m.*` components from motion/react with Spring presets:

```tsx
import { m } from 'motion/react'
import { Spring } from '~/lib/spring'

<m.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={Spring.presets.smooth}
>
```

**Never** use `motion.*` directly.

### State Management

Use `createAtomHooks` for Jotai atoms:

```ts
import { atom } from 'jotai'
import { createAtomHooks } from '~/lib/jotai'

const baseAtom = atom(0)
export const [
  myAtom,
  useMyAtom,
  useMyAtomValue,
  useSetMyAtom,
  getMyAtom,
  setMyAtom,
] = createAtomHooks(baseAtom)
```

### Styling

Use Pastel color tokens instead of raw Tailwind colors:

```tsx
// ✅ Good
<div className="bg-fill text-text border-border" />

// ❌ Bad
<div className="bg-gray-100 text-gray-900 border-gray-200" />
```

### Routing

Routes are file-based in `src/pages/`:

- `*.sync.tsx` - Synchronous routes (no code-splitting)
- `*.tsx` - Async routes (lazy loaded)
- `layout.tsx` - Layout wrapper with `<Outlet />`

**Never** edit `src/generated-routes.ts` directly.

## Configuration Files

### Upload Configuration

File upload limits are in `src/lib/upload-config.ts`:

```ts
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE_MB: 200,      // Max size per file
  MAX_FILES_PER_BATCH: 50,    // Max files per batch
  ACCEPTED_IMAGE_TYPES: [...], // Accepted MIME types
}
```

To change max file size, update `MAX_FILE_SIZE_MB` value.

## Common Tasks

### Add a New Page

1. Create file in `src/pages/(main)/your-page.tsx`
2. Export a `Component` function
3. Route is auto-generated

### Add a Feature Module

1. Create directory: `src/modules/your-feature/`
2. Add subdirectories: `components/`, `hooks/`, `types/`
3. Keep feature-specific code isolated

### Add a UI Component

1. Create in `src/components/ui/your-component/`
2. Export from index file
3. Use Pastel color tokens and CVA for variants

## Testing Changes

Run these before committing:

```bash
pnpm lint    # Check for lint errors
pnpm format  # Format code
pnpm build   # Type check and build
```

## Do Not

- Edit auto-generated files (`src/generated-routes.ts`)
- Use `motion.*` directly (use `m.*` with LazyMotion)
- Use raw Tailwind colors (use Pastel tokens)
- Use `window.location` (use routing utilities)
- Create new QueryClient or Jotai store instances

## References

- [Vite Documentation](https://vite.dev/)
- [React 19 Documentation](https://react.dev/)
- [TailwindCSS v4](https://tailwindcss.com/)
- [Jotai Documentation](https://jotai.org/)
- [TanStack Query](https://tanstack.com/query)
- [Radix UI](https://www.radix-ui.com/)
- [Pastel Color System](https://github.com/Innei/Pastel)

## Additional Documentation

- `agents.md` - Full AI agent guidelines
- `.cursor/rules/` - Cursor-specific rules and patterns
- `docs/` - Detailed documentation
