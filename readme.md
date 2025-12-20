# SmartPick Frontend

## Overview
Modern web application cho SmartPick - hệ thống phân loại điều thông minh sử dụng AI. Frontend được xây dựng với Vite, React 19, và TailwindCSS, cung cấp trải nghiệm người dùng nhanh chóng và trực quan.

## Technologies Used

### Core Stack
- **Vite 7** - Build tool với HMR cực nhanh
- **React 19** - Latest React với concurrent features
- **TypeScript 5.9** - Type safety và developer experience
- **TailwindCSS 4** - Utility-first CSS framework
- **React Router 7** - File-based routing với nested routes

### State Management
- **Jotai** - Atomic state management
- **TanStack Query (React Query)** - Server state management
- **Immer** - Immutable state updates

### UI Components
- **Radix UI** - Accessible component primitives
- **Headless UI** - Unstyled accessible components
- **Framer Motion** - Animation library
- **Lucide React & RemixIcon** - Icon libraries
- **Sonner** - Toast notifications

### Styling & Design
- **TailwindCSS 4** với plugins:
  - `@tailwindcss/typography` - Typography styles
  - `@tailwindcss/container-queries` - Container queries
  - `tailwindcss-animate` - Animation utilities
  - `tailwind-scrollbar` - Custom scrollbars
  - `@egoist/tailwindcss-icons` - Icon utilities
- **Pastel Palette** - Modern color system
- **Class Variance Authority (CVA)** - Component variants
- **clsx & tailwind-merge** - Conditional classes

### Development Tools
- **ESLint** - Code linting với React best practices
- **Prettier** - Code formatting
- **Code Inspector** - Alt+click navigation to source
- **React Scan** - Performance monitoring
- **TypeScript Checker** - Type checking trong build
- **simple-git-hooks** - Git hooks cho pre-commit

## Features Implemented

### ✅ Authentication System
- **Login Page** với modern UI/UX
  - Beautiful gradient background
  - Theme toggle (Dark/Light mode)
  - Form validation
  - Loading states
  - Error handling với toast notifications
  - Remember me functionality
  - Responsive design (mobile-first)

- **JWT Authentication**
  - Token storage trong localStorage
  - Auto-inject token vào API requests
  - Auto-redirect khi unauthorized
  - Protected routes với auth middleware

- **State Management**
  - User state với Jotai atoms
  - Token persistence
  - isAuthenticated computed state

### ✅ API Integration
- **API Client Setup**
  - Base URL configuration
  - Request/Response interceptors
  - Auto-attach Bearer token
  - Global error handling
  - Auto-logout trên 401 errors

- **Endpoints Structure**
  - Centralized API_ENDPOINTS
  - Type-safe API calls
  - Ready for future endpoints (CASHEW classification, stats)

### ✅ UI Components Library
Comprehensive component system với:
- **Buttons** - Multiple variants (primary, secondary, ghost, destructive)
- **Inputs** - Text, Password với validation states
- **Forms** - Label, Checkbox với accessibility
- **Feedback** - Toast notifications với Sonner
- **Layouts** - ScrollArea, Dialog, HoverCard
- **Navigation** - Dropdown Menu, Context Menu
- **Display** - Accordion, Divider
- **Advanced** - Tooltip, Slider, Switch

### ✅ Theme System
- Dark/Light mode toggle
- Persistent theme preference
- Smooth transitions
- Custom color palette
- System preference detection

### ✅ Routing System
- File-based routing với `vite-plugin-route-builder`
- Protected routes
- Nested layouts
- Error boundaries
- 404 handling

### ✅ Developer Experience
- Hot Module Replacement (HMR)
- TypeScript strict mode
- Path aliases (`~/`)
- Code splitting
- Tree shaking
- Pre-commit hooks
- Auto-formatting
- Alt+click code navigation

## Project Structure

