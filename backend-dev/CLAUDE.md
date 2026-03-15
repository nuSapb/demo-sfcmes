# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SFC MES Backend** - A Manufacturing Execution System (MES) API for precast concrete construction projects. Node.js/Express REST API that manages projects, sections, components, user authentication, and file storage.

- **Runtime:** Node.js
- **Main Framework:** Express.js
- **Database:** PostgreSQL
- **Entry Point:** [src/index.js](src/index.js)

## Development Commands

```bash
# Install dependencies
npm install

# Development server with hot reload (watches src/ directory)
npm run dev

# Production server
npm start

# Build with Babel (outputs to dist/)
npm run build

# Generate secure JWT secret
node generateSecret.js
```

## Architecture Overview

The application follows an MVC-like structure with clear separation of concerns:

### Core Layers

1. **Routes** ([src/routes/](src/routes/)) - API endpoint definitions and input validation
2. **Controllers** ([src/controllers/](src/controllers/)) - Business logic and request handling
3. **Queries** ([src/queries/](src/queries/)) - Database query functions with parameterized queries
4. **Config** ([src/config/](src/config/)) - Database pool, CORS, environment variables, initialization
5. **Middleware** ([src/middleware/](src/middleware/)) - JWT auth, request logging, file uploads
6. **Utils** ([src/utils/](src/utils/)) - Winston logger configuration

### Database Connection Pattern

Database uses a connection pool (`src/config/database.js`) with these patterns:

```javascript
// For simple queries - client is auto-released
const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

// For transactions - manual client management
const client = await db.getClient();
try {
  await client.query('BEGIN');
  // ... operations
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();  // ALWAYS release in finally block
}
```

**Key points:**
- All queries use parameterized syntax (`$1`, `$2`, etc.) to prevent SQL injection
- Place SQL queries in `src/queries/` directory
- Always handle database client cleanup in finally blocks
- Pool settings: max 20 connections, 30s idle timeout, 2s connection timeout

### Authentication Flow

JWT Bearer token authentication via [src/middleware/auth.js](src/middleware/auth.js):

1. Client obtains token via `POST /api/auth/login`
2. Client includes token in requests: `Authorization: Bearer <token>`
3. Middleware validates token and attaches decoded user to `req.user`
4. Token validity: 4 hours (check `authController.js` for exact expiry)
5. Use `/api/auth/refresh` endpoint for new tokens

The auth middleware is **optional** - requests without valid tokens proceed with `req.user = null`, allowing public endpoints.

### File Upload & Storage

Files are stored in AWS S3 via `@aws-sdk/client-s3`:

- **File constraints:** Max 5MB, types: PDF, JPEG, PNG, GIF, WebP
- **Naming:** UUID-based to avoid collisions
- **Versioning:** Component files support revision numbers
- **Upload endpoints:** `POST /api/upload`, `POST /api/components/:componentId/upload-file`
- **Configuration:** [src/config/databaseInit.js](src/config/databaseInit.js) handles middleware setup

### Logging

[src/utils/Logger.js](src/utils/Logger.js) uses Winston for structured logging:

- Logs are written to console and files (app.log, error.log)
- All database errors automatically logged with query context
- Request/response logging includes headers, body, duration, status code
- Database query timing tracked and logged

**Note:** *.log files are in .gitignore - check combined.log for historical logs

## Code Conventions

**JavaScript Style:**
- CommonJS modules (`require`/`module.exports`) - not ES6 modules
- camelCase for variables and functions
- PascalCase for class names (e.g., `User`)
- UPPER_SNAKE_CASE for constants
- 2-space indentation

**Async Patterns:**
- Use `async/await` exclusively (no `.then()` chains)
- Wrap database operations in try-catch
- Always release database clients in finally blocks (see pattern above)

**Database Queries:**
- All queries must be parameterized (`$1`, `$2`) to prevent SQL injection
- Place query functions in `src/queries/` directory
- Import and call via `db.query()` from `src/config/database.js`
- Example: `const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);`

## Database Schema

Core entities defined in [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) and [sfc_mes_schema.sql](sfc_mes_schema.sql):

**Key Tables:**
- **users** - User accounts with roles (id, username, email, password_hash, role_id, status)
- **roles** - User roles with permission management
- **projects** - Construction projects (id, name, description, created_by)
- **sections** - Project sections (status: planning/in progress/completed/on hold)
- **components** - Construction components with dimensions, area, volume
- **component_files** - S3 file attachments with revision tracking
- **component_status_history** - Audit trail of component status changes
- **component_activities** - Activity log (welding, painting, inspection, etc.)

All tables use UUID primary keys and include `created_at`/`updated_at` timestamps.

## Important Notes

### Security Considerations

- **Helmet middleware** sets security headers (CSP, HSTS, etc.)
- **CORS** configured via `src/config/cors.js` - verify `ALLOWED_ORIGINS` matches your frontend
- **bcrypt** hashing for passwords (10 rounds)
- **Database SSL:** Configured with `rejectUnauthorized: false` for AWS RDS compatibility
- **JWT secrets** should be strong and rotated regularly
- **.env file:** Contains sensitive data - ensure it's in .gitignore and never commit

### New Routes/Controllers

When adding new features:

1. Create route file in `src/routes/` with input validation
2. Create controller file in `src/controllers/` with business logic
3. Create query functions in `src/queries/` for database operations
4. Register route in [src/index.js](src/index.js) with `app.use('/api/endpoint', routeFile)`
5. Use parameterized queries and handle errors with try-catch

### Database Initialization

[src/config/databaseInit.js](src/config/databaseInit.js) automatically creates tables on server startup. This function is called in `startServer()` before the app listens. Do not manually run schema files - rely on `createTablesIfNotExist()`.

### Logging Location

- **Application logs:** Written to `app.log` (excluded from git)
- **Error logs:** Written to `error.log` (excluded from git)
- **Winston config:** [src/utils/Logger.js](src/utils/Logger.js)
- **Request logging:** Middleware in `src/index.js` logs all requests with headers, body, duration

## Current Status

**Cleanup needed:**
- `.env` file is committed (contains secrets) - should use .env.example instead
- Backup files exist in git (old controller copies, query backups) - can be deleted if not needed
- Test script in package.json is placeholder - no actual tests configured

**Recent additions:**
- Analytics routes and controller
- Material price routes and controller
- Assignment of projects to users feature
- Calculation logic for other components

## Testing

No test framework currently configured. To add tests, update `package.json` scripts and consider Jest or Mocha.

