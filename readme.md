# SmartPick Frontend - Simple Login UI

Modern React application with basic email/password authentication flow.

## Overview

This is a simplified frontend implementation focusing on core authentication UI:
- Simple login page with username/password
- JWT token management
- Protected routes
- Modern UI with dark/light theme

## Technologies

- **Vite 7** - Build tool with fast HMR
- **React 19** - UI library with concurrent features
- **TypeScript 5.9** - Type safety
- **TailwindCSS 4** - Utility-first CSS
- **React Router 7** - File-based routing
- **Jotai** - Atomic state management
- **TanStack Query** - Server state management
- **Radix UI** - Accessible component primitives
- **Sonner** - Toast notifications

## Current Features

✅ Login page with modern UI
✅ Form validation
✅ Loading states
✅ Error handling with toast notifications
✅ Remember me functionality
✅ JWT token storage in localStorage
✅ Protected routes
✅ Dark/Light theme toggle
✅ Responsive design (mobile-first)

## Getting Started

### Prerequisites
- **Node.js** 20+
- **pnpm** 10+

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Setup environment:

Create `.env` file (already exists):
```env
VITE_API_BASE_URL=http://localhost:8081/api/v1
VITE_APP_NAME=SmartPick
VITE_APP_VERSION=1.0.0
```

### Development

Start dev server:
```bash
pnpm dev
```

Server runs at: **http://localhost:5173**

## Project Structure

```
smartpick-frontend/
├── src/
│   ├── modules/auth/           # Authentication module
│   │   ├── components/
│   │   │   ├── LoginPage.tsx   # Login page container
│   │   │   └── LoginForm.tsx   # Login form component
│   │   ├── hooks/
│   │   │   └── useLogin.ts     # Login mutation hook
│   │   └── types.ts            # Auth type definitions
│   │
│   ├── atoms/                  # Global state
│   │   └── auth.ts             # Auth state (token, user)
│   │
│   ├── pages/                  # File-based routes
│   │   └── login.sync.tsx      # /login route
│   │
│   ├── lib/                    # Utilities
│   │   ├── api-client.ts       # API client with interceptors
│   │   └── endpoints.ts        # API endpoint definitions
│   │
│   └── components/ui/          # Reusable UI components
│       ├── button/
│       ├── input/
│       └── ...
│
├── .env                        # Environment variables
├── vite.config.ts              # Vite configuration
├── tailwind.config.ts          # TailwindCSS config
└── package.json
```

## Login Flow

1. User enters username/password in LoginForm
2. `useLogin` hook sends POST request to `/api/v1/auth/login`
3. Backend returns JWT token + user info
4. Token saved in localStorage
5. User info saved in Jotai atom
6. Redirect to dashboard
7. Success toast notification

## API Integration

### API Client

**Location:** `src/lib/api-client.ts`

Features:
- Auto-attach JWT token to requests
- Auto-logout on 401 errors
- Centralized error handling
- Type-safe with TypeScript

```typescript
const apiClient = ofetch.create({
  baseURL: 'http://localhost:8081/api/v1',

  // Auto-attach Bearer token
  onRequest({ options }) {
    const token = localStorage.getItem('smartpick_token')
    if (token) {
      options.headers.Authorization = `Bearer ${token}`
    }
  },

  // Handle unauthorized
  onResponseError({ response }) {
    if (response.status === 401) {
      localStorage.removeItem('smartpick_token')
      window.location.href = '/login'
    }
  },
})
```

### Login API

**Endpoint:** `POST /api/v1/auth/login`

**Request:**
```typescript
{
  username: string
  password: string
  rememberMe?: boolean
}
```

**Response:**
```typescript
{
  token: string
  user: {
    id: string
    username: string
    email: string
    fullName: string
    createdAt: string
  }
}
```

**Default Credentials:**
```
Username: trangmaiq
Password: admin123
```

## State Management

### Auth State (Jotai)

```typescript
// atoms/auth.ts
tokenAtom           // JWT token (persisted)
userAtom            // Current user info
isAuthenticatedAtom // Computed state
```

### Login Mutation (React Query)

```typescript
// modules/auth/hooks/useLogin.ts
const { mutate, isPending } = useLogin()

mutate({ username, password, rememberMe })
```

## UI Components

### Button
```tsx
<Button variant="primary" size="md" isLoading={false}>
  Sign In
</Button>
```

### Input
```tsx
<Input
  type="email"
  placeholder="Enter your email"
  hasError={false}
/>
```

### Toast
```tsx
toast.success('Welcome back!', {
  description: 'You have been successfully logged in.',
})
```

## Theme System

Dark/Light mode with persistent storage:

```tsx
import { useIsDark, useSetTheme } from '~/hooks/common/useDark'

const isDark = useIsDark()
const setTheme = useSetTheme()

// Toggle theme
setTheme(isDark ? 'light' : 'dark')
```

## Development

### Available Commands

```bash
# Development
pnpm dev          # Start dev server

# Build
pnpm build        # Build for production
pnpm serve        # Preview production build

# Code Quality
pnpm lint         # Lint and auto-fix
pnpm format       # Format code
```

### Testing Login

1. Start backend (see backend README)
2. Start frontend: `pnpm dev`
3. Navigate to http://localhost:5173
4. Login with `trangmaiq` / `admin123`
5. Check browser console for API calls
6. Verify token in localStorage

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8081/api/v1` |
| `VITE_APP_NAME` | App name | `SmartPick` |
| `VITE_APP_VERSION` | App version | `1.0.0` |

## Troubleshooting

### Cannot connect to backend
- Verify backend is running on http://localhost:8081
- Check `VITE_API_BASE_URL` in `.env`
- Check CORS settings in backend

### Hot reload not working
```bash
rm -rf node_modules/.vite
pnpm dev
```

### Type errors
Restart TypeScript server in VS Code:
`Cmd/Ctrl + Shift + P` → "TypeScript: Restart TS Server"

## Deployment

### Build for production
```bash
pnpm build
```

Output: `dist/` folder

### Deploy to Vercel/Netlify
1. Connect GitHub repository
2. Build command: `pnpm build`
3. Output directory: `dist`
4. Set environment variables

## Related Tasks

- **JIRA:** [SMAR-10 - Login UI Basic Email Password Flow](https://smartpick.atlassian.net/browse/SMAR-10)
- **Backend:** See `smartpick-backend` for API implementation

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari 15+
- Mobile browsers

## Notes

- Login UI is fully implemented and working
- Connects to backend on http://localhost:8081
- JWT token expires after 24 hours (or 30 days with rememberMe)
- Theme preference persists in localStorage
- Form validation included
- Error handling with toast notifications

## Resources

- [Vite Documentation](https://vite.dev/)
- [React Documentation](https://react.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [Jotai Documentation](https://jotai.org/)
- [TanStack Query](https://tanstack.com/query)

---

**Built with ❤️ by Delta X Team**
