# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start Commands

```bash
# Development
npm run dev              # Start Vite dev server (http://localhost:5173)
npm run build            # Build for production
npm run lint             # Run ESLint
npm run preview          # Preview production build locally

# Development notes
# - HMR (Hot Module Replacement) is enabled by default
# - Vite uses esbuild for fast transpilation
# - ES modules are required (type: "module" in package.json)
```

## Project Architecture

### Technology Stack
- **Framework**: React 18.2 + Vite
- **UI Library**: Material-UI (MUI) v5
- **State Management**: Redux Toolkit
- **Routing**: React Router v6 (lazy-loaded components)
- **Authentication**: React Context API (AuthProvider)
- **HTTP Client**: Axios with interceptors for token refresh
- **Styling**: Emotion (via MUI), CSS-in-JS
- **Forms**: Formik + Yup validation
- **Internationalization**: i18next
- **Charts**: ApexCharts
- **Linting**: ESLint with React rules
- **Code Format**: Prettier

### Directory Structure Overview
```
src/
├── components/          # Reusable React components
│   ├── forms/          # Form components (Formik-based)
│   ├── apps/           # App-specific features (chat, email, notes, etc.)
│   ├── dashboards/     # Dashboard layouts
│   ├── material-ui/    # MUI component demos
│   └── shared/         # Shared components (Header, Sidebar, etc.)
├── views/              # Page-level components
├── routes/             # Router configuration & ProtectedRoute wrapper
├── store/              # Redux slices and store configuration
│   ├── apps/           # Slices for chat, email, notes, tickets, etc.
│   └── customizer/     # Theme/UI customizer state
├── contexts/           # React Context (AuthContext for auth state)
├── layouts/            # Layout wrappers (FullLayout, BlankLayout)
├── theme/              # MUI theme configuration
├── utils/              # Helper utilities & API client
│   ├── api.js         # Axios instance with token refresh logic
│   └── i18n.js        # i18next configuration
├── App.jsx             # Root app component
└── main.jsx            # React DOM entry point
```

### Key Architectural Patterns

#### Authentication Flow
1. **AuthProvider** (contexts/AuthContext.js) manages:
   - User state and authentication status
   - Login/logout functions
   - Token storage and API initialization
2. **API Interceptor** (utils/api.js) automatically:
   - Attaches Bearer token to requests
   - Handles 401 errors by refreshing token
   - Queues failed requests during refresh
3. **ProtectedRoute** (routes/ProtectedRoute.js) guards authenticated routes

#### State Management
- **Redux Store** (store/Store.js) contains:
  - `customizer`: Theme settings, RTL mode
  - App-specific slices: chat, email, notes, tickets, contacts, eCommerce, blog, userProfile
- **Context API**: Used only for authentication (AuthContext)
- Access Redux state via `useSelector()`, dispatch actions with `useDispatch()`

#### User Roles
Application supports role-based logic with these roles:
- **Admin**: Full access
- **Manager**: Limited administrative access
- **Site User**: Basic user access
- Role is stored in user object after authentication

#### Component Loading
- Routes use React.lazy() with Loadable wrapper for code splitting
- Spinner component shows during lazy load with Suspense fallback
- Improves initial bundle size and page load performance

#### Theming System
- MUI ThemeProvider wraps entire app in App.jsx
- Custom theme defined in src/theme/Theme.js
- RTL support managed through RTL wrapper component
- Customizer state (Redux) controls theme switching

#### API Communication
- Axios instance configured with:
  - Base URL from `VITE_API_BASE_URL` env variable
  - Automatic Bearer token attachment
  - Automatic 401 token refresh with queue handling
  - withCredentials for cookie-based auth support
- Two instances: `api` (authenticated) and `publicApi` (public endpoints)

#### Mock API Setup
- Mock APIs configured via `src/_mockApis/` and Axios Mock Adapter
- Currently active: userprofile PostData, userprofile UsersData, language LanguageData
- Commented out: chat, email, notes, tickets, contacts, eCommerce, blog data
- Uses `mock.onAny().passThrough()` to allow real API calls to pass through
- Useful for development without backend: uncomment mocks as needed

