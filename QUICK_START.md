#  CYNA API - Quick Start Guide (5 Minutes)

##  Fastest Setup

### Option A: With Docker (Recommended)

```bash
# 1. Navigate to docker dev directory
cd docker/dev

# 2. Copy and update environment file
cp .env.example .env
# Edit .env if needed (default values should work)

# 3. Start PostgreSQL and all services
docker-compose up -d postgres mailhog elasticsearch

# 4. Wait for PostgreSQL to be healthy (check logs)
docker-compose logs postgres

# 5. When PostgreSQL is ready, in another terminal:
cd ../../service/api/cyna-bo-api
yarn install && yarn seed:users

cd ../cyna-service-api  
yarn install && yarn seed:services

cd ../cyna-gateway-api
yarn install

# 6. Start the APIs (each in separate terminal)
cd ../cyna-bo-api && yarn start:dev              # Terminal A
cd ../cyna-service-api && yarn start:dev         # Terminal B
cd ../cyna-gateway-api && yarn start:dev         # Terminal C
```

### Option B: Without Docker (Manual PostgreSQL)

```bash
# 1. Ensure PostgreSQL is running on localhost:5432

# 2. Create databases:
createdb cyna_bo_db cyna_service_db
# Or with psql:
psql -U postgres -c "CREATE DATABASE cyna_bo_db; CREATE DATABASE cyna_service_db;"

# 3. Setup API folders (run in each directory):
cp .env.example .env

# Update .env files:
# - cyna-bo-api/.env: DATABASE_URL=postgresql://postgres:password@localhost:5432/cyna_bo_db
# - cyna-service-api/.env: DATABASE_URL=postgresql://postgres:password@localhost:5432/cyna_service_db

# 4. Install and seed (in API folders):
yarn install && yarn build

# Seed in Terminal A:
cd service/api/cyna-bo-api && yarn seed:users

# Seed in Terminal B:
cd service/api/cyna-service-api && yarn seed:services

# 5. Start APIs (each in separate terminal):
cd service/api/cyna-bo-api && yarn start:dev         # Terminal A
cd service/api/cyna-service-api && yarn start:dev    # Terminal B  
cd service/api/cyna-gateway-api && yarn start:dev    # Terminal C
```

---

##  Verify Installation

All three commands should return HTTP 200:

```bash
# Terminal D - Verify all services are running
curl http://localhost:3000/health         # Gateway
curl http://localhost:3001/api/bo/health  # BO API
curl http://localhost:3002/api/health     # Service API
```

**All working? Great! ** Continue to testing...

---

##  Test API (Choose One)

### Option 1: Postman (Easiest)

1. Open Postman
2. Import: `CYNA_API_Collection.postman_collection.json`
3. Import Environment: `CYNA_Postman_Environment.json`
4. Go to **Authentication  BO Login**, click **Send**
5. Copy token, paste in Variables
6. Test any endpoint in the collection

### Option 2: cURL (Quick Verification)

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/bo/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cyna.fr","password":"TempPassword123!"}' | \
  jq -r '.token')

# 2. Get Users
curl http://localhost:3000/api/bo/users \
  -H "Authorization: Bearer $TOKEN"

# 3. List Categories (no auth needed)
curl http://localhost:3000/api/categories

# 4. List Services
curl http://localhost:3000/api/services
```

### Option 3: Browser (Simplest)

Visit URLs in browser:
- Categories: http://localhost:3000/api/categories
- Services: http://localhost:3000/api/services
- Gateway Swagger: http://localhost:3000/api

---

##  Default Credentials

**Admin User:**
- Email: `admin@cyna.fr`
- Password: `TempPassword123!`

**Other Users:**
- user1@cyna.fr (ADMIN)
- user2@cyna.fr (USER)
- user3@cyna.fr (USER - INACTIVE)
- user4@cyna.fr (ADMIN)

---

##  Common Commands

### Check Database Connection
```bash
# BO API database
PGPASSWORD=password psql -U postgres -h localhost -d cyna_bo_db -c "SELECT COUNT(*) FROM \"user\";"

# Service API database  
PGPASSWORD=password psql -U postgres -h localhost -d cyna_service_db -c "SELECT COUNT(*) FROM categories;"
```

### View Logs
```bash
# See API logs for errors
docker-compose logs postgres  # PostgreSQL logs
```

### Restart Services
```bash
# Kill all node processes
pkill -f "node|nest"

# Restart individual APIs
cd service/api/cyna-bo-api && yarn start:dev
```

### Clear Database
```bash
# Drop and recreate (Docker)
docker-compose down -v  # Removes volumes
docker-compose up postgres

# Or with psql
dropdb cyna_bo_db cyna_service_db
createdb cyna_bo_db cyna_service_db
```

---

##  API Endpoints Quick Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/bo/auth/login | No | Login & get JWT token |
| GET | /api/bo/users | Yes | List users (paginated) |
| POST | /api/bo/users | Yes | Create user |
| GET | /api/categories | No | List categories |
| GET | /api/services | No | List services |
| POST | /api/services | Yes | Create service |

**Full API docs:** See [TESTING_GUIDE.md](TESTING_GUIDE.md)

---

##  Troubleshooting

| Error | Fix |
|-------|-----|
| "Cannot connect to database" | Verify PostgreSQL running: `psql --version` |
| "Port 3000 already in use" | Kill process: `lsof -i :3000 \| tail -1 \| awk '{print $2}' \| xargs kill -9` |
| "Invalid credentials" | Verify password: `TempPassword123!` (with capital T and exclamation) |
| "Cannot find module 'uuid'" | Run: `yarn install` in cyna-service-api |
| "Token expired" | Re-login at /api/bo/auth/login |

---

##  Project Structure

```
service/api/
 cyna-bo-api/           (port 3001)
    src/
       endpoint/users/         User management
       service/auth/           JWT generation
       database/seeds/         Test data
    .env.example
 cyna-service-api/      (port 3002)
    src/
       endpoint/services/      Service CRUD
       endpoint/category/      Category CRUD
       database/seeds/         Test data
    .env.example
 cyna-gateway-api/      (port 3000)
     src/
        endpoint/bo-auth/       Auth endpoint
        service/bo-auth/        Auth service
        common/guard/           JWT validation
     .env.example
```

---

##  Next Steps After Setup

1. **Explore APIs**: Try each endpoint in Postman
2. **Study Authentication**: See how JWT tokens work
3. **Test Validation**: Try invalid data to see error responses
4. **Create Test Data**: Add your own users and services
5. **Frontend Integration**: Connect React app using API

---

##  Still Having Issues?

1. Check all 3 terminal windows for error messages
2. Verify `.env` files are properly configured
3. Ensure PostgreSQL is running and databases exist
4. Check API ports are not blocked (3000, 3001, 3002)
5. Try restarting all services

For detailed troubleshooting, see [VERIFICATION_AND_FIXES_SUMMARY.md](VERIFICATION_AND_FIXES_SUMMARY.md)

---

**You're all set! Time to test! **
