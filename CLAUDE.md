# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SFC-MES-SYSTEM-DEV** is a Manufacturing Execution System (MES) for precast concrete construction projects. It's a full-stack monorepo with a React frontend and Node.js/Express backend.

- **Purpose**: Manage construction projects, sections, components, and activities
- **Repository Structure**: Two independent sub-projects
  - `backend-dev/` - REST API (Node.js, Express, PostgreSQL)
  - `frontend-dev/` - Web UI (React, Vite, MUI)

## Monorepo Structure

```
SFC-MES-SYSTEM-DEV/
├── backend-dev/       # Node.js/Express REST API
│   ├── src/
│   │   ├── routes/    # API endpoints
│   │   ├── controllers/
│   │   ├── queries/   # Database operations
│   │   ├── config/    # DB, CORS, auth config
│   │   ├── middleware/ # JWT auth, logging
│   │   └── utils/     # Logging utilities
│   ├── package.json
│   └── CLAUDE.md      # Backend-specific guidance
│
└── frontend-dev/      # React + Vite SPA
    ├── src/
    │   ├── components/
    │   ├── views/     # Page components
    │   ├── routes/    # Router config
    │   ├── store/     # Redux state
    │   ├── contexts/  # Auth context
    │   └── utils/     # API client, i18n
    ├── package.json
    └── CLAUDE.md      # Frontend-specific guidance
```

## Quick Start Commands

### Backend Setup
```bash
cd backend-dev

# Install dependencies
npm install

# Start development server (port 3000, watches src/)
npm run dev

# Production server
npm start

# Generate JWT secret
node generateSecret.js
```

**For detailed backend commands and architecture, see [backend-dev/CLAUDE.md](backend-dev/CLAUDE.md)**

### Frontend Setup
```bash
cd frontend-dev

# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

**For detailed frontend commands and architecture, see [frontend-dev/CLAUDE.md](frontend-dev/CLAUDE.md)**

## Architecture Overview

### Frontend → Backend Communication

The frontend communicates with the backend via REST API calls:

1. **Authentication Flow**:
   - User logs in via `POST /api/auth/login` (sends username/password)
   - Backend returns JWT token (4-hour expiry)
   - Frontend stores token and includes it in subsequent requests: `Authorization: Bearer <token>`
   - Axios interceptor (utils/api.js) automatically attaches token and handles 401 refresh

2. **API Configuration** (frontend):
   - Base URL controlled by `.env` variables (`VITE_API_BASE_URL`)
   - Development: `http://localhost:3000/api` (local backend)
   - Production: `https://api.sfcpcsystem.com/api` (live backend)

3. **Core Endpoints** (backend):
   - `POST /api/auth/login` - User authentication
   - `GET /api/auth/me` - Current user info
   - `POST /api/projects` - Create project
   - `GET /api/projects` - List projects
   - `POST /api/components/:componentId/upload-file` - Upload files to S3

### Technology Stack Integration

**Backend**: Express.js + PostgreSQL + AWS S3
- Parameterized SQL queries (no ORM)
- JWT authentication
- Helmet for security headers
- Winston for logging
- Connection pooling (max 20 connections)

**Frontend**: React + Redux + MUI
- Redux Toolkit for state management
- Material-UI v5 for components
- Axios for HTTP with token refresh interceptor
- React Router v6 for navigation
- Formik + Yup for form validation
- i18next for internationalization

### Database

PostgreSQL tables defined in `backend-dev/DATABASE_SCHEMA.md` and `backend-dev/sfc_mes_schema.sql`:

**Key Entities**:
- `users` - User accounts with roles
- `projects` - Construction projects
- `sections` - Project sections with status
- `components` - Construction components (dimensions, area, volume)
- `component_files` - S3 file attachments with revision tracking
- `component_status_history` - Audit trail of status changes
- `component_activities` - Activity log (welding, painting, inspection, etc.)

All tables use UUID primary keys and include `created_at`/`updated_at` timestamps.

## Development Workflow

### Adding a New Feature (Full Stack)

1. **Backend**:
   - Add route in `src/routes/` with input validation
   - Create controller in `src/controllers/` with business logic
   - Create query functions in `src/queries/` for database operations
   - Register route in `src/index.js`
   - Use parameterized queries to prevent SQL injection