```
smartpick-frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components
│   │   │   ├── button/
│   │   │   ├── input/
│   │   │   ├── dialog/
│   │   │   ├── scroll-areas/
│   │   │   └── ...
│   │   ├── common/         # Common components
│   │   │   ├── ErrorElement.tsx
│   │   │   ├── NotFound.tsx
│   │   │   └── Footer.tsx
│   │   └── animate-ui/     # Animated components
│   │
│   ├── modules/            # Feature modules
│   │   └── auth/
│   │       ├── components/ # Auth-specific components
│   │       │   ├── LoginPage.tsx
│   │       │   └── LoginForm.tsx
│   │       ├── hooks/      # Auth hooks
│   │       │   ├── useLogin.ts
│   │       │   └── useAuth.ts
│   │       └── types/      # Auth types
│   │
│   ├── atoms/              # Jotai state atoms
│   │   ├── auth.ts         # Authentication state
│   │   ├── viewport.ts     # Viewport state
│   │   └── route.ts        # Router state
│   │
│   ├── pages/              # File-based routes
│   │   ├── login.sync.tsx  # /login
│   │   └── (main)/
│   │       └── index.sync.tsx  # / (protected)
│   │
│   ├── lib/                # Utilities & helpers
│   │   ├── api-client.ts   # API client setup
│   │   ├── endpoints.ts    # API endpoints
│   │   ├── query-client.ts # React Query config
│   │   ├── cn.ts           # Class name utilities
│   │   └── utils.ts        # General utilities
│   │
│   ├── hooks/              # Custom React hooks
│   │   └── common/
│   │       ├── useDark.tsx # Dark mode hook
│   │       └── useViewport.tsx # Viewport hook
│   │
│   ├── providers/          # Context providers
│   │   ├── root-providers.tsx      # Root provider composer
│   │   ├── stable-router-provider.tsx # Router provider
│   │   ├── event-provider.tsx      # Event system
│   │   └── setting-sync.tsx        # Settings sync
│   │
│   ├── App.tsx             # App component
│   ├── main.tsx            # Entry point
│   ├── router.tsx          # Router configuration
│   └── index.css           # Global styles
│
├── docs/                   # Documentation
│   ├── README.md           # Docs overview
│   ├── USER_GUIDE.md       # User guide
│   ├── DEVELOPMENT.md      # Dev guide
│   ├── ARCHITECTURE.md     # Architecture docs
│   └── API.md              # API reference
│
├── public/                 # Static assets
├── .vscode/                # VS Code settings
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript config
├── tailwind.config.ts      # TailwindCSS config
├── postcss.config.mjs      # PostCSS config
├── eslint.config.js        # ESLint config
└── package.json            # Dependencies
```

## Getting Started

### Prerequisites
- **Node.js** 20+ (recommended: use nvm or fnm)
- **pnpm** 10+ (package manager)

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Setup environment variables:

Create `.env.local` file:
```env
VITE_API_BASE_URL=http://localhost:8081/api/v1
```

### Development

Start dev server:
```bash
pnpm dev
```

Server chạy tại: **http://localhost:5173**

Features:
- Hot Module Replacement (HMR)
- TypeScript type checking
- ESLint linting
- Fast refresh

### Build

Build for production:
```bash
pnpm build
```

Output folder: `dist/`

Preview production build:
```bash
pnpm serve
```

### Code Quality

Format code:
```bash
pnpm format
```

Lint and auto-fix:
```bash
pnpm lint
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8081/api/v1` | Yes |
| `VITE_APP_NAME` | Application name | `SmartPick` | No |
| `VITE_APP_VERSION` | Application version | `1.0.0` | No |

**Current Configuration** (`.env`):
```env
VITE_API_BASE_URL=http://localhost:8081/api/v1
VITE_APP_NAME=SmartPick
VITE_APP_VERSION=1.0.0
```

## API Integration & Backend Connection

### ✅ Currently Implemented APIs

Frontend đã được tích hợp hoàn chỉnh với Backend thông qua các API sau:

#### 1. **Authentication API**

**Endpoint:** `POST /api/v1/auth/login`

**Frontend Implementation:**
- **Hook:** `useLogin` (`src/modules/auth/hooks/useLogin.ts`)
- **API Client:** `apiClient` với ofetch
- **State Management:** Jotai atoms (tokenAtom, userAtom)

**Request:**
```typescript
{
  username: string,
  password: string,
  rememberMe?: boolean  // Extends token expiration to 30 days
}
```

**Response:**
```typescript
{
  token: string,        // JWT token
  user: {
    id: string,
    username: string,
    email: string,
    displayName: string,
    role: string,
    createdAt: string
  }
}
```

