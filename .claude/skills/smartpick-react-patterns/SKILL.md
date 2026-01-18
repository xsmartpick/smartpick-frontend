---
name: smartpick-react-patterns
description: React 19 patterns and best practices for SmartPick Frontend
license: MIT
metadata:
  author: SmartPick Team
  version: 1.0.0
---

# SmartPick React Patterns

Comprehensive development patterns for SmartPick Frontend, a React 19 + TypeScript + TailwindCSS v4 application. Contains rules across animation, styling, state management, routing, and component organization.

## Use When

Apply these patterns when:
- Writing new React components
- Refactoring existing code
- Reviewing pull requests
- Optimizing application performance
- Adding animations or styling
- Managing application state

## Rule Categories

| Priority | Category | Impact | Rules | Prefix |
|----------|----------|--------|-------|--------|
| 1 | Animation | CRITICAL | 3 | ANIM- |
| 2 | Styling & Colors | CRITICAL | 5 | COLOR- |
| 3 | State Management | HIGH | 4 | STATE- |
| 4 | Component Organization | HIGH | 3 | COMP- |
| 5 | Routing | MEDIUM | 3 | ROUTE- |
| 6 | Import Paths | MEDIUM | 2 | IMPORT- |

## Quick Reference

### ANIM: Animation Rules (CRITICAL)

**ANIM-1**: Always use `m.*` from `motion/react`, never `motion.*` directly
**ANIM-2**: Use Spring presets from `~/lib/spring` for transitions
**ANIM-3**: Leverage LazyMotion for bundle optimization

### COLOR: Styling & Color Rules (CRITICAL)

**COLOR-1**: Use Pastel semantic color tokens, never raw Tailwind colors with numeric scales
**COLOR-2**: Use semantic colors: `text-text`, `bg-background`, `border-border`, `bg-fill`
**COLOR-3**: No `dark:` prefixes - Pastel handles dark mode automatically
**COLOR-4**: Use color variants: `-kawaii`, `-hc`, `-light`, `-dark` for special cases
**COLOR-5**: For status colors, use base colors without scales: `text-red`, `bg-green`

### STATE: State Management Rules (HIGH)

**STATE-1**: Use `createAtomHooks` for Jotai atoms to generate consistent hooks
**STATE-2**: Store all atoms in `src/atoms/` directory with descriptive names ending in `Atom`
**STATE-3**: Always use the global `jotaiStore` from `~/lib/jotai`
**STATE-4**: Use TanStack Query for server state, Jotai for client state

### COMP: Component Organization Rules (HIGH)

**COMP-1**: Place UI primitives in `src/components/ui/`, feature components in `src/modules/`
**COMP-2**: Use Radix UI primitives for accessible base components
**COMP-3**: Keep feature-specific code isolated in module directories

### ROUTE: Routing Rules (MEDIUM)

**ROUTE-1**: Use file-based routing in `src/pages/` - routes are auto-generated
**ROUTE-2**: Never edit `src/generated-routes.ts` directly
**ROUTE-3**: Use `*.sync.tsx` for synchronous routes, `*.tsx` for lazy-loaded routes

### IMPORT: Import Path Rules (MEDIUM)

**IMPORT-1**: Always use `~/` path alias for src imports
**IMPORT-2**: Organize imports: external dependencies → internal modules → components → utils

## Detailed Rules

### Animation (CRITICAL Priority)

#### ANIM-1: Use m.* Components

Framer Motion with LazyMotion optimization requires using the `m.` prefix.

```tsx
// ✅ Correct
import { m } from 'motion/react'
import { Spring } from '~/lib/spring'

function AnimatedCard() {
  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={Spring.presets.smooth}
    >
      <h2>Animated Content</h2>
    </m.div>
  )
}

// ❌ Wrong - breaks LazyMotion optimization
import { motion } from 'motion/react'

function WrongCard() {
  return <motion.div>Content</motion.div>
}
```

**Rationale**: Using `motion.*` bypasses LazyMotion's tree-shaking, increasing bundle size significantly.

#### ANIM-2: Use Spring Presets

Use predefined Spring presets for consistent, performant animations.

