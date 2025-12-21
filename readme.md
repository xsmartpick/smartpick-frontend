# SmartPick Frontend - Simple Login UI

Modern React application với giao diện đăng nhập cơ bản username/password.

## Technologies

- **Vite 7** - Build tool
- **React 19** - UI library
- **TypeScript 5.9** - Type safety
- **TailwindCSS 4** - Utility-first CSS
- **React Router 7** - File-based routing
- **Jotai** - State management
- **TanStack Query** - Server state
- **Radix UI** - Accessible components
- **Sonner** - Toast notifications

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start Development Server

```bash
pnpm dev
```

App chạy tại: **http://localhost:5173**

## Environment Variables

File `.env`:
```env
VITE_API_BASE_URL=http://localhost:8081/api/v1
VITE_APP_NAME=SmartPick
VITE_APP_VERSION=1.0.0
```

## Login Flow

1. Truy cập http://localhost:5173
2. Nhập credentials:
   - **Username**: `trangmaiq`
   - **Password**: `admin123`
3. Click "Sign In"
4. Redirect đến dashboard với success toast
5. Token được lưu trong localStorage

## API Integration

### Endpoint

**POST** `/api/v1/auth/login`

**Request:**
```typescript
{
  username: string
  password: string
  rememberMe?: boolean  // Extends token to 30 days
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

### API Client Features

- ✅ Auto-attach JWT Bearer token to requests
- ✅ Auto-logout on 401 Unauthorized
- ✅ Centralized error handling
- ✅ Type-safe with TypeScript

## State Management

**Auth State (Jotai):**
```typescript
tokenAtom           // JWT token (persisted in localStorage)
userAtom            // Current user info
isAuthenticatedAtom // Computed authentication state
```

**Login Mutation (React Query):**
```typescript
const { mutate, isPending } = useLogin()
mutate({ username, password, rememberMe })
```

## Available Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm serve        # Preview production build
pnpm lint         # Lint and auto-fix
pnpm format       # Format code with Prettier
```

## Tóm tắt những gì đã làm

### UI Implementation
- ✅ **Login Page** với modern gradient background
- ✅ **Dark/Light Theme** toggle với persistent storage
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Form Validation** - Required fields validation
- ✅ **Loading States** - Spinner trong submit button
- ✅ **Error Handling** - Toast notifications cho success/error

### Form Features
- ✅ **Username Input** - Required field
- ✅ **Password Input** - Show/hide toggle
- ✅ **Remember Me Checkbox** - Extends token to 30 days
- ✅ **Submit Button** - Loading state khi đang login
- ✅ **Error Messages** - Hiển thị lỗi từ API

### Authentication Flow
- ✅ **JWT Token Management** - Lưu trong localStorage
- ✅ **Auto-redirect** - Redirect to dashboard sau login
- ✅ **Auto-logout** - Clear token và redirect khi 401
- ✅ **Protected Routes** - Middleware check authentication
- ✅ **Token Persistence** - Token được lưu và restore khi reload

### API Integration
- ✅ **API Client Setup** với ofetch
- ✅ **Request Interceptor** - Auto-attach Bearer token
- ✅ **Response Interceptor** - Handle 401 errors
- ✅ **Type-safe API Calls** - TypeScript generics
- ✅ **Centralized Endpoints** - API_ENDPOINTS constants

### State Management
- ✅ **Jotai Atoms** cho auth state
  - `tokenAtom` - JWT token với localStorage persistence
  - `userAtom` - User information
  - `isAuthenticatedAtom` - Computed state
- ✅ **React Query** cho server mutations
  - `useLogin` - Login mutation với loading/error states
  - Success callback: Store token + user, show toast, redirect
  - Error callback: Show error toast

### Theme System
- ✅ **Dark Mode** - Toggle giữa dark/light theme
- ✅ **Theme Persistence** - Lưu preference trong localStorage
- ✅ **Smooth Transitions** - CSS transitions cho theme change
- ✅ **System Detection** - Auto-detect system preference

### Code Quality
- ✅ **TypeScript** - Strict mode enabled
- ✅ **ESLint** - Code linting với React best practices
- ✅ **Prettier** - Auto-formatting on commit
- ✅ **Git Hooks** - Pre-commit validation

## Project Structure

```
smartpick-frontend/
├── src/
│   ├── modules/auth/              # Auth module
│   │   ├── components/
│   │   │   ├── LoginPage.tsx      # Login page container
│   │   │   └── LoginForm.tsx      # Login form component
│   │   ├── hooks/
│   │   │   └── useLogin.ts        # Login mutation hook
│   │   └── types.ts               # Auth types (User, LoginRequest, etc.)
│   │
│   ├── atoms/
│   │   └── auth.ts                # Auth state atoms
│   │
│   ├── lib/
│   │   ├── api-client.ts          # API client with interceptors
│   │   └── endpoints.ts           # API endpoint definitions
│   │
│   ├── components/ui/             # Reusable UI components
│   │   ├── button/                # Button components
│   │   ├── input/                 # Input components
│   │   └── ...                    # Other UI components
│   │
│   └── pages/
│       └── login.sync.tsx         # Login route (/login)
│
├── .env                           # Environment variables
└── vite.config.ts                 # Vite configuration
```

## Components Detail

### LoginPage
**Location:** `src/modules/auth/components/LoginPage.tsx`

- Container component với layout
- Theme toggle button
- Gradient background
- Responsive padding và spacing

### LoginForm
**Location:** `src/modules/auth/components/LoginForm.tsx`

- Form với 3 fields: username, password, rememberMe
- Submit handler với useLogin hook
- Loading state management
- Error display với toast

### useLogin Hook
**Location:** `src/modules/auth/hooks/useLogin.ts`

- React Query mutation
- API call: POST /api/v1/auth/login
- Success: Store token, store user, show toast, redirect
- Error: Show error toast with message

## Testing

### Manual Testing Steps

1. **Start Backend:**
```bash
cd smartpick-backend
docker compose -f build/docker/docker-compose.yml up -d
go run ./cmd/label
```

2. **Start Frontend:**
```bash
cd smartpick-frontend
pnpm dev
```

3. **Test Login:**
   - Navigate to http://localhost:5173
   - Enter: trangmaiq / admin123
   - Click "Sign In"
   - Should redirect with success toast
   - Check localStorage: `smartpick_token` should exist

4. **Test Auto-logout:**
   - Delete token from localStorage
   - Try to access protected route
   - Should redirect to /login

### Browser DevTools Verification

```javascript
// Check stored token
localStorage.getItem('smartpick_token')

// Check Network tab
// Should see: POST /api/v1/auth/login - Status 200
// Request: { username, password, rememberMe }
// Response: { token, user }
```

## Troubleshooting

### Cannot connect to backend
- Verify backend is running: http://localhost:8081
- Check `VITE_API_BASE_URL` in `.env`
- Check browser console for CORS errors

### Hot reload not working
```bash
rm -rf node_modules/.vite
pnpm dev
```

### Type errors
- Restart TypeScript server: Ctrl+Shift+P → "TypeScript: Restart TS Server"

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari 15+
- Mobile browsers

## Deployment

### Build for Production

```bash
pnpm build
```

Output: `dist/` folder

### Deploy to Vercel/Netlify

1. Connect GitHub repository
2. Build command: `pnpm build`
3. Output directory: `dist`
4. Add environment variables

## Related

- **JIRA**: [SMAR-10 - Login UI Basic Email Password Flow](https://smartpick.atlassian.net/browse/SMAR-10)
- **Backend**: See `smartpick-backend` repository

---

Built with Delta X
