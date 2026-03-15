# SFC MES Backend - Agent Documentation

## Project Overview

SFC MES Backend is a Manufacturing Execution System (MES) API for SFC Precast System. It is a Node.js/Express REST API that manages construction projects, sections, components, user authentication, and file storage for precast concrete manufacturing.

**Project Name:** sfc-mes-backend  
**Version:** 1.0.0  
**Author:** Anu S  
**License:** MIT

## Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (with `pg` driver)
- **Authentication:** JWT (jsonwebtoken)
- **File Storage:** AWS S3 (@aws-sdk/client-s3)
- **Security:** Helmet, CORS, bcrypt
- **Logging:** Winston
- **Validation:** express-validator
- **File Upload:** Multer
- **Dev Tools:** Nodemon, Babel

## Project Structure

```
src/
├── config/           # Configuration files
│   ├── cors.js       # CORS configuration
│   ├── database.js   # PostgreSQL connection pool
│   ├── databaseInit.js # Database table initialization
│   └── env.js        # Environment variables
├── controllers/      # Route controllers (business logic)
│   ├── authController.js
│   ├── componentController.js
│   ├── otherComponentController.js
│   ├── projectController.js
│   ├── roleController.js
│   ├── sectionController.js
│   └── userController.js
├── middleware/       # Express middleware
│   ├── auth.js       # JWT authentication
│   ├── logger.js     # Request logging
│   ├── optionalAuth.js
│   └── uploadMiddleware.js
├── models/           # Data models (User class)
│   ├── project.js
│   └── user.js
├── queries/          # Database query functions
│   ├── componentQueries.js
│   ├── otherComponentQueries.js
│   ├── projectQueries.js
│   ├── roleQueries.js
│   ├── sectionQueries.js
│   └── userQueries.js
├── routes/           # API route definitions
│   ├── authRoutes.js
│   ├── componentRoutes.js
│   ├── downloadRoutes.js
│   ├── otherComponentRoutes.js
│   ├── projectRoutes.js
│   ├── roleRoutes.js
│   ├── sectionRoutes.js
│   ├── uploadRoutes.js
│   └── userRoutes.js
├── utils/            # Utility functions
│   └── Logger.js     # Winston logger configuration
└── index.js          # Application entry point
```

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
DB_PORT=5432

# JWT
JWT_SECRET=your-super-secret-jwt-key

# AWS S3
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BUCKET_NAME=your-bucket-name

# CORS
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com
```

**Note:** Use `generateSecret.js` to generate a secure JWT secret:
```bash
node generateSecret.js
```

## Build and Run Commands

```bash
# Install dependencies
npm install

# Development (with hot reload)
npm run dev

# Production start
npm start

# Build with Babel
npm run build
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/check-token` - Validate token

### Projects
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Sections
- `GET /api/sections/project/:projectId` - Get sections by project
- `POST /api/sections` - Create section
- `PUT /api/sections/:id` - Update section
- `DELETE /api/sections/:id` - Delete section

### Components
- `GET /api/components/project/:projectId` - Get components by project
- `GET /api/components/:id` - Get component by ID
- `POST /api/components` - Create component (auth required)
- `POST /api/components/batch` - Batch create components (auth required)
- `PUT /api/components/:id` - Update component
- `PUT /api/components/:id/status` - Update status (public)
- `PUT /api/components/:id/status-auth` - Update status (auth required)
- `DELETE /api/components/:id` - Delete component (auth required)
- `POST /api/components/:componentId/upload-file` - Upload file (auth required)

### Users & Roles
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/roles` - List roles

### File Operations
- `GET /api/download/:filename` - Download files
- `POST /api/upload` - Upload files

## Database Schema

### Core Tables

**users** - User accounts
- `id` (UUID, PK)
- `username` (VARCHAR, unique)
- `password_hash` (VARCHAR)
- `email` (VARCHAR, unique)
- `role_id` (UUID, FK to roles)
- `status` (ENUM: active, inactive)
- `created_at`, `updated_at` (TIMESTAMP)