```tsx
import { m } from 'motion/react'
import { Spring } from '~/lib/spring'

// ✅ Correct - use Spring presets
<m.div transition={Spring.presets.smooth} />
<m.div transition={Spring.presets.gentle} />
<m.div transition={Spring.presets.wobbly} />

// ❌ Wrong - manual spring config
<m.div transition={{ type: 'spring', stiffness: 100, damping: 20 }} />
```

**Rationale**: Centralized spring presets ensure consistent animation feel across the app.

#### ANIM-3: LazyMotion Setup

Ensure components use LazyMotion features properly.

```tsx
import { LazyMotion, m } from 'motion/react'
import { domAnimation } from 'framer-motion'

// ✅ Correct - wrap with LazyMotion
function App() {
  return (
    <LazyMotion features={domAnimation}>
      <m.div>Animated content</m.div>
    </LazyMotion>
  )
}
```

**Rationale**: LazyMotion enables code-splitting for animation features, reducing initial bundle size.

### Styling & Colors (CRITICAL Priority)

#### COLOR-1: No Raw Tailwind Colors

Never use Tailwind color utilities with numeric scales (50-900).

```tsx
// ❌ FORBIDDEN - numeric color scales
<div className="text-gray-700 bg-gray-100 border-gray-200" />
<button className="bg-blue-500 hover:bg-blue-600" />
<span className="text-red-500" />

// ✅ Correct - Pastel semantic colors
<div className="text-text bg-background border-border" />
<button className="bg-accent hover:bg-accent/90" />
<span className="text-red" />
```

**Rationale**: Raw Tailwind colors break the design system's automatic dark mode, accessibility, and color variant features.

#### COLOR-2: Use Semantic Color Tokens

Use Pastel's semantic color system for all UI elements.

```tsx
// Text colors
text-text              // Primary text
text-text-secondary    // Secondary text
text-text-tertiary     // Tertiary text
text-placeholder-text  // Placeholder text
text-link             // Link text
text-disabled-text    // Disabled state

// Background colors
bg-background          // Primary background
bg-background-secondary
bg-background-tertiary
bg-background-quaternary
bg-background-quinary

// Fill colors (for interactive elements)
bg-fill               // Primary fill
bg-fill-secondary
bg-fill-tertiary
bg-fill-quaternary
bg-fill-quinary

// Border colors
border-border         // Primary border
border-separator      // Separator lines

// Material colors (glass morphism)
bg-material-opaque
bg-material-ultra-thick
bg-material-thick
bg-material-medium
bg-material-thin
bg-material-ultra-thin

// Application colors
bg-accent    text-accent    // Primary brand color
bg-primary   text-primary   // Primary actions
bg-secondary text-secondary // Secondary actions
```

**Example**:

```tsx
// ✅ Correct - semantic colors
<div className="bg-background text-text border border-border">
  <h2 className="text-text">Title</h2>
  <p className="text-text-secondary">Description</p>
  <button className="bg-accent text-background">
    Primary Action
  </button>
  <button className="bg-fill text-text hover:bg-fill-secondary">
    Secondary Action
  </button>
</div>
```

#### COLOR-3: No Dark Mode Prefixes

The Pastel system handles dark mode automatically - never use `dark:` prefixes.

```tsx
// ❌ Wrong
<div className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800" />

// ✅ Correct - automatic dark mode
<div className="text-text bg-background" />
```

**Rationale**: Pastel's OKLCH color system automatically adapts to light/dark mode based on user preferences.

#### COLOR-4: Color Variants

Use variant suffixes for special cases.

```tsx
// Kawaii variant (softer colors)
<div className="bg-background-kawaii text-text-kawaii" />

// High contrast variant (accessibility)
<div className="bg-background-hc text-text-hc" />

// Light/dark specific
<div className="bg-background-light text-text-dark" />
```

#### COLOR-5: Status Colors Without Scales

For status indication, use base color names without numeric scales.

```tsx
// ✅ Correct
<span className="text-red">Error message</span>
<span className="text-green">Success message</span>
<span className="text-yellow">Warning message</span>
<span className="text-blue">Info message</span>

// ❌ Wrong
<span className="text-red-500">Error message</span>
<span className="text-green-600">Success message</span>
```