**Backend Processing:**
1. Nhận credentials từ frontend
2. **Query PostgreSQL:** SELECT từ bảng `app_users` WHERE username = ?
3. Verify password với bcrypt (compare với password_hash từ DB)
4. Generate JWT token với expiration (24h hoặc 720h nếu rememberMe)
5. Return token + user info

**PostgreSQL Tables Used:**
- `app_users` - Lưu thông tin user, password hash, role

**Flow Diagram:**
```
Frontend                API Client              Backend                 PostgreSQL
   │                        │                       │                        │
   │──Login Form Submit────>│                       │                        │
   │                        │──POST /auth/login────>│                        │
   │                        │                       │──SELECT * FROM────────>│
   │                        │                       │   app_users WHERE      │
   │                        │                       │   username=?           │
   │                        │                       │<──────User Data────────│
   │                        │                       │                        │
   │                        │                       │ (bcrypt verify)        │
   │                        │                       │ (generate JWT)         │
   │                        │<──{token, user}───────│                        │
   │<──Store token & user───│                       │                        │
   │                        │                       │                        │
   │──Navigate to /─────────>                       │                        │
```

**Success Example:**
```typescript
// Frontend sends
{
  username: "trangmaiq",
  password: "admin123",
  rememberMe: false
}

// Backend returns
{
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: {
    id: "aabfa0d6-b3be-4bf5-9d28-cc4956643625",
    username: "trangmaiq",
    email: "trangmai@smartpick.com",
    displayName: "Trang Mai",
    role: "admin",
    createdAt: "2025-01-15T10:30:00Z"
  }
}
```

#### 2. **Dataset API** (Partial Implementation)

**Base Path:** `/v1/*` (Protected - requires JWT)

**Implemented Endpoints:**

##### Create Dataset
- **Endpoint:** `POST /v1/datasets`
- **Status:** ✅ Working
- **Backend Processing:**
  1. Extract user ID từ JWT token (TODO: currently hardcoded)
  2. **INSERT PostgreSQL:** Vào bảng `datasets`
  3. Return dataset ID
- **PostgreSQL Tables Used:**
  - `datasets` - Lưu thông tin dataset (name, description, media type, created_by, timestamps)

**Request Example:**
```typescript
{
  name: "Cashew Dataset 001",
  description: "High quality cashew images",
  media: "image"
}
```

**Response:**
```typescript
{
  id: "550e8400-e29b-41d4-a716-446655440000"
}
```

##### Other Dataset Endpoints
- **GET /v1/datasets/:id** - ❌ Not Implemented (returns 501 Not Implemented)
- **PUT /v1/datasets/:id** - ❌ Not Implemented (returns 501 Not Implemented)
- **DELETE /v1/datasets/:id** - ❌ Not Implemented (returns 501 Not Implemented)

### 🔧 API Client Configuration

**Location:** `src/lib/api-client.ts`

**Features:**
```typescript
const apiClient = ofetch.create({
  baseURL: 'http://localhost:8081/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },

  // Request Interceptor - Auto-attach JWT token
  onRequest({ options }) {
    const token = localStorage.getItem('smartpick_token')
    if (token) {
      options.headers.Authorization = `Bearer ${token}`
    }
  },

  // Response Error Handler
  onResponseError({ response }) {
    if (response.status === 401) {
      // Auto-logout và redirect to login
      localStorage.removeItem('smartpick_token')
      window.location.href = '/login'
    }
  },
})
```

**Key Features:**
- ✅ Auto-attach Bearer token từ localStorage
- ✅ Auto-logout on 401 Unauthorized
- ✅ Centralized error handling
- ✅ Type-safe với TypeScript generics

### 🗄️ PostgreSQL Integration

Backend sử dụng **Bun ORM** để interact với PostgreSQL.

**Connection Details:**
```yaml
database:
  dsn: postgres://smartpick:smartpicksecurepassword@localhost:5432/smartpick?sslmode=disable
```

**Tables Currently Used by APIs:**

| Table | Purpose | Used By APIs | Fields |
|-------|---------|--------------|--------|
| `app_users` | User authentication & management | Login API | id, username, email, password_hash, role_id, display_name, created_at, disabled_at |
| `datasets` | Dataset metadata | Create Dataset API | id, name, description, media, created_by, created_at, updated_at, deleted_at |
| `roles` | RBAC roles | ❌ Not yet used | id, name, description, created_at |
| `permissions` | RBAC permissions | ❌ Not yet used | id, resource, action, description |
| `role_permissions` | Role-Permission mapping | ❌ Not yet used | role_id, permission_id |
| `dataset_verifications` | Dataset quality verification | ❌ Not yet used | dataset_id, user_id, verified_at, note |