2. **Frontend**:
   - Add Redux slice in `store/` if state needed
   - Create component in `components/` (or view in `views/` if it's a page)
   - Add API helper in `utils/api.js` if new endpoint needed
   - Add route in `routes/Router.js` if new page
   - Use AuthProvider hooks for auth-dependent features

### Common Tasks

**Running both services together**:
```bash
# Terminal 1
cd backend-dev && npm run dev

# Terminal 2
cd frontend-dev && npm run dev

# Access frontend at http://localhost:5173
# API accessible at http://localhost:3000/api
```

**Testing API endpoint**:
```bash
# Backend must be running (port 3000)
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Linting frontend**:
```bash
cd frontend-dev && npm run lint
```

## Key Architectural Decisions

### Backend Patterns
- **No ORM**: Direct SQL queries in `src/queries/` directory
- **Database pooling**: 20 max connections, 30s idle timeout
- **Parameterized queries**: Always use `$1`, `$2` syntax to prevent SQL injection
- **MVC structure**: Clear separation between routes → controllers → queries
- **Logging**: Winston configured with file output (app.log, error.log)
- **Authentication**: Optional JWT middleware - requests without tokens get `req.user = null`

### Frontend Patterns
- **Code splitting**: Routes lazy-loaded with React.lazy() for smaller initial bundle
- **State management**: Redux for app state, Context API for authentication only
- **API client**: Axios with interceptor for automatic token refresh on 401
- **Styling**: MUI components with Emotion (CSS-in-JS)
- **Protected routes**: ProtectedRoute wrapper checks authentication before rendering

### Security Considerations
- **Backend**:
  - Helmet middleware sets security headers (CSP, HSTS, etc.)
  - CORS configured in `src/config/cors.js` - verify `ALLOWED_ORIGINS` matches frontend
  - bcrypt for password hashing (10 rounds)
  - JWT secrets should be strong and rotated regularly
  - `.env` contains secrets - ensure it's in .gitignore

- **Frontend**:
  - JWT stored in memory (not localStorage) - lost on page refresh
  - ProtectedRoute prevents unauthorized access to pages
  - No sensitive data in frontend code

### Environment Separation
- **Development**: Each developer uses `http://localhost:3000/api` for backend
- **Production**: Uses `https://api.sfcpcsystem.com/api`
- **Frontend .env**: `VITE_API_BASE_URL` controls API target
- **Branch strategy**: Develop on `macdev` branch, avoid direct commits to `main`/`master`

## Important Gotchas & Best Practices

### Database Operations (Backend)
- **Always release clients**: Use try-catch-finally to ensure `client.release()`
- **Transactions**: Manual client management for multi-step operations
- **Connection pool**: Max 20 connections - avoid connection leaks

### API Integration (Frontend)
- **Token refresh**: Axios interceptor automatically handles 401s
- **Failed requests queue**: Requests made during token refresh are queued and retried
- **Two API instances**: `api` (authenticated) and `publicApi` (for login/signup)

### File Uploads
- **Size limit**: 5MB per file
- **Types allowed**: PDF, JPEG, PNG, GIF, WebP
- **Storage**: AWS S3 with UUID-based filenames
- **Versioning**: Component files support revision tracking

### Code Style
- **Backend**: CommonJS (`require`/`module.exports`), async/await, 2-space indent
- **Frontend**: ES modules, React hooks, arrow functions, 2-space indent
- **Variables**: camelCase, PascalCase for classes, UPPER_SNAKE_CASE for constants

## Debugging Tips

### Backend Logs
- **Location**: `app.log` and `error.log` (in `.gitignore`)
- **Format**: Winston structured logging with timestamps
- **Check for**: Database errors, validation failures, stack traces

### Frontend Debugging
- **Browser DevTools**: Redux DevTools extension available
- **Network tab**: Check API requests, response status, headers
- **Console**: Redux actions dispatch and state changes logged
- **Vite HMR**: Check browser console for reload messages

### Common Issues
- **API 401 errors**: Token expired - check token refresh logic in utils/api.js
- **CORS errors**: Verify `ALLOWED_ORIGINS` in backend/src/config/cors.js matches frontend URL
- **Database connection timeout**: Check pool settings in backend/src/config/database.js
- **Port conflicts**: Backend uses 3000, frontend uses 5173

## Development Safety

**IMPORTANT**: Development work must never affect production. See [DEV_PROD_SAFETY.md](DEV_PROD_SAFETY.md) for:
- Environment separation verification
- Safe development workflow
- Pre-production checklist
- Files protected in .gitignore

**Quick Rules**:
- Always use local `.env` (in `.gitignore`)
- Development frontend uses `http://localhost:3000/api`
- Production frontend uses `https://api.sfcpcsystem.com/api`
- Different databases: development RDS vs production RDS
- Different S3 buckets: development vs production
- Work on `macdev` branch, never directly commit to `main`/`master`

## For Detailed Information

- **Backend architecture, commands, and conventions**: See [backend-dev/CLAUDE.md](backend-dev/CLAUDE.md)
- **Frontend architecture, commands, and conventions**: See [frontend-dev/CLAUDE.md](frontend-dev/CLAUDE.md)
- **Development/Production Safety**: See [DEV_PROD_SAFETY.md](DEV_PROD_SAFETY.md)
- **Database schema**: See [backend-dev/DATABASE_SCHEMA.md](backend-dev/DATABASE_SCHEMA.md)
- **Backend structure**: See [backend-dev/project_structure.json](backend-dev/project_structure.json)