### State Management (HIGH Priority)

#### STATE-1: Use createAtomHooks

Generate consistent atom hooks using the utility function.

```typescript
// ✅ Correct
import { atom } from 'jotai'
import { createAtomHooks } from '~/lib/jotai'

const baseUserAtom = atom<User | null>(null)
export const [
  userAtom,
  useUserAtom,
  useUserAtomValue,
  useSetUserAtom,
  getUserAtom,
  setUserAtom,
] = createAtomHooks(baseUserAtom)

// Usage in components
function UserProfile() {
  const user = useUserAtomValue() // Generated hook
  return <div>{user?.name}</div>
}
```

**Rationale**: Consistent hook generation ensures predictable API and reduces boilerplate.

#### STATE-2: Atom Organization

Store atoms in the `src/atoms/` directory with descriptive naming.

```typescript
// File: src/atoms/user.ts
import { atom } from 'jotai'

export const userAtom = atom<User | null>(null)
export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null)
export const userPermissionsAtom = atom((get) => get(userAtom)?.permissions ?? [])
```

**Rationale**: Centralized atom storage makes state management predictable and maintainable.

#### STATE-3: Use Global Store

Always use the configured global store instance.

```typescript
// ✅ Correct
import { jotaiStore } from '~/lib/jotai'

// Get value outside components
const currentUser = jotaiStore.get(userAtom)

// Set value outside components
jotaiStore.set(userAtom, newUser)

// ❌ Wrong - creating new store
import { createStore } from 'jotai'
const myStore = createStore() // Don't do this
```

**Rationale**: Multiple store instances can cause state synchronization issues.

#### STATE-4: Server vs Client State

Use the appropriate state management tool for each use case.

```typescript
// ✅ Correct - TanStack Query for server state
import { useQuery } from '@tanstack/react-query'

function UserList() {
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  })
  return <div>{users?.map(u => u.name)}</div>
}

// ✅ Correct - Jotai for client state
import { useAtomValue } from 'jotai'
import { sidebarOpenAtom } from '~/atoms/ui'

function Sidebar() {
  const isOpen = useAtomValue(sidebarOpenAtom)
  return isOpen ? <nav>...</nav> : null
}
```

**Rationale**: Server state (caching, revalidation) and client state (UI, preferences) have different requirements.

### Component Organization (HIGH Priority)

#### COMP-1: Directory Structure

Organize components based on their scope and purpose.

```
src/
├── components/
│   ├── ui/               # Base UI primitives
│   │   ├── button/
│   │   ├── input/
│   │   └── dialog/
│   ├── common/           # Shared cross-feature components
│   │   ├── Header/
│   │   └── Footer/
│   └── animate-ui/       # Animated primitives
│
├── modules/              # Feature modules
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── types/
│   ├── batches/
│   └── projects/
```

**Rationale**: Clear separation of concerns makes the codebase easier to navigate and maintain.

#### COMP-2: Use Radix UI Primitives

Build accessible components using Radix UI primitives.

```tsx
// ✅ Correct
import * as Dialog from '@radix-ui/react-dialog'
import { m } from 'motion/react'

function Modal({ children }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger>Open</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <m.div className="bg-material-thick" />
        </Dialog.Overlay>
        <Dialog.Content asChild>
          <m.div className="bg-background">
            {children}
          </m.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

**Rationale**: Radix UI provides accessible, unstyled primitives that work well with custom styling.

#### COMP-3: Feature Isolation

Keep feature-specific code within module boundaries.

```typescript
// ✅ Correct - feature isolated
// src/modules/batches/components/BatchList.tsx
import { useBatches } from '~/modules/batches/hooks/useBatches'
import { BatchCard } from './BatchCard'

// ❌ Wrong - mixing concerns
// src/components/common/BatchList.tsx
import { useBatches } from '~/modules/batches/hooks/useBatches'
```

**Rationale**: Clear module boundaries prevent tight coupling and make features more portable.

### Routing (MEDIUM Priority)

#### ROUTE-1: File-Based Routing

Routes are automatically generated from the `src/pages/` directory structure.

```typescript
// File: src/pages/(main)/projects/index.tsx
export function Component() {
  return <div>Projects List</div>
}
// Route: /projects

