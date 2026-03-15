# Development ↔ Production Safety Guidelines

This document ensures development work never affects production.

## ✅ Environment Separation - VERIFIED

### Frontend
- **Development** (`.env`): `VITE_API_BASE_URL=http://localhost:3000/api`
- **Production** (`.env.production`): `VITE_API_BASE_URL=https://api.sfcpcsystem.com/api`
- **Git**: Both `.env` files are in `.gitignore` - SAFE ✅
- **Build**: Vite automatically uses correct env based on build mode:
  - `npm run dev` → uses `.env`
  - `npm run build` → uses `.env.production`

### Backend
- **Database**: Uses `DB_HOST` from `.env` (development RDS)
- **S3 Bucket**: Uses `AWS_BUCKET_NAME` from `.env` (development bucket)
- **CORS**: Uses `ALLOWED_ORIGINS` from `.env` (development origins)
- **Git**: `.env` is in `.gitignore` - SAFE ✅
- **No hardcoded URLs**: All configuration via environment variables ✅

## ✅ Configuration Safety - VERIFIED

### What's Safe in Git
```
✅ .env.example (placeholder values only)
✅ .env.production (production URLs only)
✅ Source code (no secrets, no hardcoded URLs)
✅ Package configs (vite.config.js, tsconfig, etc.)
```

### What's NOT in Git (Protected by .gitignore)
```
❌ .env (contains DB passwords, JWT secrets, AWS credentials)
❌ .env.production (should never be edited locally)
❌ *.log files (development logs)
❌ node_modules/ (dependencies)
```

## 🔒 Backend Protection

### Database
- Development: RDS `ls-968eb4b153d922f904a9957746c17caa0090cc5a.cbggkio0we39.ap-southeast-1.rds.amazonaws.com`
- Production: Different RDS instance (credentials in separate .env)
- **Safety**: Different database = no data leakage ✅

### S3 Bucket
- Development: `bucket-snp1g4`
- Production: Different bucket (if exists)
- **Safety**: Different bucket = no file leakage ✅

### CORS Origins
- Development: `http://localhost:5173`, `http://localhost:3000`
- Production: `https://www.sfcpcsystem.com`, `https://sfcpcsystem.com`, etc.
- **Safety**: Only relevant origins allowed per environment ✅

## 🔒 Frontend Protection

### API Base URL
- **Dev Mode** (`npm run dev`): `http://localhost:3000/api` ✅
- **Prod Build** (`npm run build`): `https://api.sfcpcsystem.com/api` ✅
- **Verification**: Vite automatically swaps based on build mode

### Token Storage
- Tokens stored in memory (not localStorage)
- Lost on page refresh
- **Safety**: Tokens don't persist across browsers ✅

## ⚠️ CRITICAL - What NOT To Do

### DON'T:
```
❌ Edit .env.production locally
❌ Commit .env file to git
❌ Use production database for development
❌ Use production S3 bucket for development
❌ Hardcode URLs in source code
❌ Run 'npm run build' in development environment
❌ Push to production branches (main, master) without review
```

### DO:
```
✅ Always use .env (local development only, in .gitignore)
✅ Run 'npm run dev' for development
✅ Only production builds use .env.production
✅ Keep .env.production in sync with actual production config
✅ Use feature branches for development
✅ Test thoroughly on localhost before production
```

## 🛡️ Pre-Production Checklist

Before deploying to production:

- [ ] All development on `macdev` or feature branch (NOT main/master)
- [ ] Run `npm run lint` in frontend-dev (no errors)
- [ ] Test on `http://localhost:3000` (backend) and `http://localhost:5173` (frontend)
- [ ] Verify `.env` file NOT committed to git
- [ ] Verify `.env.production` points to correct production API
- [ ] No console errors in browser DevTools
- [ ] No hardcoded localhost/IP addresses in code
- [ ] Database queries use parameterized syntax (prevent SQL injection)
- [ ] File uploads go to development S3 bucket (in dev environment)
- [ ] CORS headers only allow development origins (in dev environment)

## 🔄 Git Workflow

### Safe Development Flow
```bash
# 1. Create feature branch from current branch
git checkout -b feature/my-feature

# 2. Make changes (uses localhost:3000/api)
npm run dev          # Backend
npm run dev          # Frontend (in another terminal)

# 3. Test thoroughly locally
# (no data sent to production)

# 4. Commit changes
git add .
git commit -m "feat: Add my feature"

# 5. Push to remote
git push -u origin feature/my-feature

# 6. Create Pull Request to macdev (NOT main/master)
# Request code review

# 7. After approval, merge to macdev
# Production merge (main/master) happens separately
```

### Protected Branches
- `main` / `master` - Production deployments only
- `macdev` - Development integration branch
- Feature branches: `feature/*`, `bugfix/*`, `hotfix/*`

## 🚨 Environment Variables Summary

### Backend `.env` (Development)
```
DB_HOST=ls-968eb4b153d922f904a9957746c17caa0090cc5a.cbggkio0we39.ap-southeast-1.rds.amazonaws.com
DB_NAME=sfc_mes_db
AWS_BUCKET_NAME=bucket-snp1g4
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend `.env` (Development)
```
VITE_API_BASE_URL=http://localhost:3000/api
```

### Frontend `.env.production` (Deployment)
```
VITE_API_BASE_URL=https://api.sfcpcsystem.com/api
```

## 📋 Files to Review Regularly

1. **backend-dev/.gitignore** - Ensure `.env` is excluded
2. **frontend-dev/.gitignore** - Ensure `.env*` is excluded
3. **frontend-dev/.env.production** - Verify production API URL
4. **backend-dev/src/config/cors.js** - Verify CORS origins
5. **backend-dev/src/config/database.js** - Verify connection strings

## ✅ Verification

Run these commands to verify safety:

```bash
# Check git will ignore .env
git check-ignore backend-dev/.env frontend-dev/.env

# Check no secrets in git index
git grep -l "password\|secret\|key" -- '*.js' '*.json' | grep -v node_modules

# Check frontend .env production is correct
cat frontend-dev/.env.production

# Verify development API URL
grep VITE_API_BASE_URL frontend-dev/.env
```

## Questions?

If unsure about dev/prod separation, ask before:
- Modifying `.env` or `.env.production`
- Running production commands
- Pushing to main/master branches
- Changing database/S3 configuration