**Database Queries:**

**Login API:**
```go
// src: internal/datastore/psql/user.go
ds.db.NewSelect().
  Model(&user).
  Where("username = ?", username).
  Where("disabled_at IS NULL").
  Scan(ctx)
```
Translates to:
```sql
SELECT * FROM app_users
WHERE username = ?
  AND disabled_at IS NULL
```

**Create Dataset API:**
```go
// src: internal/datastore/psql/dataset.go
d.db.NewInsert().
  Model(dataset).
  Returning("id").
  Exec(ctx)
```
Translates to:
```sql
INSERT INTO datasets (id, name, description, media, created_by, created_at, updated_at)
VALUES (?, ?, ?, ?, ?, NOW(), NOW())
RETURNING id
```

### 🔐 JWT Authentication Flow

**Token Generation (Backend):**
```go
claims := &Claims{
  UserID:   user.ID.String(),
  Username: user.Username,
  RegisteredClaims: jwt.RegisteredClaims{
    ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 24)),
    IssuedAt:  jwt.NewNumericDate(time.Now()),
    Issuer:    "smartpick",
  },
}
token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
tokenString, _ := token.SignedString([]byte(jwtSecret))
```

**Token Validation (Backend Middleware):**
```go
// internal/middleware/jwt.go
// Extract Bearer token from Authorization header
// Parse and validate token
// Add userID and username to context
c.Set("userID", claims.UserID)
c.Set("username", claims.Username)
```

**Token Usage (Frontend):**
```typescript
// Stored in localStorage
localStorage.setItem('smartpick_token', token)

// Auto-attached to all API requests
headers: {
  Authorization: `Bearer ${token}`
}
```

### 📊 API Testing Status

| Endpoint | Status | Frontend | Backend | Database | Notes |
|----------|--------|----------|---------|----------|-------|
| POST /api/v1/auth/login | ✅ Working | ✅ Implemented | ✅ Implemented | ✅ Connected | Full integration |
| POST /v1/datasets | ✅ Working | ⚠️ No UI | ✅ Implemented | ✅ Connected | Backend ready, need frontend UI |
| GET /v1/datasets/:id | ❌ Not Ready | ❌ No UI | ❌ Not Implemented | - | Planned |
| PUT /v1/datasets/:id | ❌ Not Ready | ❌ No UI | ❌ Not Implemented | - | Planned |
| DELETE /v1/datasets/:id | ❌ Not Ready | ❌ No UI | ❌ Not Implemented | - | Planned |

### 🚀 Testing the Integration

**1. Start Backend:**
```bash
cd smartpick-backend
docker compose -f build/docker/docker-compose.yml up -d  # Start PostgreSQL & MinIO
go run ./cmd/label                                       # Start backend server (port 8081)
```

**2. Start Frontend:**
```bash
cd smartpick-frontend
pnpm dev  # Starts on port 5173
```

**3. Test Login:**
- Navigate to http://localhost:5173/login
- Enter credentials:
  - Username: `trangmaiq`
  - Password: `admin123`
- Click "Sign In"
- Should redirect to dashboard với success toast

**4. Verify PostgreSQL:**
```bash
# Connect to database
docker exec -it smartpick-postgres psql -U smartpick -d smartpick

# Check user
SELECT * FROM app_users WHERE username = 'trangmaiq';

# Check datasets
SELECT * FROM datasets;
```

### 🔍 Debugging API Calls

**Browser DevTools:**
```javascript
// Check Network tab for API calls
// Request Headers should show:
{
  "Authorization": "Bearer eyJhbGc...",
  "Content-Type": "application/json"
}

// Check Console for errors
// Check Application > Local Storage for token
localStorage.getItem('smartpick_token')
```

**Backend Logs:**
```bash
# Terminal running go run ./cmd/label
# Shows:
# - HTTP requests: POST /api/v1/auth/login
# - Database queries
# - Errors
```

### 🛠️ Adding New API Integration

**Steps:**