// File: src/pages/(main)/projects/[id].tsx
export function Component() {
  const { id } = useParams()
  return <div>Project {id}</div>
}
// Route: /projects/:id
```

**Rationale**: File-based routing provides clear mapping between files and routes.

#### ROUTE-2: Never Edit Generated Routes

The `src/generated-routes.ts` file is auto-generated.

```typescript
// ❌ Never edit this file
// src/generated-routes.ts
```

**Rationale**: Manual edits will be overwritten on the next build.

#### ROUTE-3: Sync vs Async Routes

Choose route loading strategy based on page importance.

```typescript
// Sync route (no code-splitting)
// File: src/pages/(main)/dashboard.sync.tsx
export function Component() {
  return <div>Dashboard</div>
}

// Async route (lazy-loaded)
// File: src/pages/(main)/settings.tsx
export function Component() {
  return <div>Settings</div>
}
```

**Rationale**: Critical pages load synchronously for better UX; secondary pages lazy-load to reduce initial bundle.

### Import Paths (MEDIUM Priority)

#### IMPORT-1: Use Path Alias

Always use the `~/` alias for src imports.

```typescript
// ✅ Correct
import { Button } from '~/components/ui/button'
import { useUser } from '~/hooks/common/useUser'
import { UPLOAD_CONFIG } from '~/lib/upload-config'

// ❌ Wrong
import { Button } from '../../../components/ui/button'
import { useUser } from '../../hooks/common/useUser'
```

**Rationale**: Path aliases prevent brittle relative imports and make refactoring easier.

#### IMPORT-2: Import Organization

Organize imports in a consistent order.

```typescript
// ✅ Correct
// 1. External dependencies
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. Internal modules
import { useUser } from '~/modules/auth/hooks/useUser'
import { BatchCard } from '~/modules/batches/components/BatchCard'

// 3. Components
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'

// 4. Utils and types
import { cn } from '~/lib/utils'
import type { User } from '~/types/user'
```

**Rationale**: Consistent import organization improves code readability and maintainability.

## Common Violations & Fixes

### Violation: Using motion.* Instead of m.*

```tsx
// ❌ Before
import { motion } from 'framer-motion'

<motion.div>Content</motion.div>

// ✅ After
import { m } from 'motion/react'

<m.div>Content</m.div>
```

### Violation: Using Raw Tailwind Colors

```tsx
// ❌ Before
<div className="text-gray-700 bg-gray-100 border-gray-300">
  <span className="text-blue-500">Link</span>
  <span className="text-red-600">Error</span>
</div>

// ✅ After
<div className="text-text bg-background border-border">
  <span className="text-accent">Link</span>
  <span className="text-red">Error</span>
</div>
```

### Violation: Manual Atom Hook Creation

```typescript
// ❌ Before
import { atom, useAtom } from 'jotai'

export const userAtom = atom(null)

// Usage
const [user, setUser] = useAtom(userAtom)

// ✅ After
import { atom } from 'jotai'
import { createAtomHooks } from '~/lib/jotai'

const baseUserAtom = atom(null)
export const [
  userAtom,
  useUserAtom,
  useUserAtomValue,
  useSetUserAtom,
] = createAtomHooks(baseUserAtom)

// Usage
const user = useUserAtomValue()
const setUser = useSetUserAtom()
```

## Testing Requirements

Before committing changes:

```bash
pnpm lint    # Check for lint errors
pnpm format  # Format code
pnpm build   # Type check and build
```

For UI features:
1. Start dev server: `pnpm dev`
2. Navigate to the feature in browser
3. Test all user interactions
4. Verify visual appearance
5. Check console for errors

## References

- [React 19 Documentation](https://react.dev/)
- [Framer Motion](https://www.framer.com/motion/)
- [TailwindCSS v4](https://tailwindcss.com/)
- [Pastel Color System](https://github.com/Innei/Pastel)
- [Jotai Documentation](https://jotai.org/)
- [Radix UI](https://www.radix-ui.com/)
- [TanStack Query](https://tanstack.com/query)

## Version History

- 1.0.0 - Initial skill creation with animation, styling, state management, component organization, routing, and import rules
