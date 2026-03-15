#!/bin/bash

# Development/Production Safety Verification Script
# Run this to ensure dev won't affect production

echo "🔒 Development/Production Safety Verification"
echo "=============================================="
echo ""

ERRORS=0
WARNINGS=0

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: .env files in gitignore
echo "📋 Checking .gitignore for secrets..."
if grep -q "\.env" backend-dev/.gitignore && grep -q "\.env" frontend-dev/.gitignore; then
  echo -e "${GREEN}✅ .env files are in .gitignore${NC}"
else
  echo -e "${RED}❌ .env files NOT properly excluded from git${NC}"
  ERRORS=$((ERRORS + 1))
fi

# Check 2: Frontend dev environment
echo ""
echo "📋 Checking frontend development environment..."
if grep -q "VITE_API_BASE_URL=http://localhost:3000/api" frontend-dev/.env; then
  echo -e "${GREEN}✅ Frontend .env points to localhost:3000${NC}"
else
  echo -e "${RED}❌ Frontend .env NOT pointing to localhost${NC}"
  ERRORS=$((ERRORS + 1))
fi

# Check 3: Frontend production environment
echo ""
echo "📋 Checking frontend production environment..."
if grep -q "VITE_API_BASE_URL=https://api.sfcpcsystem.com/api" frontend-dev/.env.production; then
  echo -e "${GREEN}✅ Frontend .env.production points to api.sfcpcsystem.com${NC}"
else
  echo -e "${YELLOW}⚠️  Frontend .env.production may not be correctly configured${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

# Check 4: Backend .env not committed
echo ""
echo "📋 Checking if backend .env is tracked by git..."
if git check-ignore backend-dev/.env 2>/dev/null; then
  echo -e "${GREEN}✅ backend-dev/.env will be ignored by git${NC}"
else
  echo -e "${YELLOW}⚠️  backend-dev/.env status unclear (not a git repo?)${NC}"
fi

# Check 5: No hardcoded localhost in backend code
echo ""
echo "📋 Checking for hardcoded localhost in backend code..."
if grep -r "localhost" backend-dev/src --include="*.js" | grep -v "cors.js" | grep -v "// " > /dev/null 2>&1; then
  echo -e "${RED}❌ Found hardcoded localhost in backend code${NC}"
  grep -r "localhost" backend-dev/src --include="*.js" | grep -v "cors.js" | grep -v "// "
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ No hardcoded localhost in backend code${NC}"
fi

# Check 6: No hardcoded database URLs
echo ""
echo "📋 Checking for hardcoded database URLs..."
if grep -r "postgres://\|mysql://" backend-dev/src --include="*.js" > /dev/null 2>&1; then
  echo -e "${RED}❌ Found hardcoded database URLs${NC}"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ No hardcoded database URLs${NC}"
fi

# Check 7: Environment variables in use
echo ""
echo "📋 Checking environment variables..."
if grep -q "process.env.DB_HOST\|process.env.VITE_API_BASE_URL" backend-dev/src/config/database.js frontend-dev/src/utils/api.js; then
  echo -e "${GREEN}✅ Using environment variables for configuration${NC}"
else
  echo -e "${YELLOW}⚠️  May not be using env variables properly${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

# Check 8: .env.example exists
echo ""
echo "📋 Checking for .env.example..."
if [ -f "backend-dev/.env.example" ]; then
  echo -e "${GREEN}✅ backend-dev/.env.example exists${NC}"
else
  echo -e "${YELLOW}⚠️  backend-dev/.env.example NOT found${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

# Summary
echo ""
echo "=============================================="
echo "Safety Check Summary:"
echo "  Errors:   $ERRORS"
echo "  Warnings: $WARNINGS"

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ All critical checks passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ Critical errors found - review above${NC}"
  exit 1
fi
