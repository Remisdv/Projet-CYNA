# 🚀 CYNA API - Testing & Setup Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Starting the Services](#starting-the-services)
4. [Database Seeding](#database-seeding)
5. [Testing with Postman](#testing-with-postman)
6. [Testing with cURL](#testing-with-curl)
7. [Test Credentials](#test-credentials)
8. [Common Issues & Solutions](#common-issues--solutions)

---

## Prerequisites

- Node.js v18+ and yarn/npm
- PostgreSQL 12+
- Docker (optional, for running PostgreSQL)
- Postman (for API testing)
- Terminal/Command Prompt

---

## Environment Setup

### 1. Create `.env` files for each API

Copy the `.env.example` files and create `.env` files in each API directory:

```bash
# BO API
cp service/api/cyna-bo-api/.env.example service/api/cyna-bo-api/.env

# Service API
cp service/api/cyna-service-api/.env.example service/api/cyna-service-api/.env

# Gateway API
cp service/api/cyna-gateway-api/.env.example service/api/cyna-gateway-api/.env
```

### 2. Update .env files with your local settings

**cyna-bo-api/.env:**
```
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://postgres:password@localhost:5432/cyna_bo_db
JWT_SECRET=super-secret-development-key-must-be-32-chars-min!!
SERVICE_API_HOST=localhost
SERVICE_API_PORT=3002
```

**cyna-service-api/.env:**
```
NODE_ENV=development
PORT=3002
CORS_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://postgres:password@localhost:5432/cyna_service_db
BO_API_HOST=localhost
BO_API_PORT=3001
```

**cyna-gateway-api/.env:**
```
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
BO_API_HOST=localhost
BO_API_PORT=3001
BO_API_URL=http://localhost:3001
SERVICE_API_HOST=localhost
SERVICE_API_PORT=3002
SERVICE_API_URL=http://localhost:3002
JWT_SECRET=super-secret-development-key-must-be-32-chars-min!!
```

### 3. Create PostgreSQL databases

```bash
# Using psql
psql -U postgres -c "CREATE DATABASE cyna_bo_db;"
psql -U postgres -c "CREATE DATABASE cyna_service_db;"

# Or using Docker
docker run --name postgres-cyna -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres:15
docker exec postgres-cyna psql -U postgres -c "CREATE DATABASE cyna_bo_db;"
docker exec postgres-cyna psql -U postgres -c "CREATE DATABASE cyna_service_db;"
```

### 4. Install dependencies

```bash
cd service/api/cyna-bo-api && yarn install
cd ../cyna-service-api && yarn install
cd ../cyna-gateway-api && yarn install
```

---

## Starting the Services

**Terminal 1 - BO API (port 3001):**
```bash
cd service/api/cyna-bo-api
yarn start:dev
```

**Terminal 2 - Service API (port 3002):**
```bash
cd service/api/cyna-service-api
yarn start:dev
```

**Terminal 3 - Gateway API (port 3000):**
```bash
cd service/api/cyna-gateway-api
yarn start:dev
```

You should see:
```
CYNA Back-Office API is running on port 3001
CYNA Service API is running on port 3002
CYNA Gateway API is running on port 3000
```

---

## Database Seeding

### Seed Users (in cyna-bo-api)

```bash
cd service/api/cyna-bo-api
yarn seed:users
```

**Expected output:**
```
🌱 Starting Users seed...
✅ Created user: admin@cyna.fr
✅ Created user: user1@cyna.fr
✅ Created user: user2@cyna.fr
✅ Created user: user3@cyna.fr
✅ Created user: user4@cyna.fr
✨ Users seed completed successfully!
```

### Seed Services & Categories (in cyna-service-api)

```bash
cd service/api/cyna-service-api
yarn seed:services
```

**Expected output:**
```
🌱 Starting Services and Categories seed...
✅ Created category: Cybersécurité
✅ Created category: Audit de sécurité
✅ Created category: Conformité
✅ Created category: Formation
✅ Created service: Threat Intelligence
✅ Created service: EDR - Endpoint Detection and Response
... (more services)
✨ Services and Categories seed completed successfully!
```

---

## Testing with Postman

### Import the Collection

1. Open Postman
2. Click **Import** button
3. Select file: `CYNA_API_Collection.postman_collection.json`
4. Collection imported successfully! ✅

### Set Variables

In Postman, go to **Collections** → **CYNA API Collection** → **Variables**:

- `auth_token`: Will be set after login (see below)
- `category_id`: Set to a category UUID from seed
- `service_id`: Set to a service UUID from seed

### Test Workflow

#### Step 1: Login (Get Auth Token)

1. Open **Authentication → BO Login**
2. Click **Send**
3. Response should be:
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "admin@cyna.fr",
    "firstName": "Admin",
    "lastName": "CYNA",
    "role": "ADMIN",
    "status": "ACTIVE"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
4. Copy the `token` value
5. In Variables, set `auth_token` to the token value

#### Step 2: Test User Management

1. **Get All Users**: Click **Users Management → Get All Users**
2. **Get User by ID**: Click **Users Management → Get User by ID** (uses ID 1)
3. **Create User**: Click **Users Management → Create User**
4. **Update User**: Click **Users Management → Update User** (updates ID 2)
5. **Reset Password**: Click **Users Management → Reset User Password**

#### Step 3: Test Categories & Services

1. **Get All Categories**: Click **Categories → Get All Categories**
2. **Get All Services**: Click **Services → Get All Services**
3. **Create/Update/Delete**: Use respective endpoints

---

## Testing with cURL

### 1. Login and Get Token

```bash
curl -X POST http://localhost:3000/api/bo/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cyna.fr",
    "password": "TempPassword123!"
  }'
```

**Save the returned token value for subsequent requests**

### 2. Get All Users (with token)

```bash
curl -X GET "http://localhost:3000/api/bo/users?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Get All Categories

```bash
curl -X GET http://localhost:3000/api/categories
```

### 4. Get All Services with Filters

```bash
curl -X GET "http://localhost:3000/api/services?page=1&limit=10&status=publié"
```

### 5. Create a New User

```bash
curl -X POST http://localhost:3000/api/bo/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "email": "test@cyna.fr",
    "firstName": "Test",
    "lastName": "User",
    "role": "USER",
    "status": "ACTIVE"
  }'
```

### 6. Create a New Service

```bash
curl -X POST http://localhost:3000/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "nom": "New Security Service",
    "categoryId": "CATEGORY_UUID_HERE",
    "description": "Complete service description",
    "statut": "brouillon",
    "meta_title": "SEO Title",
    "meta_description": "SEO description",
    "keywords": "security, protection"
  }'
```

### 7. Health Checks

```bash
# Gateway health
curl http://localhost:3000/health

# BO API health
curl http://localhost:3001/api/bo/health

# Service API health
curl http://localhost:3002/api/health
```

---

## Test Credentials

### Default Users (from seed)

| Email | Password | Role | Status |
|-------|----------|------|--------|
| admin@cyna.fr | TempPassword123! | ADMIN | ACTIVE |
| user1@cyna.fr | TempPassword123! | ADMIN | ACTIVE |
| user2@cyna.fr | TempPassword123! | USER | ACTIVE |
| user3@cyna.fr | TempPassword123! | USER | INACTIVE |
| user4@cyna.fr | TempPassword123! | ADMIN | ACTIVE |

### Default Categories (from seed)

1. **Cybersécurité** - Services et solutions de cybersécurité
2. **Audit de sécurité** - Audits et tests de pénétration
3. **Conformité** - Services de conformité et gouvernance
4. **Formation** - Formations en sécurité informatique

### Default Services (from seed)

- Threat Intelligence (Cybersécurité, PUBLISHED)
- EDR - Endpoint Detection and Response (Cybersécurité, PUBLISHED)
- XDR - Extended Detection and Response (Cybersécurité, PUBLISHED)
- Test de pénétration (Audit de sécurité, PUBLISHED)
- Audit de conformité GDPR (Conformité, PUBLISHED)
- Audit de conformité ISO 27001 (Conformité, PUBLISHED)
- Formation cybersécurité niveau 1 (Formation, PUBLISHED)
- Formation cybersécurité niveau avancé (Formation, DRAFT)

---

## Common Issues & Solutions

### Issue: Cannot connect to database
**Solution:**
- Check PostgreSQL is running: `docker ps` or `psql --version`
- Verify DATABASE_URL in .env file
- Create databases if they don't exist

### Issue: "Cannot find module 'uuid'"
**Solution:**
```bash
cd service/api/cyna-service-api
yarn install
```

### Issue: Port already in use
**Solution:**
```bash
# Find process using port 3000
lsof -i :3000
# Kill process
kill -9 PID

# Or change PORT in .env file
```

### Issue: CORS error
**Solution:**
- Verify CORS_ORIGIN in .env matches your frontend URL
- Check if APIs are started on correct ports
- Clear browser cache and cookies

### Issue: Authentication failing
**Solution:**
- Verify JWT_SECRET is same in BO API and Gateway
- Check if seed:users was run successfully
- Verify email and password are correct

### Issue: "Invalid or expired token"
**Solution:**
- Re-login to get a fresh token
- Verify token is not expired (24 hour expiry)
- Check token is being sent in Authorization header

---

## Next Steps

### 1. Test in Different Scenarios

- Test with different user roles (ADMIN vs USER)
- Test pagination with different page/limit values
- Test filtering with various status and role combinations
- Test validation (invalid email, missing fields, etc.)

### 2. Monitor Logs

Watch terminal output for:
- Request logging
- Validation errors
- Database queries
- Authentication flow

### 3. Integration Points

Once BO and Service APIs are tested:
- Test inter-service communication
- Verify JWT token verification in Gateway
- Test request routing through Gateway

---

## API Endpoints Quick Reference

### Gateway Routes
- `POST /api/bo/auth/login` - Login (Public)
- `POST /api/bo/auth/logout` - Logout (Public)
- `GET /api/bo/users` - List users (Protected)
- `POST /api/bo/users` - Create user (Protected)
- `GET /api/categories` - List categories (Public)
- `GET /api/services` - List services (Public)

### Direct Service Routes (for testing)
- BO Direct: `http://localhost:3001/api/bo/*`
- Service Direct: `http://localhost:3002/api/*`

---

## Questions or Issues?

1. Check the `.env` configuration
2. Verify all services are running: `curl http://localhost:3000/health`
3. Check database connection: Look for connection errors in logs
4. Review seed output for any errors
5. Verify all dependencies are installed: `yarn install`

**Happy Testing! 🎉**