**1. Backend:**
```go
// Add handler in internal/handler/yourmodule/
func (h *Handler) YourEndpoint() echo.HandlerFunc {
  return func(c echo.Context) error {
    // Get data from database
    data, err := h.dp.YourDatastore().Query(c.Request().Context())

    // Return response
    return c.JSON(http.StatusOK, data)
  }
}

// Add datastore method in internal/datastore/psql/
func (d *Datastore) Query(ctx context.Context) (*Model, error) {
  var result Model
  err := d.db.NewSelect().Model(&result).Scan(ctx)
  return &result, err
}

// Register route in internal/app/init.go
protected.GET("/your-endpoint", yourHandler.YourEndpoint())
```

**2. Frontend:**
```typescript
// Add endpoint in lib/endpoints.ts
export const API_ENDPOINTS = {
  YOUR_MODULE: {
    YOUR_ACTION: '/your-endpoint',
  },
}

// Create hook in modules/yourmodule/hooks/
export const useYourData = () => {
  return useQuery({
    queryKey: ['yourData'],
    queryFn: () => apiClient(API_ENDPOINTS.YOUR_MODULE.YOUR_ACTION),
  })
}

// Use in component
const { data, isLoading } = useYourData()
```

## Authentication Flow

### Login Process

1. User nhập username/password trong LoginForm
2. `useLogin` hook gửi request tới backend `/auth/login`
3. Backend trả về JWT token và user info
4. Token được lưu trong localStorage
5. User info được lưu trong Jotai atom
6. Redirect tới dashboard
7. Toast notification hiển thị success message

### Protected Routes

Routes trong `(main)` folder yêu cầu authentication:
- Check `isAuthenticatedAtom` state
- Nếu chưa login → redirect to `/login`
- Nếu đã login → render page

### API Requests

All API requests tự động:
- Attach `Authorization: Bearer <token>` header
- Handle 401 errors (auto-logout)
- Type-safe với TypeScript
- Centralized error handling

## State Management

### Global State (Jotai)

**Auth State** (`atoms/auth.ts`):
```typescript
tokenAtom          // JWT token (persisted in localStorage)
userAtom           // Current user info
isAuthenticatedAtom // Computed: token + user exists
```

**Viewport State** (`atoms/viewport.ts`):
```typescript
viewportAtom       // Window dimensions
```

### Server State (React Query)

**Mutations**:
- `useLogin` - Login mutation với success/error handling

**Queries** (future):
- Dataset queries
- Classification queries
- Stats queries

## UI Components Usage

### Button
```tsx
import { Button } from '~/components/ui/button/Button'

<Button variant="primary" size="md" isLoading={false}>
  Click me
</Button>
```

### Input
```tsx
import { Input } from '~/components/ui/input/Input'

<Input
  type="text"
  placeholder="Enter text"
  hasError={false}
/>
```

### Toast Notifications
```tsx
import { toast } from 'sonner'

toast.success('Success!', { description: 'Operation completed' })
toast.error('Error!', { description: 'Something went wrong' })
```

### Theme Toggle
```tsx
import { useIsDark, useSetTheme } from '~/hooks/common/useDark'

const isDark = useIsDark()
const setTheme = useSetTheme()

setTheme(isDark ? 'light' : 'dark')
```

## Styling Guidelines

### TailwindCSS Best Practices

1. **Use utility classes** cho styling:
   ```tsx
   <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
   ```

2. **Component variants** với CVA:
   ```tsx
   const buttonVariants = cva('base-classes', {
     variants: {
       variant: {
         primary: 'bg-blue-500 text-white',
         secondary: 'bg-gray-200 text-gray-900',
       }
     }
   })
   ```

3. **Dark mode** classes:
   ```tsx
   <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
   ```

4. **Responsive design**:
   ```tsx
   <div className="text-sm md:text-base lg:text-lg">
   ```

## Performance Optimization

### Implemented
- Code splitting với dynamic imports
- Tree shaking (Vite)
- Asset optimization
- React concurrent features
- Lazy component loading
- Optimized re-renders với Jotai

### Future Improvements
- [ ] Image optimization với `vite-plugin-image-optimizer`
- [ ] Bundle analysis
- [ ] Route-based code splitting
- [ ] Service Worker for offline support
- [ ] Progressive Web App (PWA)

## Common Development Tasks

### Adding New Page

1. Create file trong `src/pages/`:
   ```tsx
   // src/pages/dashboard.sync.tsx
   export default function Dashboard() {
     return <div>Dashboard</div>
   }
   ```

