# Authentication System - BO Users

## Architecture

L'authentification pour les users Back-Office fonctionne selon ce flux:

```
┌────────┐
│ Client │
└───┬────┘
    │
    │ POST /api/bo/auth/login
    │ { email, password }
    ↓
┌──────────────────┐
│ Gateway          │
│ BoAuthController │
└────┬─────────────┘
     │
     │ POST /api/bo/auth/login
     │ (appelle le BO en HTTP)
     ↓
┌──────────────────┐
│ BO API           │
│ BoAuthService   │
│ - Valide user   │
│ - Génère JWT    │
│ - Retourne user │
└────┬─────────────┘
     │
     │ { token, user }
     ↓
┌──────────────────┐
│ Gateway          │
│ - Set-Cookie     │
│ - Retourne JWT   │
└────┬─────────────┘
     │
     │ { token, user }
     │ Set-Cookie: BoAuthentication
     ↓
┌────────┐
│ Client │
│ (stocke│
│ cookie)│
└────────┘
```

## Endpoints

### Gateway - BO Authentication Endpoints

#### POST `/api/bo/auth/login` (Public)
Authentifier un utilisateur BO

**Requête:**
```json
{
  "email": "admin@cyna.fr",
  "password": "TempPassword123!"
}
```

**Réponse (200):**
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

Cookies définis:
- `BoAuthentication`: JWT token (HTTP-only, 24h)

**Erreurs:**
- 401: `Invalid credentials`
- 400: Invalid DTO

#### POST `/api/bo/auth/logout` (Public)
Se déconnecter

**Réponse (200):**
```json
{
  "message": "Logout successful"
}
```

Cookie supprimé:
- `BoAuthentication`: Cleared

### BO API - Authentication Endpoints

#### POST `/api/bo/auth/login` (Public)
Authentifier un utilisateur BO directement (appelé par la gateway)

**Requête:**
```json
{
  "email": "admin@cyna.fr",
  "password": "TempPassword123!"
}
```

**Réponse (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@cyna.fr",
    "firstName": "Admin",
    "lastName": "CYNA",
    "role": "ADMIN",
    "status": "ACTIVE"
  }
}
```

#### POST `/api/bo/auth/logout` (Public)
Se déconnecter du BO

## JWT Token Structure

### Header
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### Payload
```json
{
  "id": 1,
  "email": "admin@cyna.fr",
  "role": "ADMIN",
  "firstName": "Admin",
  "lastName": "CYNA",
  "type": "bo",
  "iat": 1710787200,
  "exp": 1710873600
}
```

- `type: "bo"` - Identifie ce token comme user BO (prépare pour d'autres types)
- `exp` - Expire dans 24h
- Signé avec HMAC-SHA256

## Security

### Cookie Storage
- **BoAuthentication** - HTTP-only cookie (inaccessible au JavaScript)
- Secure en production
- SameSite: lax (protection CSRF)

### Token Validation
- Signature HMAC-SHA256 vérifiée
- Expiration vérifiée (24h)
- Décodage base64url

## Configuration

Variables d'environnement requises:

```env
# Gateway
BO_API_URL=http://localhost:3001
BO_API_HOST=localhost
BO_API_PORT=3001

# BO et Gateway
JWT_SECRET=your-super-secret-key-change-in-production
NODE_ENV=development
```

## Test Credentials

De la seed:

| Email | Password | Role | Status |
|-------|----------|------|--------|
| admin@cyna.fr | TempPassword123! | ADMIN | ACTIVE |
| user1@cyna.fr | TempPassword123! | ADMIN | ACTIVE |
| user2@cyna.fr | TempPassword123! | USER | ACTIVE |
| user3@cyna.fr | TempPassword123! | USER | INACTIVE |
| user4@cyna.fr | TempPassword123! | ADMIN | ACTIVE |

## Examples

### Avec curl

```bash
# 1. Login
curl -X POST http://localhost:3000/api/bo/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cyna.fr","password":"TempPassword123!"}' \
  -c cookies.txt

# 2. Requête protégée (avec cookie)
curl http://localhost:3000/api/bo/users \
  -b cookies.txt

# 3. Logout
curl -X POST http://localhost:3000/api/bo/auth/logout \
  -b cookies.txt
```

### Avec JavaScript (Fetch)

```javascript
// Login
const response = await fetch('http://localhost:3000/api/bo/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important pour les cookies
  body: JSON.stringify({
    email: 'admin@cyna.fr',
    password: 'TempPassword123!'
  })
});

const data = await response.json();
console.log('User:', data.user);
console.log('Token:', data.token);

// Requête protégée
const Protected = await fetch('http://localhost:3000/api/bo/users', {
  credentials: 'include' // Le cookie est automatiquement envoyé
});
```

## Erreurs

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "email must be an email",
  "error": "Bad Request"
}
```

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Failed to connect to BO authentication service",
  "error": "Internal Server Error"
}
```

## Architecture Future

Cette structure prépare l'ajout d'autres types d'utilisateurs:

```
Gateway:
  /api/bo/auth/login      ← BO users (implementé)
  /api/client/auth/login  ← Client users (prépare)
  /api/... /auth/login    ← Autres types (préparé)

Chaque type a ses propres:
  - Service
  - Controller
  - Module
  - DTOs
  - Token type (type: "bo", "client", etc.)
```

## Notes de Sécurité

- Mots de passe hashés en SHA256 (remplacer par bcrypt/argon2 en production)
- JWT_SECRET doit être fort et secret
- HTTPS obligatoire en production
- Token expiration: 24h (configurable)
- HTTP-only cookies pour éviter XSS
- SameSite protection pour CSRF