**roles** - User roles
- `id` (UUID, PK)
- `name` (VARCHAR, unique)
- `description` (TEXT)

**projects** - Construction projects
- `id` (UUID, PK)
- `name` (VARCHAR)
- `description` (TEXT)
- `created_by` (UUID, FK to users)

**sections** - Project sections
- `id` (UUID, PK)
- `project_id` (UUID, FK to projects)
- `name` (VARCHAR)
- `status` (ENUM: planning, in progress, completed, on hold)

**components** - Construction components
- `id` (UUID, PK)
- `section_id` (UUID, FK to sections)
- `name`, `type` (VARCHAR)
- `width`, `height`, `thickness` (INT)
- `extension`, `reduction`, `area`, `volume`, `weight` (FLOAT)
- `status` (VARCHAR)

**component_files** - File attachments
- `id` (UUID, PK)
- `component_id` (UUID, FK)
- `s3_url` (VARCHAR)
- `revision` (INT)

**component_status_history** - Status change tracking
- `id` (UUID, PK)
- `component_id` (UUID, FK)
- `status` (VARCHAR)
- `updated_by` (UUID, FK to users)
- `updated_at` (TIMESTAMP)

See `DATABASE_SCHEMA.md` and `sfc_mes_schema.sql` for complete schema details.

## Code Style Guidelines

### JavaScript Conventions
- Use CommonJS (`require`/`module.exports`) - not ES modules
- Use camelCase for variables and functions
- Use PascalCase for class names (e.g., `User`)
- Use UPPER_SNAKE_CASE for constants
- Indent with 2 spaces

### Async Patterns
- Use `async/await` for asynchronous operations
- Wrap database queries in try-catch blocks
- Always release database clients in finally blocks

Example:
```javascript
const client = await db.getClient();
try {
  await client.query('BEGIN');
  // ... operations
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

### Database Queries
- Use parameterized queries (`$1`, `$2`, etc.) to prevent SQL injection
- Place SQL queries in the `queries/` directory
- Use the `db.query()` helper from `config/database.js`

## Authentication

The API uses JWT Bearer tokens for authentication:

1. Obtain token via `POST /api/auth/login`
2. Include token in requests: `Authorization: Bearer <token>`
3. Token expires in 4 hours
4. Use `/api/auth/refresh` to get a new token

The `auth` middleware validates tokens and attaches user info to `req.user`.

## File Upload

Files are uploaded to AWS S3:
- Maximum file size: 5MB
- Allowed types: PDF, JPEG, PNG, GIF, WebP
- Files are stored with UUID-based names
- Component files support versioning (revision numbers)

## Error Handling

- Controllers catch errors and return appropriate HTTP status codes
- Database errors are logged with Winston
- 500 errors include error message in development

## Security Considerations

- **Helmet** middleware sets security headers
- **CORS** is configured for specific allowed origins
- **bcrypt** is used for password hashing (10 rounds)
- JWT secrets should be strong and rotated regularly
- Database connections use SSL with `rejectUnauthorized: false` for AWS RDS compatibility
- File uploads are restricted by MIME type and size

## Testing

Currently, no test suite is configured. The test script in package.json is a placeholder:
```json
"test": "echo \"Error: no test specified\" && exit 1"
```

## Deployment Notes

1. Set `NODE_ENV=production` in production
2. Configure proper CORS origins for production domains
3. Ensure database SSL settings match your provider
4. Set up CloudWatch or similar for log aggregation
5. The application automatically creates required tables on startup

## Development Workflow

1. Copy `.env` and configure your environment
2. Run `npm install`
3. Run `npm run dev` for development with hot reload
4. Nodemon watches `src/` directory for changes

## Troubleshooting

- **Database connection errors:** Check DB_HOST, DB_PORT, and SSL settings
- **CORS errors:** Verify ALLOWED_ORIGINS includes your frontend URL
- **S3 upload failures:** Check AWS credentials and bucket permissions
- **JWT errors:** Ensure JWT_SECRET is set and not expired