## Environment Configuration

```bash
# .env (Currently configured for production)
VITE_API_BASE_URL=https://api.sfcpcsystem.com/api

# Alternative URLs (commented out in .env):
# VITE_API_BASE_URL=http://localhost:3000/api                    # Local dev
# VITE_API_BASE_URL=https://sfcpcbackend.ngrok.app/api           # Ngrok tunnel
# VITE_API_BASE_URL=http://54.251.182.137:3000/api              # EC2 instance
```

The `VITE_` prefix is required for Vite to expose env variables to the client.

### npm Configuration
`.npmrc` includes `legacy-peer-deps=true` for dependency resolution compatibility.

## Important Notes

### When Adding New Features
1. **New Pages**: Create in src/views/, add route to Router.js with Loadable(lazy()) wrapper
2. **New Global State**:
   - Add slice to store/apps/ or store/customizer/
   - Create `[Feature]Slice.js` with actions and reducers
   - Register in Store.js reducer object
3. **New Auth-Protected Features**: Wrap routes in ProtectedRoute or check `useAuth()` hook in component
4. **New API Endpoints**: Add helper functions to utils/api.js (e.g., `loginUser()`, `logoutUser()`)
5. **Component Reusability**: Place in components/shared/ if used across multiple features

### Redux Slice Structure
Each Redux app slice (store/apps/[app]/[AppName]Slice.js) contains:
- `initialState`: Data structure for that feature
- `reducers`: Synchronous state mutations
- `extraReducers`: Handle async thunk states (if using createAsyncThunk)
- Export slice.reducer to register in store

### Common Patterns
- Use `useAuth()` hook to access authentication state in components
- Use `useSelector()` for Redux state and `useDispatch()` for actions
- Lazy-load heavy components with Loadable(lazy(() => import(...)))
- Material-UI components are already imported in many component files
- Use Formik + Yup for form validation

### Known Issues / Caveats
- ESLint warnings for unused disable directives are treated as errors (--max-warnings 0)
- CASL (role-based access control) is installed but only used in demo page `RollbaseCASL.js` - not integrated into main app permission system yet
- Role-based access is currently simple (stored in user.role) - consider integrating CASL for more complex permission rules

### Build Optimization
- Vite automatically performs code splitting on routes
- SVG files are processed with SVGR (inline as React components)
- MP4 and MOV files included as assets
- esbuild is configured to treat .js files as JSX

## Testing & Validation

- **No test suite configured**: Use `npm test` if tests are added
- **Linting required before commits**: `npm run lint` checks for errors
- All components should follow React hooks rules (eslint-plugin-react-hooks)

## Development & Production Safety

### Environment Separation
- **Development**: `.env` uses `http://localhost:3000/api` (local backend)
- **Production**: `.env.production` uses `https://api.sfcpcsystem.com/api` (production backend)
- These are intentionally kept separate - do NOT mix them

### Branch Protection
- **Development branch**: `macdev` (where you work)
- **Production branches**: `main`, `master` (origin) - do NOT commit to these directly
- Always work on `macdev`, test thoroughly, then merge to main only after review

### Safe Development Workflow
1. Make changes on `macdev` branch only
2. Use `http://localhost:3000/api` for all local testing
3. Never modify `.env.production`
4. Before merging to main:
   - Run `npm run lint` to check for errors
   - Manually test against local backend
   - Get code review
5. Production builds automatically use `.env.production` (correct API URL)

### What Won't Affect Production
✅ Changes to `.env` (local only, not committed to main)
✅ Development branch commits (isolated on macdev)
✅ Local database/API tests (against localhost:3000)
✅ Modified mock data in src/_mockApis/ (dev only)

### What Could Affect Production (AVOID)
❌ Directly committing to `main` or `master` branches
❌ Modifying `.env.production`
❌ Changing production API URLs in source code
❌ Force pushing or rewriting git history