2. File-based routing tự động tạo route `/dashboard`

### Adding New API Endpoint

1. Add endpoint trong `lib/endpoints.ts`:
   ```typescript
   export const API_ENDPOINTS = {
     DATASETS: {
       LIST: '/datasets',
       CREATE: '/datasets',
     }
   }
   ```

2. Create hook trong module:
   ```typescript
   export const useDatasets = () => {
     return useQuery({
       queryKey: ['datasets'],
       queryFn: () => apiClient(API_ENDPOINTS.DATASETS.LIST)
     })
   }
   ```

### Adding New Component

1. Create component trong `components/ui/`:
   ```tsx
   // components/ui/card/Card.tsx
   export const Card = ({ children }) => {
     return <div className="bg-white rounded-lg shadow">{children}</div>
   }
   ```

2. Export from index:
   ```typescript
   export { Card } from './Card'
   ```

## Troubleshooting

### Hot Reload Not Working
```bash
# Clear Vite cache
rm -rf node_modules/.vite
pnpm dev
```

### Type Errors
```bash
# Restart TypeScript server in VS Code
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

### Build Errors
```bash
# Clear build cache
rm -rf dist
pnpm build
```

### Cannot Connect to Backend
- Check `VITE_API_BASE_URL` trong `.env.local`
- Verify backend running trên port 8081
- Check CORS settings trong backend

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari 15+
- Mobile browsers (iOS Safari, Chrome Android)

## Deployment

### Production Build
```bash
pnpm build
```

### Deploy to Vercel/Netlify
1. Connect GitHub repository
2. Set build command: `pnpm build`
3. Set output directory: `dist`
4. Add environment variables

### Deploy to Static Hosting
1. Build project
2. Upload `dist/` folder
3. Configure SPA fallback (redirect all to index.html)

## Testing (Future)

### Planned Testing Strategy
- [ ] Unit tests với Vitest
- [ ] Component tests với React Testing Library
- [ ] E2E tests với Playwright
- [ ] Visual regression tests

## What's Implemented So Far

### ✅ Completed Features
1. **Authentication System**
   - Login page với modern UI
   - JWT token management
   - Protected routes
   - Auto-logout on token expire

2. **UI Foundation**
   - Complete component library
   - Dark/Light theme
   - Responsive layouts
   - Toast notifications

3. **Developer Setup**
   - Vite build configuration
   - TypeScript strict mode
   - ESLint + Prettier
   - Git hooks
   - Path aliases

4. **State Management**
   - Jotai atoms setup
   - React Query integration
   - Persistent storage

5. **API Integration**
   - API client với interceptors
   - Endpoints structure
   - Type-safe requests

### 🚧 Work In Progress
- Dashboard page
- Dataset management
- Cashew classification UI
- Statistics dashboard

### 📋 Planned Features
- [ ] User profile management
- [ ] Dataset CRUD operations
- [ ] Image upload & preview
- [ ] Classification result visualization
- [ ] Real-time statistics
- [ ] Export functionality
- [ ] User settings page
- [ ] Admin panel
- [ ] Notification system
- [ ] Search & filters

## Contributing

### Code Style
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages
- Add TypeScript types
- Document complex logic

### Git Workflow
1. Create feature branch
2. Make changes
3. Run `pnpm lint` và `pnpm format`
4. Commit with descriptive message
5. Push and create PR

### Pre-commit Hooks
Auto-runs on `git commit`:
- Prettier format
- ESLint fix
- TypeScript check (in CI)

## Resources

### Documentation
- [Vite Documentation](https://vite.dev/)
- [React Documentation](https://react.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [Jotai Documentation](https://jotai.org/)
- [TanStack Query](https://tanstack.com/query)

### Component Libraries
- [Radix UI](https://www.radix-ui.com/)
- [Headless UI](https://headlessui.com/)
- [Lucide Icons](https://lucide.dev/)

### Learning Resources
- Template Docs: `docs/README.md`
- User Guide: `docs/USER_GUIDE.md`
- Development Guide: `docs/DEVELOPMENT.md`
- Architecture: `docs/ARCHITECTURE.md`

## License

MIT License - see LICENSE file for details

---

**Built with ❤️ by Delta X Team**

For questions or support, contact your team lead or check the documentation in the `docs/` folder.
