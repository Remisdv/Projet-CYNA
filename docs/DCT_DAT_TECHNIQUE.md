# CYNA — Dossier de Conception Technique & Dossier d'Architecture Technique

> Document technique de référence — Projet CYNA  
> Date : Avril 2026  
> Branche : `develop`  
> Repo : [Remisdv/Projet-CYNA](https://github.com/Remisdv/Projet-CYNA)

---

## Table des matières

1. [Introduction / Contexte](#1-introduction--contexte)
2. [Analyse du besoin](#2-analyse-du-besoin)
3. [Solution proposée](#3-solution-proposée)
4. [DAT — Dossier d'Architecture Technique](#4-dat--dossier-darchitecture-technique)
5. [DCT — Dossier de Conception Technique](#5-dct--dossier-de-conception-technique)
6. [Tests et validation](#6-tests-et-validation)
7. [Déploiement et exploitation](#7-déploiement-et-exploitation)
8. [Conformité et sécurité des données](#8-conformité-et-sécurité-des-données)
9. [Annexes — ADR (Architecture Decision Records)](#9-annexes--adr-architecture-decision-records)

---

## 1. Introduction / Contexte

CYNA est une plateforme e-commerce B2B/B2C spécialisée dans la cybersécurité. Elle propose à la fois des **produits physiques** (matériels, équipements) et des **services managés à abonnement** (SOC, EDR, XDR) accessibles en formule mensuelle ou annuelle.

La plateforme se compose de deux interfaces utilisateur distinctes :
- Un **back-office d'administration** (gestion du catalogue, des commandes, des utilisateurs, des statistiques)
- Une **webapp client** (catalogue, panier, checkout Stripe, espace compte, abonnements)

Le projet est entièrement containerisé avec Docker et repose sur une architecture de type **API Gateway + microservices NestJS**.

---

## 2. Analyse du besoin

### 2.1 Expression du besoin

| Acteur | Besoin |
|---|---|
| Administrateur | Gérer les utilisateurs BO, les catégories, le carousel, les FAQs, les textes promotionnels, les commandes et les statistiques de vente |
| Client | S'inscrire, se connecter (2FA), parcourir le catalogue, ajouter au panier, payer par carte, gérer son compte et ses abonnements |
| Système | Synchroniser les commandes entre la webapp et le BO, envoyer des emails transactionnels, générer des factures PDF |

### 2.2 Contraintes

- **Sécurité** : authentification JWT avec 2FA obligatoire pour les admins BO ; 2FA optionnel (TOTP) pour les clients webapp
- **Conformité PCI-DSS** : aucune donnée de carte stockée — délégation totale à Stripe
- **Isolation** : chaque service tourne dans un conteneur dédié ; ils ne communiquent qu'à travers le réseau Docker interne
- **Scalabilité** : architecture Docker permettant une évolution vers Kubernetes
- **Dev / Prod** : comportement identique via variables d'environnement uniquement

### 2.3 Règles de gestion

- Un utilisateur BO doit obligatoirement passer par le 2FA (code email, validité 5 min) avant d'obtenir un JWT
- Les tokens JWT sont transmis via **HTTP-only cookie** (navigateur) ou **Bearer header** (API clients)
- Un article ajouté au panier entraîne une **réservation de stock** avec expiration automatique après 1 heure (job cron)
- Une commande est créée en état `pending` à la création du `PaymentIntent` Stripe, puis mise à jour en `paid`/`failed` via webhook
- Les commandes webapp sont **synchronisées vers service-api** pour visibilité BO immédiate
- Les abonnements génèrent une entité `WebappSubscription` ET un abonnement Stripe récurrent
- Les mots de passe sont stockés hashés (SHA-256) — jamais en clair

### 2.4 Parcours utilisateur

**Parcours client (webapp) :**
```
Accueil → Catalogue → Fiche produit → Panier → Checkout (4 étapes) → Confirmation → Espace compte
```

**Parcours admin (back-office) :**
```
Login → 2FA email → Dashboard stats → Gestion catalogue / commandes / utilisateurs / contenu
```

---

## 3. Solution proposée

Architecture **monorepo multi-service** avec :
- **4 APIs NestJS** (gateway, bo-api, webapp-api, service-api) chacune dans son conteneur
- **2 frontends React/Vite** (back-office + webapp)
- **1 reverse proxy Nginx** comme unique point d'entrée
- **1 base PostgreSQL partagée** (schéma unique, auto-sync en dev)
- **1 cluster Elasticsearch** pour la recherche full-text du catalogue
- **Stripe** pour tout le paiement (one-shot + abonnements récurrents)
- **Nodemailer** pour les emails transactionnels (2FA, confirmation commande, reset password)
- **PDFKit** pour la génération de factures PDF à la volée

---

## 4. DAT — Dossier d'Architecture Technique

### 4.1 Architecture réseau

#### Topologie des conteneurs Docker

```
                         ┌─────────────────────────────────────────────┐
                         │              Réseau Docker : cyna-network    │
                         │          (bridge — DNS interne 127.0.0.11)   │
                         │                                              │
  Navigateur ──:80──►   │  ┌──────────────────────────────────────┐   │
                         │  │          Nginx Alpine                │   │
                         │  │  bo.localhost     → cyna-bo-front    │   │
                         │  │  localhost        → cyna-webapp-front│   │
                         │  │  api.localhost    → cyna-gateway-api │   │
                         │  │  /api/*           → cyna-gateway-api │   │
                         │  └──────────────┬───────────────────────┘   │
                         │                 │ :3000 interne              │
                         │  ┌──────────────▼───────────────────────┐   │
                         │  │       cyna-gateway-api (NestJS)       │   │
                         │  │  /api/bo/*     → cyna-bo-api:3000     │   │
                         │  │  /api/webapp/* → cyna-webapp-api:3000 │   │
                         │  │  /api/public/* → cyna-service-api:3000│   │
                         │  └──────┬──────────────┬──────────────┬──┘   │
                         │         │              │              │       │
                         │  ┌──────▼──┐  ┌───────▼──┐  ┌───────▼──┐   │
                         │  │cyna-bo  │  │cyna-     │  │cyna-     │   │
                         │  │-api     │  │webapp-api│  │service-  │   │
                         │  │:3000    │  │:3000     │  │api:3000  │   │
                         │  └────┬────┘  └────┬─────┘  └────┬─────┘   │
                         │       └─────────────┼─────────────┘         │
                         │             ┌───────▼────────┐              │
                         │             │  PostgreSQL 16  │              │
                         │             │  cyna-postgres  │              │
                         │             │  :5432 (interne)│              │
                         │             └────────────────┘              │
                         │       ┌──────────────────────────┐          │
                         │       │   Elasticsearch 8.12     │          │
                         │       │   cyna-elasticsearch     │          │
                         │       │   :9200 / :9300          │          │
                         │       └──────────────────────────┘          │
                         │       ┌──────────────────────────┐          │
                         │       │   MailHog (DEV ONLY)     │          │
                         │       │   :1025 SMTP / :8025 UI  │          │
                         │       └──────────────────────────┘          │
                         └─────────────────────────────────────────────┘
```

#### Virtual hosts Nginx

| Virtual Host | Destination | Usage |
|---|---|---|
| `http://localhost` | `cyna-webapp-front:5174` | Interface client |
| `http://bo.localhost` | `cyna-bo-front:5173` | Interface admin |
| `http://api.localhost` | `cyna-gateway-api:3000` | Accès direct API |
| `http://localhost/api/*` | `cyna-gateway-api:3000` | Proxy API webapp |
| `http://bo.localhost/api/*` | `cyna-gateway-api:3000` | Proxy API back-office |
| `http://bo.localhost/uploads/*` | `cyna-gateway-api:3000` | Fichiers uploadés |

**Configuration Nginx notables :**
- `client_max_body_size 10m` — pour les uploads fichiers (images carousel, etc.)
- `proxy_read_timeout 86400s` — pour maintenir les connexions WebSocket Vite HMR
- Résolution DNS Docker dynamique (`resolver 127.0.0.11 valid=5s`) — résolution par nom de conteneur à chaque requête

### 4.2 Diagramme de déploiement

**9 conteneurs Docker en environnement dev :**

| Conteneur | Image / Build | Port exposé | Dépendances |
|---|---|---|---|
| `cyna-nginx` | `nginx:alpine` | **80** | gateway, bo-front, webapp-front |
| `cyna-gateway-api` | `Dockerfile.nestjs` (Node 20 Alpine) | — (interne) | postgres, elasticsearch |
| `cyna-bo-api` | `Dockerfile.nestjs` (Node 20 Alpine) | — (interne) | postgres, elasticsearch |
| `cyna-webapp-api` | `Dockerfile.nestjs` (Node 20 Alpine) | — (interne) | postgres, elasticsearch |
| `cyna-service-api` | `Dockerfile.nestjs` (Node 20 Alpine) | — (interne) | postgres, elasticsearch |
| `cyna-bo-front` | `Dockerfile.react` (Node 20 Alpine) | 5173 (interne) | — |
| `cyna-webapp-front` | `Dockerfile.react` (Node 20 Alpine) | 5174 (interne) | — |
| `cyna-postgres` | `postgres:16-alpine` | **5432** | — |
| `cyna-elasticsearch` | `elasticsearch:8.12.0` | **9200, 9300** | — |
| `cyna-mailhog` | `mailhog/mailhog:latest` | **1025, 8025** | — |

**Volumes Docker persistants :**
- `postgres_data` — données PostgreSQL
- `elasticsearch_data` — index Elasticsearch
- Volumes de montage de code source (hot-reload) : `../../service/api/<service>:/app`

### 4.3 Sécurité

#### Pipeline de sécurité — Gateway (ordre d'exécution)

```
Requête HTTP
     │
     ▼
1. RequestIdMiddleware
   ├── Lit X-Request-Id si présent
   └── Génère un UUID v4 via crypto.randomUUID() sinon
       → Injecte dans req.requestId + header de réponse X-Request-Id

     │
     ▼
2. HelmetMiddleware (sécurité des headers HTTP)
   ├── X-Content-Type-Options: nosniff
   ├── X-Frame-Options: DENY  (anti-clickjacking)
   ├── X-XSS-Protection: 1; mode=block
   ├── Strict-Transport-Security: max-age=31536000; includeSubDomains
   ├── X-Download-Options: noopen
   ├── X-Permitted-Cross-Domain-Policies: none
   ├── Referrer-Policy: strict-origin-when-cross-origin
   └── Content-Security-Policy: (configurable via env CSP_POLICY)

     │
     ▼
3. LoggerMiddleware
   ├── Timestamp ISO + requestId + method + URL + IP + User-Agent
   ├── Durée de traitement (ms)
   ├── Couleurs ANSI configurables (LOG_COLORS)
   └── Niveau LOG_LEVEL configurable

     │
     ▼
4. RateLimitMiddleware
   ├── Fenêtre : RATE_LIMIT_WINDOW_MS (défaut 60 000 ms)
   ├── Max requêtes : RATE_LIMIT_MAX_REQUESTS (défaut 100)
   ├── Clé : IP + User-Agent
   ├── Stockage : Map in-memory (⚠ single instance)
   ├── Headers de réponse : X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
   └── HTTP 429 si dépassement

     │
     ▼
5. CompressionMiddleware
   ├── Activé si Accept-Encoding: gzip présent ET COMPRESSION_ENABLED != false
   ├── Seuil : COMPRESSION_THRESHOLD (défaut 1024 octets)
   └── Compression zlib native Node.js (pas de dépendance externe)

     │
     ▼
6. JwtAuthGuard (Guard NestJS global — APP_GUARD)
   ├── @Public() → bypass immédiat
   ├── Aucun @Auth() ni @Roles() → bypass (route publique par défaut)
   ├── Lecture token : cookie HTTP-only 'BoAuthentication' ou 'Authentication'
   │                   OU header Authorization: Bearer <token>
   ├── Vérification HMAC-SHA256 manuelle (sans bibliothèque JWT externe)
   └── Injecte user ({ sub, email, role }) dans req.user

     │
     ▼
7. RolesGuard (Guard NestJS global — APP_GUARD)
   ├── @Roles('admin') → vérifie req.user.role === 'admin' (case-insensitive)
   ├── @Roles() vide → authentification requise sans contrôle de rôle
   └── HTTP 403 si rôle insuffisant

     │
     ▼
Controller → Service → TypeORM Repository → PostgreSQL
```

#### Authentification BO (2FA email obligatoire)

```
POST /api/bo/auth/login
  → Vérification email + SHA-256(password)
  → Génération code 6 chiffres aléatoire
  → Stockage en BDD (twoFactorCode + twoFactorCodeExpiry = now + 5min)
  → Envoi email via Nodemailer
  → Réponse : { requiresTwoFactor: true, userId, email }

POST /api/bo/auth/2fa/verify
  → Vérification expiry (rejet si expiré)
  → Vérification code (usage unique — effacé après vérification)
  → Génération access_token (JWT) + refresh_token
  → Réponse : { access_token, refresh_token, user: { id, email, firstName, lastName, role, status } }
```

#### Authentification Webapp (2FA TOTP optionnel)

```
POST /api/webapp/auth/register → Inscription + hash SHA-256 password
POST /api/webapp/auth/login    → JWT si 2FA désactivé
                                  ou { requiresTwoFactor: true } si TOTP activé
POST /api/webapp/auth/2fa/verify-totp → Vérification code TOTP (speakeasy)
POST /api/webapp/auth/forgot-password → Token UUID en BDD (expiresAt 1h) + email
POST /api/webapp/auth/reset-password  → Vérification token + update passwordHash
```

#### Propagation de l'identité utilisateur

Le `BaseProxyController` extrait `req.user.sub` (userId du JWT) et le transmet aux services internes via le header `X-User-Id`. Cela permet à `webapp-api` et `service-api` d'identifier l'utilisateur sans re-vérifier le JWT.

```typescript
// Headers propagés par BaseProxyController vers les services internes
['authorization', 'content-type', 'x-request-id', 'x-correlation-id']
+ 'x-user-id' = user.sub  // userId extrait du JWT
```

### 4.4 Matrice des risques

| Risque / Menace | Impact | Probabilité | Mesures préventives | Plan de réponse |
|---|---|---|---|---|
| Injection SQL | Élevé | Faible | ORM TypeORM avec requêtes préparées, `ValidationPipe` avec `whitelist: true` | Correction immédiate + audit des logs + patch |
| XSS | Élevé | Moyen | CSP via `HelmetMiddleware`, échappement React (JSX), `X-XSS-Protection` header | Désactivation fonctionnalité + correctif |
| CSRF | Moyen | Faible | Tokens JWT HTTP-only cookie, `SameSite` implicite, pas de formulaires classiques | Audit + patch |
| DDoS / Flood | Moyen | Moyen | `RateLimitMiddleware` (100 req/min/IP), Nginx rate limiting possible | Blocage IP + activation protection réseau |
| Brute force auth | Élevé | Moyen | 2FA obligatoire BO, rate limit sur `/auth/login`, code à usage unique | Blocage temporaire + alerte |
| Fuite données Stripe | Critique | Très Faible | Aucune donnée carte stockée, Stripe Elements côté client, PCI-DSS délégué | Notification CNIL + audit |
| Token JWT volé | Élevé | Faible | HTTP-only cookie, durée limitée, refresh token rotation | Invalidation session + re-auth |
| Accès non autorisé BO | Élevé | Faible | `@Roles('admin')`, 2FA email, JWT signé | Révocation token + audit accès |
| Perte de données DB | Critique | Très Faible | Volume Docker persistant, backup prévu en prod | Restore depuis backup |
| Exposition ports internes | Moyen | Faible | Seul le port 80 Nginx est exposé ; services internes sur `cyna-network` uniquement | Audit docker-compose |

### 4.5 Environnements

#### Variables d'environnement par service

**Gateway API :**
```env
NODE_ENV=development
PORT=3000
JWT_SECRET=<secret>
BO_API_URL=http://cyna-bo-api:3000
WEBAPP_API_URL=http://cyna-webapp-api:3000
SERVICE_API_URL=http://cyna-service-api:3000
DATABASE_URL=postgresql://user:pass@cyna-postgres:5432/cyna
ELASTICSEARCH_URL=http://cyna-elasticsearch:9200
SMTP_HOST=mailhog / <smtp-prod>
SMTP_PORT=1025 / 587
LOG_LEVEL=info
LOG_COLORS=true
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
COMPRESSION_ENABLED=true
COMPRESSION_THRESHOLD=1024
CSP_POLICY="default-src 'self'"
```

**BO API :**
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=<secret>
SMTP_HOST / SMTP_PORT
NODE_OPTIONS=--max-old-space-size=512
```

**Webapp API :**
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=<secret>
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SERVICE_API_URL=http://cyna-service-api:3000
EMAIL_CONTACT_DEST=contact@cyna.fr
SMTP_HOST / SMTP_PORT
FRONTEND_URL=http://localhost:5173
```

**Service API :**
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://...
ELASTICSEARCH_URL=http://cyna-elasticsearch:9200
SMTP_HOST / SMTP_PORT
```

#### Tableau comparatif Dev / Prod

| Paramètre | Développement | Production |
|---|---|---|
| TypeORM `synchronize` | `true` (auto-sync schéma) | `false` (migrations manuelles) |
| Stripe keys | `sk_test_...` / `pk_test_...` | `sk_live_...` / `pk_live_...` |
| SMTP | MailHog (localhost:1025) | SMTP réel (SendGrid, etc.) |
| Elasticsearch security | `xpack.security.enabled=false` | Activée avec TLS |
| Ports exposés | 80, 5432, 9200, 9300, 1025, 8025 | 80 / 443 uniquement |
| Hot reload | `nest start --watch` | `node dist/main` |
| Volumes code | Montage local → conteneur | Image buildée |
| `NODE_OPTIONS` | `--max-old-space-size=512` | Configurer selon RAM |

---

## 5. DCT — Dossier de Conception Technique

### 5.1 Architecture du code

#### Structure du monorepo

```
Projet-CYNA/
├── service/
│   ├── api/
│   │   ├── cyna-gateway-api/   ← Reverse-proxy + Auth + Middlewares + Swagger
│   │   ├── cyna-bo-api/        ← Back-office métier (REFERENCE ARCHITECTURE)
│   │   ├── cyna-webapp-api/    ← Client : paiement, panier, compte, abonnements
│   │   └── cyna-service-api/   ← Catalogue produits, commandes BO, stats, tracking
│   └── front/
│       ├── back-office/        ← React 18 + Vite + TailwindCSS (port 5173)
│       └── webapp/             ← React 18 + Vite + TailwindCSS (port 5174)
├── docker/
│   ├── dev/
│   │   ├── docker-compose.yml
│   │   ├── Dockerfile.nestjs   ← Node 20 Alpine + hot reload
│   │   ├── Dockerfile.react    ← Node 20 Alpine + Vite --host
│   │   └── nginx/nginx.conf
│   ├── test/
│   │   ├── docker-compose.yml  ← Stack isolée pour tests fonctionnels
│   │   ├── seed.sql
│   │   ├── run-tests.ps1 / .sh
│   │   ├── nginx/nginx.conf
│   │   └── functional/
│   │       ├── jest.config.js
│   │       ├── helpers/
│   │       │   ├── api.ts      ← Client HTTP configuré
│   │       │   └── auth.ts     ← Utilitaires auth pour tests
│   │       └── specs/          ← 11 fichiers de spec (01 à 11)
│   ├── seed-all.ps1            ← Seed complet ordonné
│   ├── start.all.stack.ps1/.sh
│   ├── stop.all.stack.ps1/.sh
│   ├── reset.all.stack.ps1/.sh
│   └── restart.ps1
└── docs/
    └── DCT_DAT_TECHNIQUE.md    ← Ce fichier
```

#### Pattern architectural NestJS — `cyna-bo-api` (référence)

```
src/
├── app.module.ts          ← Module racine : imports TypeORM + modules métier
├── main.ts                ← Bootstrap, ValidationPipe, CORS, prefix /api/bo
├── database/
│   ├── entity/            ← Entités TypeORM (1 dossier/fichier par domaine)
│   │   ├── User/User.entity.ts
│   │   ├── Category/Category.entity.ts
│   │   ├── Carousel/CarouselItem.entity.ts
│   │   ├── Faq/Faq.entity.ts
│   │   └── TextePromotionnel/TextePromotionnel.entity.ts
│   └── seeds/             ← Scripts ts-node pour peupler la BDD
│       ├── users.seed.ts
│       └── promos.seed.ts
├── module/                ← Déclarations NestJS @Module (1 fichier par domaine)
│   ├── BoAuth.module.ts
│   ├── Category.module.ts
│   ├── Carousel.module.ts
│   ├── Faq.module.ts
│   ├── TextePromotionnel.module.ts
│   ├── User.module.ts
│   └── health.module.ts
├── endpoint/              ← Controllers REST (1 dossier par domaine)
│   ├── auth/bo-auth.controller.ts
│   ├── Category/category.controller.ts
│   ├── Carousel/carousel.controller.ts
│   ├── Faq/faq.controller.ts
│   ├── TextePromotionnel/texte-promotionnel.controller.ts
│   ├── User/user.controller.ts
│   └── health.controller.ts
└── service/               ← Logique métier + DTOs + Mappers
    ├── auth/
    │   ├── bo-auth.service.ts
    │   └── bo-email.service.ts
    ├── Category/Category.service.ts
    ├── dtos/              ← DTOs class-validator (validation entrée)
    │   ├── auth/bo-auth.dto.ts
    │   └── Category/Category.dto.ts
    └── mappers/           ← Transformation entity ↔ DTO
        └── Category.mapper.ts
```

#### Layered architecture (couches)

```
[HTTP Request]
     ↓
[Middleware Chain]          → RequestId, Helmet, Logger, RateLimit, Compression
     ↓
[Guards (Global)]           → JwtAuthGuard → RolesGuard
     ↓
[Controller]                → Parsing params/body, délégation au service
     ↓
[Service]                   → Logique métier, orchestration, exceptions HTTP
     ↓
[Repository (TypeORM)]      → Accès BDD via entités TypeORM
     ↓
[PostgreSQL 16]
```

### 5.2 Dépendances et librairies

#### `cyna-gateway-api`

| Package | Version | Usage |
|---|---|---|
| `@nestjs/common` | ^10.0.0 | Framework NestJS core |
| `@nestjs/platform-express` | ^10.0.0 | Adaptateur Express |
| `@nestjs/serve-static` | ^4.0.0 | Serve `/uploads/` fichiers statiques |
| `@nestjs/swagger` | ^7.0.0 | Documentation OpenAPI/Swagger |
| `swagger-ui-express` | ^5.0.1 | UI Swagger sur `/docs` |
| `cookie-parser` | ^1.4.6 | Lecture cookies HTTP-only (JWT) |
| `class-validator` | ^0.14.3 | Validation DTOs |
| `class-transformer` | ^0.5.1 | Transformation/sérialisation objets |
| `dotenv` | ^17.3.1 | Variables d'environnement |
| `rxjs` | ^7.8.1 | Programmation réactive (NestJS core) |
| `reflect-metadata` | ^0.2.0 | Support décorateurs TypeScript |

**Note :** La gateway **n'utilise pas** `@nestjs/jwt` — la vérification JWT est faite manuellement via le module `crypto` natif Node.js (HMAC-SHA256) dans `JwtAuthGuard`.

#### `cyna-bo-api`

| Package | Version | Usage |
|---|---|---|
| `@nestjs/jwt` | ^11.0.2 | Génération JWT (access + refresh tokens) |
| `@nestjs/typeorm` | ^11.0.0 | Intégration TypeORM dans NestJS |
| `typeorm` | ^0.3.28 | ORM PostgreSQL |
| `pg` | ^8.17.2 | Driver PostgreSQL |
| `nodemailer` | ^8.0.5 | Envoi emails 2FA |
| `class-validator` | ^0.14.3 | Validation DTOs |
| `class-transformer` | ^0.5.1 | Transformation objets |

#### `cyna-webapp-api`

| Package | Version | Usage |
|---|---|---|
| `@nestjs/jwt` | ^11.0.2 | Génération JWT client |
| `@nestjs/typeorm` | ^11.0.0 | ORM |
| `@nestjs/schedule` | ^4.1.2 | **Cron jobs** (nettoyage réservations expirées) |
| `typeorm` | ^0.3.28 | ORM PostgreSQL |
| `pg` | ^8.17.2 | Driver PostgreSQL |
| `stripe` | ^22.0.1 | SDK Stripe (PaymentIntent, Subscriptions, Webhooks) |
| `nodemailer` | ^8.0.5 | Emails transactionnels (2FA, commande, reset) |
| `pdfkit` | ^0.18.0 | Génération factures PDF |
| `speakeasy` | ^2.0.0 | TOTP (Google Authenticator — 2FA webapp) |
| `qrcode` | ^1.5.4 | Génération QR code pour enrôlement TOTP |
| `uuid` | ^13.0.0 | Génération UUIDs (tokens reset password) |
| `axios` | ^1.15.0 | Appels HTTP internes (sync vers service-api) |
| `class-validator` | ^0.15.1 | Validation DTOs |
| `class-transformer` | ^0.5.1 | Transformation objets |

#### `cyna-service-api`

| Package | Version | Usage |
|---|---|---|
| `@nestjs/typeorm` | ^11.0.0 | ORM |
| `typeorm` | ^0.3.28 | ORM PostgreSQL |
| `pg` | ^8.17.2 | Driver PostgreSQL |
| `nodemailer` | ^6.10.1 | Emails |
| `uuid` | ^9.0.0 | Génération UUIDs |

#### Frontends (Back-Office & Webapp)

| Package | Version | Usage |
|---|---|---|
| `react` | ^18.2.0 | UI library |
| `react-dom` | ^18.2.0 | Rendu DOM |
| `react-router-dom` | ^6.18.0 | Routing SPA |
| `@tanstack/react-query` | ^5.12.2 | Cache et synchronisation état serveur |
| `axios` | ^1.6.2 | Client HTTP |
| `react-hook-form` | ^7.48.2 | Gestion formulaires |
| `@hookform/resolvers` | ^3.3.2 | Intégration Zod avec react-hook-form |
| `zod` | ^3.22.4 | Schémas de validation TypeScript |
| `tailwindcss` | ^3.3.5 | CSS utility-first |
| `lucide-react` | ^0.292.0 | Icônes SVG React |
| `recharts` | ^2.9.0 | Graphiques (dashboard stats BO) |
| `class-variance-authority` | ^0.7.0 | Variantes CSS typées |
| `clsx` | ^2.0.0 | Combinaison conditionnelle de classes CSS |
| `tailwind-merge` | ^2.0.0 | Merge intelligent classes Tailwind |
| `react-markdown` | ^8.0.7 | Rendu Markdown |
| `vite` | ^5.0.0 | Build tool + dev server HMR |

**Webapp uniquement :**

| Package | Version | Usage |
|---|---|---|
| `@stripe/react-stripe-js` | ^2.9.0 | Composants React Stripe Elements |
| `@stripe/stripe-js` | ^3.5.0 | SDK Stripe.js (chargement sécurisé) |

### 5.3 Décorateurs NestJS custom — Gateway

Le gateway expose 3 décorateurs custom basés sur `SetMetadata` pour contrôler l'accès aux routes :

#### `@Public()`
```typescript
// src/common/decorator/public.decorator.ts
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```
**Effet :** Bypass total des guards `JwtAuthGuard` et `RolesGuard`. Utilisé pour les routes ouvertes (catalogue public, webhook Stripe, health checks).

**Exemple d'usage :**
```typescript
@Get()
@Public()
async getAll(@Req() req, @Res() res): Promise<void> { ... }
```

---

#### `@Auth()`
```typescript
// src/common/decorator/auth.decorator.ts
export const AUTH_KEY = 'auth';
export const Auth = () => SetMetadata(AUTH_KEY, true);
```
**Effet :** Exige un JWT valide mais n'impose aucun rôle. Utilisé pour les routes nécessitant une connexion client (panier, commandes, compte).

**Exemple d'usage :**
```typescript
@Post('create-intent')
@Auth()
async createIntent(@Req() req, @Res() res): Promise<void> { ... }
```

---

#### `@Roles(...roles: string[])`
```typescript
// src/common/decorator/roles.decorator.ts
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```
**Effet :** Exige un JWT valide ET un rôle correspondant (case-insensitive). `@Roles('admin')` → rôle `admin` requis. `@Roles()` vide → authentifié sans contrôle de rôle.

**Exemple d'usage :**
```typescript
@Post()
@Roles('admin')
async create(@Req() req, @Res() res): Promise<void> { ... }
```

---

### 5.4 Pattern BaseProxyController

Toutes les routes de la gateway héritent de `BaseProxyController` qui encapsule la logique de proxy HTTP :

```typescript
// Fonctionnement interne
protected async proxy(req: Request, res: Response, path: string): Promise<void> {
  // 1. Extrait et propage les headers : authorization, content-type, x-request-id, x-correlation-id
  // 2. Ajoute X-User-Id (userId extrait du JWT) pour les services internes
  // 3. Proxy method + body vers le service cible (BoProxyService ou WebappProxyService)
  // 4. Support binaire (PDF) : propage Content-Type + Content-Disposition
  // 5. Erreur service → HTTP 503 Service Unavailable
}
```

**Deux implémentations de proxy :**
- `BoProxyService` → `http://cyna-bo-api:3000`
- `WebappProxyService` → `http://cyna-webapp-api:3000` / `http://cyna-service-api:3000`

### 5.5 Diagramme de classes — Entités base de données

#### Schéma `cyna-bo-api` (shared PostgreSQL)

```
┌─────────────────────────────────────────┐
│                  User                   │
├─────────────────────────────────────────┤
│ + id: uuid (PK)                         │
│ + email: varchar(255) UNIQUE            │
│ + firstName: varchar(128)               │
│ + lastName: varchar(128)                │
│ + role: enum(ADMIN, USER)               │
│ + status: enum(ACTIVE, INACTIVE)        │
│ + passwordHash: varchar(255)            │
│ + twoFactorCode: varchar(6) ?           │
│ + twoFactorCodeExpiry: timestamp ?      │
│ + createdAt: timestamp                  │
│ + updatedAt: timestamp                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│               Category                  │
├─────────────────────────────────────────┤
│ + id: uuid (PK)                         │
│ + slug: varchar(128) UNIQUE             │
│ + nameFr: varchar(255)                  │
│ + descFr: text ?                        │
│ + nameEn: varchar(255)                  │
│ + descEn: text ?                        │
│ + isActive: boolean = true              │
│ + createdAt / updatedAt: timestamp      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│              CarouselItem               │
├─────────────────────────────────────────┤
│ + id: uuid (PK)                         │
│ + imageUrl: varchar(500) ?              │
│ + imageAlt: varchar(255) ?              │
│ + title: varchar(255) ?                 │
│ + text: text ?                          │
│ + link: varchar(500) ?                  │
│ + order: int = 0                        │
│ + createdAt / updatedAt: timestamp      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│                  Faq                    │
├─────────────────────────────────────────┤
│ + id: uuid (PK)                         │
│ + parentId: varchar(36) ?  ←─ hiérarchie│
│ + question: varchar(500)                │
│ + answer: text ?                        │
│ + lang: varchar(5) = 'fr'              │
│ + order: int = 0                        │
│ + createdAt / updatedAt: timestamp      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│           TextePromotionnel             │
├─────────────────────────────────────────┤
│ + id: uuid (PK)                         │
│ + textFr: varchar(500)                  │
│ + textEn: varchar(500)                  │
│ + isActive: boolean = false             │
│ + createdAt / updatedAt: timestamp      │
└─────────────────────────────────────────┘
```

#### Schéma `cyna-webapp-api`

```
┌──────────────────────────────────────────────┐
│            WebappUser (webapp_users)          │
├──────────────────────────────────────────────┤
│ + id: uuid (PK)                              │
│ + email: varchar(255) UNIQUE                 │
│ + passwordHash: varchar(255)                 │
│ + firstName: varchar(128)                    │
│ + lastName: varchar(128)                     │
│ + phone: varchar(20) ?                       │
│ + billingAddress: jsonb ?                    │
│   { street, city, postalCode, country, co.? }│
│ + shippingAddress: jsonb ?                   │
│ + stripeCustomerId: varchar(255) ?           │
│ + status: enum(ACTIVE, INACTIVE)             │
│ + twoFactorEnabled: boolean = false          │
│ + twoFactorCode: varchar(6) ?  ← OTP email  │
│ + twoFactorCodeExpiry: timestamp ?           │
│ + totpSecret: varchar(255) ?   ← TOTP       │
│ + totpEnabled: boolean = false               │
│ + createdAt / updatedAt: timestamp           │
└──────────────────────────────────────────────┘
        │ 1                          │ 1
        │ N                          │ N
┌───────▼──────────────┐   ┌────────▼──────────────────┐
│ PasswordResetToken   │   │    CartItem (cart_items)   │
│ (password_reset...)  │   ├───────────────────────────┤
├──────────────────────┤   │ + id: uuid (PK)            │
│ + id: uuid (PK)      │   │ + userId: varchar          │
│ + userId: varchar    │   │ + productId: varchar       │
│ + token: varchar UNQ │   │ + productName: varchar     │
│ + expiresAt: timestamp│  │ + productType: varchar     │
│ + usedAt: timestamp? │   │   = 'produit'              │
│ + createdAt: timestamp│  │ + quantity: int = 1        │
└──────────────────────┘   │ + prix: decimal(10,2) ?    │
                           │ + prixMensuel: decimal ?   │
                           │ + prixAnnuel: decimal ?    │
                           │ + periodicity: varchar ?   │
                           │ + image: varchar ?         │
                           │ + stockReserved: bool=false│
                           │ + reservationExpiresAt: ts?│
                           │ + createdAt / updatedAt    │
                           └───────────────────────────┘

┌──────────────────────────────────────────────────┐
│        CustomerOrder (customer_orders)            │
├──────────────────────────────────────────────────┤
│ + id: uuid (PK)                                  │
│ + ref: varchar UNIQUE  ← ex: CMD-XXXXXX          │
│ + userId: varchar                                │
│ + items: jsonb[]                                 │
│   [{productId, productName, productType,         │
│     quantity, unitPrice, periodicity?, subtotal}]│
│ + amount: decimal(10,2)                          │
│ + status: enum(pending,confirmed,shipped,        │
│           delivered,cancelled)                   │
│ + paymentIntentId: varchar ?                     │
│ + paymentStatus: enum(pending,paid,failed,       │
│                  refunded)                       │
│ + billingAddress: jsonb                          │
│ + shippingAddress: jsonb ?                       │
│ + notes: text ?                                  │
│ + trackingNumber: varchar ?                      │
│ + shippedAt: timestamp ?                         │
│ + createdAt / updatedAt: timestamp               │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│     WebappSubscription (webapp_subscriptions)    │
├──────────────────────────────────────────────────┤
│ + id: uuid (PK)                                  │
│ + userId: varchar                                │
│ + productId: varchar                             │
│ + productName: varchar(255)                      │
│ + planType: enum(mensuel, annuel)                │
│ + status: enum(active, cancelled, expired)       │
│ + price: decimal(10,2)                           │
│ + stripeSubscriptionId: varchar ?                │
│ + startDate: timestamp                           │
│ + renewalDate: timestamp ?                       │
│ + createdAt / updatedAt: timestamp               │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│       ContactMessage (contact_messages)          │
├──────────────────────────────────────────────────┤
│ + id: uuid (PK)                                  │
│ + name: varchar(255)                             │
│ + email: varchar(255)                            │
│ + subject: varchar(255)                          │
│ + message: text                                  │
│ + userId: varchar ?  (si connecté)               │
│ + status: enum(new, read, replied)               │
│ + createdAt: timestamp                           │
└──────────────────────────────────────────────────┘
```

#### Schéma `cyna-service-api`

```
┌──────────────────────────────────────────────────┐
│         ProductEntity (products)                 │
│  Index: slug, statut, categorie, type            │
├──────────────────────────────────────────────────┤
│ + id: uuid (PK)                                  │
│ + nom: varchar(255)                              │
│ + description_courte: varchar(100)               │
│ + description_longue: text ?                     │
│ + categorie: varchar(128)  ← slug ou UUID        │
│ + type: enum(produit, service)                   │
│ + tags: simple-array ?                           │
│ + statut: enum(brouillon, publié)                │
│ + slug: varchar UNIQUE ?                         │
│ + meta_title: varchar(60) ?     ← SEO           │
│ + meta_description: varchar(160) ?              │
│ + keywords: text ?                               │
│ ── Produits physiques ──                         │
│ + prix: decimal(10,2) ?                          │
│ + stock: int ?                                   │
│ + stock_illimite: varchar = 'illimité'           │
│ + seuil_alerte_stock: int ?                      │
│ ── Services abonnement ──                        │
│ + prix_mensuel: decimal(10,2) ?                  │
│ + prix_annuel: decimal(10,2) ?                   │
│ + remise_annuelle_pct: decimal(5,2) ?            │
│ + createdAt / updatedAt: timestamp               │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│         ServiceEntity (services)                 │
│  Index: slug, statut, categoryId                 │
├──────────────────────────────────────────────────┤
│ + id: uuid (PK)                                  │
│ + nom: varchar(255)                              │
│ + categoryId: varchar(255)                       │
│ + description: text ?                            │
│ + statut: enum(brouillon, publié)                │
│ + slug: varchar UNIQUE ?                         │
│ + meta_title / meta_description / keywords       │
│ + createdAt / updatedAt: timestamp               │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│           OrderEntity (orders)                   │
│  ← Copie BO synchronisée depuis webapp-api       │
├──────────────────────────────────────────────────┤
│ + id: uuid (PK)                                  │
│ + ref: varchar UNIQUE                            │
│ + clientEmail: varchar                           │
│ + clientFirstName / clientLastName: varchar ?    │
│ + amount: decimal(10,2)                          │
│ + status: enum(pending,...,cancelled)            │
│ + paymentStatus: enum(pending,paid,refunded,     │
│                  failed)                         │
│ + paymentRef: varchar ?                          │
│ + billingAddress: jsonb ?                        │
│ + items: jsonb[]                                 │
│ + createdAt / updatedAt: timestamp               │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│       TrackingEventEntity (tracking_events)      │
│  Index: [type, createdAt]                        │
├──────────────────────────────────────────────────┤
│ + id: uuid (PK)                                  │
│ + type: enum(LOGIN, CART_ADD,                    │
│          CART_CHECKOUT, PAGE_VIEW)               │
│ + userId: varchar ?                              │
│ + sessionId: varchar ?                           │
│ + metadata: jsonb ?                              │
│ + createdAt: timestamp                           │
└──────────────────────────────────────────────────┘
```

### 5.6 Diagramme de flux — Parcours commande complet

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FLUX COMMANDE CLIENT                             │
└─────────────────────────────────────────────────────────────────────┘

  [CatalogPage / ProductDetailPage]
         │ Clic "Ajouter au panier"
         ▼
  CartContext.addItem()
         │
         ├─ Si non authentifié → localStorage uniquement
         └─ Si authentifié → POST /api/webapp/cart
                              │
                              ▼ CartService.addItem()
                              ├─ Vérifie article existant (userId + productId + periodicity)
                              ├─ Incrémente ou crée CartItem en BDD
                              ├─ POST /api/service-api/products/:id/reserve (stock)
                              └─ stockReserved = true, reservationExpiresAt = now + 1h

  [CartPage] → [CheckoutPage]
         │
         │ Étape 1 : Adresse livraison
         │ Étape 2 : Adresse facturation
         │ Étape 3 : Stripe Elements (carte)
         ▼
  POST /api/webapp/payment/create-intent
         │ { items, billingAddress, shippingAddress }
         ▼ PaymentService.createPaymentIntent()
         │
         ├─ Crée/récupère Stripe Customer (stripeCustomerId en BDD)
         │
         ├─ Produits physiques (one-time payment)
         │   ├─ StripeService.createPaymentIntent(amount, 'eur', customerId)
         │   ├─ Création CustomerOrder { ref: 'CMD-xxx', status: pending }
         │   └─ OrderSyncService.syncOrder() → POST service-api /api/orders/sync
         │
         └─ Services abonnement
             ├─ StripeService.createSubscription(customerId, price, 'month'|'year')
             ├─ Création WebappSubscription { status: active }
             └─ Retourne { subscriptionId, clientSecret }

  Stripe.js confirme le paiement (côté client)
         │
         ▼
  POST /api/webapp/payment/stripe/webhook  (@Public — pas d'auth)
         │ Stripe envoie : payment_intent.succeeded / payment_intent.payment_failed
         ▼ Vérification signature webhook (STRIPE_WEBHOOK_SECRET)
         │
         ├─ Succès : CustomerOrder.paymentStatus = 'paid'
         │           CustomerOrder.status = 'confirmed'
         │           EmailService.sendOrderConfirmation()
         │           OrderSyncService.syncOrder() (mise à jour BO)
         │           Vide CartItems de l'utilisateur
         │
         └─ Échec  : CustomerOrder.paymentStatus = 'failed'
                     Libération réservation stock

  [Page confirmation] → [Espace compte /account]
         │
         ├─ GET /api/webapp/orders        → liste paginée commandes
         ├─ GET /api/webapp/orders/:id    → détail commande
         └─ GET /api/webapp/orders/:id/invoice → PDF généré par PDFKit
```

#### Job Cron — Nettoyage réservations expirées

`@nestjs/schedule` exécute automatiquement dans `CartService` :
```typescript
@Cron(CronExpression.EVERY_30_MINUTES)  // ou similaire
async releaseExpiredReservations(): Promise<void> {
  // Trouve CartItems où stockReserved = true ET reservationExpiresAt < now
  // Appelle service-api pour libérer le stock
  // Supprime ou met stockReserved = false
}
```

### 5.7 Routes API complètes

#### Gateway — Back-Office (`/api/bo/*`)

| Méthode | Route | Décorateur | Description |
|---|---|---|---|
| POST | `/api/bo/auth/login` | `@Public()` | Login (step 1 — déclenche 2FA email) |
| POST | `/api/bo/auth/2fa/verify` | `@Public()` | Vérifier code 2FA → retourne JWT |
| POST | `/api/bo/auth/2fa/resend` | `@Public()` | Renvoyer code 2FA |
| POST | `/api/bo/auth/refresh` | `@Public()` | Refresh access + refresh tokens |
| POST | `/api/bo/auth/logout` | `@Public()` | Clear cookie |
| GET | `/api/bo/categories` | `@Public()` | Liste catégories |
| GET | `/api/bo/categories/:id` | `@Public()` | Détail catégorie |
| POST | `/api/bo/categories` | `@Roles('admin')` | Créer catégorie |
| PUT | `/api/bo/categories/:id` | `@Roles('admin')` | Modifier catégorie |
| DELETE | `/api/bo/categories/:id` | `@Roles('admin')` | Supprimer catégorie |
| GET | `/api/bo/carousel` | `@Public()` | Liste slides |
| POST | `/api/bo/carousel` | `@Roles('admin')` | Créer slide |
| PUT | `/api/bo/carousel/:id` | `@Roles('admin')` | Modifier slide |
| DELETE | `/api/bo/carousel/:id` | `@Roles('admin')` | Supprimer slide |
| GET | `/api/bo/faqs` | `@Public()` | Liste FAQs |
| POST | `/api/bo/faqs` | `@Roles('admin')` | Créer FAQ |
| PUT | `/api/bo/faqs/:id` | `@Roles('admin')` | Modifier FAQ |
| DELETE | `/api/bo/faqs/:id` | `@Roles('admin')` | Supprimer FAQ |
| GET | `/api/bo/advertisements` | `@Public()` | Liste textes promo |
| POST | `/api/bo/advertisements` | `@Roles('admin')` | Créer texte promo |
| PUT | `/api/bo/advertisements/:id` | `@Roles('admin')` | Modifier |
| DELETE | `/api/bo/advertisements/:id` | `@Roles('admin')` | Supprimer |
| GET | `/api/bo/users` | `@Roles('admin')` | Liste utilisateurs BO |
| POST | `/api/bo/users` | `@Roles('admin')` | Créer utilisateur BO |
| PUT | `/api/bo/users/:id` | `@Roles('admin')` | Modifier utilisateur |
| DELETE | `/api/bo/users/:id` | `@Roles('admin')` | Supprimer utilisateur |
| GET | `/api/bo/orders` | `@Roles('admin')` | Liste commandes BO |
| GET | `/api/bo/orders/:id` | `@Roles('admin')` | Détail commande |
| PUT | `/api/bo/orders/:id/status` | `@Roles('admin')` | Modifier statut commande |
| GET | `/api/bo/stats/dashboard` | `@Roles('admin')` | Stats dashboard (CA, commandes, clients) |
| GET | `/api/bo/stats/commercial` | `@Roles('admin')` | Stats commerciales |
| GET | `/api/bo/services` | `@Roles('admin')` | Liste services |
| POST | `/api/bo/services` | `@Roles('admin')` | Créer service |
| PUT | `/api/bo/services/:id` | `@Roles('admin')` | Modifier service |
| DELETE | `/api/bo/services/:id` | `@Roles('admin')` | Supprimer service |
| POST | `/api/bo/upload` | `@Roles('admin')` | Upload image (multer, max 5MB) |
| GET | `/api/bo/health` | `@Public()` | Health check BO |

#### Gateway — Webapp (`/api/webapp/*`)

| Méthode | Route | Décorateur | Description |
|---|---|---|---|
| POST | `/api/webapp/auth/register` | `@Public()` | Inscription client |
| POST | `/api/webapp/auth/login` | `@Public()` | Connexion client |
| POST | `/api/webapp/auth/logout` | `@Auth()` | Déconnexion |
| POST | `/api/webapp/auth/refresh` | `@Public()` | Refresh token |
| POST | `/api/webapp/auth/forgot-password` | `@Public()` | Demande reset password |
| POST | `/api/webapp/auth/reset-password` | `@Public()` | Reset password avec token |
| POST | `/api/webapp/auth/2fa/verify-totp` | `@Public()` | Vérifier code TOTP |
| GET | `/api/webapp/cart` | `@Auth()` | Récupérer panier |
| POST | `/api/webapp/cart` | `@Auth()` | Ajouter article |
| PUT | `/api/webapp/cart/:id` | `@Auth()` | Modifier quantité |
| DELETE | `/api/webapp/cart/:id` | `@Auth()` | Supprimer article |
| POST | `/api/webapp/payment/create-intent` | `@Auth()` | Créer PaymentIntent Stripe |
| POST | `/api/webapp/payment/confirm` | `@Auth()` | Confirmer paiement |
| POST | `/api/webapp/payment/stripe/webhook` | `@Public()` | Webhook Stripe (signé) |
| GET | `/api/webapp/orders` | `@Auth()` | Liste commandes client |
| GET | `/api/webapp/orders/:id` | `@Auth()` | Détail commande |
| GET | `/api/webapp/orders/:id/invoice` | `@Auth()` | Facture PDF |
| GET | `/api/webapp/subscriptions/:id` | `@Auth()` | Détail abonnement |
| GET | `/api/webapp/account` | `@Auth()` | Profil utilisateur |
| PUT | `/api/webapp/account` | `@Auth()` | Modifier profil |
| GET | `/api/webapp/carousel` | `@Public()` | Slides carousel public |
| GET | `/api/webapp/advertisements` | `@Public()` | Textes promotionnels |
| POST | `/api/webapp/contact` | `@Public()` | Formulaire de contact |
| GET | `/api/webapp/notifications` | `@Auth()` | Notifications utilisateur |

#### Gateway — Public / Service API

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/public/categories` | Catégories publiques |
| GET | `/api/public/products` | Catalogue produits (avec filtres, pagination) |
| GET | `/api/public/products/:slug` | Fiche produit |
| GET | `/api/public/services` | Liste services |
| GET | `/api/bo/tracking` | Événements de tracking (BO) |

### 5.8 Documentation API

Swagger UI disponible en dev sur : `http://api.localhost/docs`

Généré via `@nestjs/swagger` + `DocumentBuilder` dans `cyna-gateway-api/src/main.ts`.

### 5.9 Gestion des données de référence — Seeds

Le script `docker/seed-all.ps1` exécute les seeds dans l'ordre suivant :

```
1. cyna-service-api → seed:services   → Catégories de services
2. cyna-service-api → seed:products   → 48 produits (8 services + 40 physiques)
3. cyna-service-api → seed:orders     → 15 commandes BO (~105 000 € de CA)
4. cyna-bo-api      → seed:users      → 4 utilisateurs admin
5. cyna-bo-api      → seed:promos     → 8 catégories + 3 textes promo + 4 carousel
6. cyna-webapp-api  → seed:users      → 3 utilisateurs client
7. cyna-webapp-api  → seed:orders     → 1 commande + 1 abonnement par user
```

**Comptes disponibles après seed :**
```
BO Admins (Password123!) :
  admin@cyna.fr | lucas@cyna.fr | titouan@cyna.fr | remi@cyna.fr

Webapp clients (Password123!) :
  lucas@cyna.fr | titouan@cyna.fr | remi@cyna.fr
```

---

## 6. Tests et validation

### 6.1 Tests fonctionnels automatisés

**Framework :** Jest + TypeScript (ESM)  
**Environnement :** Stack Docker isolée (`docker/test/docker-compose.yml`)  
**Seed :** `docker/test/seed.sql` — données initiales stables  
**Exécution :** `docker/test/run-tests.ps1` ou `.sh`

**Helpers de test :**
- `helpers/api.ts` — Client HTTP préconfiguré (base URL, gestion erreurs)
- `helpers/auth.ts` — Helpers pour obtenir des tokens JWT dans les tests

**Fichiers de specs :**

| Fichier | Couverture |
|---|---|
| `01-gateway-health.spec.ts` | Health checks de tous les services |
| `02-gateway-auth.spec.ts` | Login, 2FA, refresh token, logout BO |
| `03-gateway-bo-categories.spec.ts` | CRUD complet catégories (auth + non-auth) |
| `04-gateway-bo-carousel.spec.ts` | CRUD carousel + upload images |
| `05-gateway-bo-faqs.spec.ts` | CRUD FAQs bilingues + hiérarchie |
| `06-gateway-bo-advertisements.spec.ts` | CRUD textes promotionnels |
| `07-gateway-bo-users.spec.ts` | CRUD utilisateurs BO + gestion rôles |
| `08-gateway-bo-orders.spec.ts` | Consultation et mise à jour statut commandes |
| `09-gateway-bo-stats.spec.ts` | Dashboard stats + stats commerciales |
| `10-gateway-bo-services.spec.ts` | CRUD services catalogue |
| `11-gateway-public.spec.ts` | Endpoints publics (catalogue, carousel, etc.) |

### 6.2 Tests unitaires

Les services NestJS sont testables unitairement via `@nestjs/testing` + Jest (défini dans `package.json` de chaque service). Commandes disponibles :

```bash
npm run test          # Jest en mode run once
npm run test:watch    # Mode watch
npm run test:cov      # Coverage
npm run test:e2e      # Tests end-to-end
```

### 6.3 Tests de sécurité

| Test | Méthode |
|---|---|
| Accès routes admin sans JWT | 401 attendu — couvert par specs |
| Accès routes admin avec JWT user | 403 attendu — couvert par specs |
| Accès routes avec JWT expiré | 401 attendu |
| Rate limiting | Séquence de 101 requêtes → 429 sur la dernière |
| Webhook Stripe sans signature | Rejeté par `stripe.webhooks.constructEvent()` |
| Input invalide (DTOs) | 400 `ValidationPipe` — `whitelist + forbidNonWhitelisted` |

---

## 7. Déploiement et exploitation

### 7.1 Dockerfiles

**`Dockerfile.nestjs` (dev) :**
```dockerfile
FROM node:20-alpine
ARG APP_NAME
ENV APP_NAME=${APP_NAME}
RUN apk add --no-cache python3 make g++   # Dépendances build natives (pg, bcrypt, etc.)
WORKDIR /app
COPY ${APP_NAME}/package.json ${APP_NAME}/package-lock.json* ./
RUN npm install
COPY ${APP_NAME}/ ./
EXPOSE 3000
CMD ["npm", "run", "start:dev"]           # nest start --watch (hot reload)
```

**`Dockerfile.react` (dev) :**
```dockerfile
FROM node:20-alpine
ARG APP_PATH
WORKDIR /app
COPY ${APP_PATH}/package.json ./
RUN npm install --legacy-peer-deps
COPY ${APP_PATH}/ ./
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"] # Vite exposé sur 0.0.0.0
```

**Stratégie de volumes pour le hot reload :**
```yaml
volumes:
  - ../../service/api/cyna-bo-api:/app   # Code source monté dans le conteneur
  - /app/node_modules                     # Volume anonyme pour isoler node_modules
```
Le volume anonyme `/app/node_modules` évite que le montage du code source écrase les modules installés dans l'image.

### 7.2 Scripts d'exploitation

| Script | Plateforme | Usage |
|---|---|---|
| `docker/start.all.stack.ps1` | Windows | Démarrer tout le stack |
| `docker/start.all.stack.sh` | Linux/Mac | Démarrer tout le stack |
| `docker/stop.all.stack.ps1/.sh` | Tous | Arrêter le stack |
| `docker/reset.all.stack.ps1/.sh` | Tous | Reset complet (rm volumes + rebuild) |
| `docker/restart.ps1` | Windows | Restart rapide |
| `docker/seed-all.ps1` | Windows | Seed toutes les BDD dans l'ordre |
| `docker/test/run-tests.ps1/.sh` | Tous | Lancer les tests fonctionnels |

### 7.3 Health Checks Docker

Chaque service critique dispose d'un healthcheck Docker :

```yaml
# PostgreSQL
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
  interval: 10s / timeout: 5s / retries: 5

# Elasticsearch
healthcheck:
  test: ["CMD-SHELL", "curl -f http://localhost:9200/_cluster/health || exit 1"]
  interval: 30s / timeout: 10s / retries: 5
```

Tous les services NestJS déclarent `depends_on: postgres + elasticsearch : condition: service_healthy` — ils ne démarrent qu'après que les BDD soient prêtes.

Chaque API expose un endpoint `/health` vérifié en interne. La gateway agrège les health checks de tous les services sous-jacents.

### 7.4 CI/CD

Pipeline Git sur `develop` branch :
- **Branche de travail :** `develop`
- **PRs :** intégration via GitHub Pull Requests
- **Package manager :** Yarn 4.x (Plug'n'Play) — `packageManager: "yarn@4.12.0"` dans chaque `package.json`
- Pas de pipeline CI/CD automatisé décrit dans le repo (à prévoir pour la prod)

### 7.5 Monitoring

En dev :
- **MailHog** sur `http://localhost:8025` — visualiser tous les emails envoyés
- **Swagger UI** sur `http://api.localhost/docs` — tester les APIs
- **Logs couleur** dans chaque conteneur via `LoggerMiddleware` (LOG_COLORS=true)

---

## 8. Conformité et sécurité des données

### 8.1 RGPD

| Donnée personnelle | Localisation | Justification |
|---|---|---|
| Email | `User.email`, `WebappUser.email` | Identifiant compte |
| Nom / Prénom | `User.firstName/lastName`, `WebappUser.*` | Personnalisation, facturation |
| Adresse de facturation/livraison | `WebappUser.billingAddress/shippingAddress` (JSONB) | Traitement commande |
| Numéro de téléphone | `WebappUser.phone` | Contact optionnel |
| Historique commandes | `CustomerOrder`, `OrderEntity` | Obligation légale comptable |
| Stripe Customer ID | `WebappUser.stripeCustomerId` | Lien paiement |

**Droits utilisateurs supportés :**
- Droit d'accès : GET `/api/webapp/account` + `/api/webapp/orders`
- Droit de modification : PUT `/api/webapp/account`
- Droit à la portabilité : à implémenter (export JSON compte)
- Droit à l'effacement : à implémenter (suppression compte)

### 8.2 Gestion des données sensibles

| Donnée | Traitement |
|---|---|
| Mots de passe | Hash SHA-256 — jamais stockés en clair |
| Tokens JWT | HTTP-only cookie (inaccessible JavaScript) ou Bearer |
| Codes 2FA | Usage unique, TTL 5 minutes, effacé après vérification |
| Tokens reset password | UUID unique en BDD avec `expiresAt` 1h, `usedAt` après usage |
| Secret TOTP | `totpSecret` chiffré recommandé (en varchar actuellement) |
| Clés Stripe | Variables d'environnement — jamais dans le code |
| `DATABASE_URL` | Variable d'environnement — jamais dans le code |
| `JWT_SECRET` | Variable d'environnement — jamais dans le code |

**Isolation réseau :** Les services internes (bo-api, webapp-api, service-api, postgres, elasticsearch) ne sont accessibles que depuis le réseau Docker `cyna-network`. Seul le port 80 (Nginx) est exposé à l'extérieur.

---

## 9. Annexes — ADR (Architecture Decision Records)

### ADR-01 : Node.js + NestJS pour le backend

**Contexte :** Backend gérant APIs REST, auth JWT/2FA, intégrations Stripe/Elasticsearch, charge modérée (1 000–5 000 utilisateurs).

**Options envisagées :**

| Option | Avantages | Inconvénients |
|---|---|---|
| **Node.js + NestJS (choisi)** | Architecture modulaire native, TypeScript, écosystème riche, homogénéité avec le frontend | Single-thread, perf inférieure aux langages compilés |
| Java Spring Boot | Très bonnes performances, mature | Temps de dev plus long, courbe apprentissage, hétérogénéité |
| PHP Laravel | Rapide à démarrer, communauté | Moins adapté aux architectures modernes, typage faible |

**Décision :** NestJS + TypeScript — cohérence avec le frontend React/TypeScript, structuration claire en modules, intégration rapide des services tiers.

---

### ADR-02 : Docker pour la containerisation

**Contexte :** Besoin d'environnements cohérents dev/test/prod et déploiement simplifié.

**Options envisagées :**

| Option | Avantages | Inconvénients |
|---|---|---|
| Déploiement direct | Simple, rapide | Incompatibilités entre environnements, scaling difficile |
| **Docker (choisi)** | Reproductibilité, isolation, CI/CD, scalabilité | Complexité initiale, nécessite expertise |
| Kubernetes | Orchestration avancée, auto-scaling | Surengineering pour ce projet |

**Décision :** Docker + Docker Compose. Chaque composant isolé dans son conteneur. Architecture prête pour une migration Kubernetes future.

---

### ADR-03 : PostgreSQL comme base de données principale

**Contexte :** Stockage de données relationnelles avec besoins JSONB (adresses, items de commande), UUIDs, transactions ACID.

**Décision :** PostgreSQL 16 — support JSONB natif (évite des tables de jointure pour les données de commande variables), UUID natif, compatibilité TypeORM, `pg_isready` pour healthchecks Docker, robustesse prouvée.

**Note :** Schéma unique partagé entre les 4 services en dev (`synchronize: true`). En production, migrations TypeORM séparées par service.

---

### ADR-04 : Architecture API Gateway (pattern BFF)

**Contexte :** Besoin d'un point d'entrée unique exposant plusieurs services internes.

**Décision :** Gateway NestJS comme unique point d'entrée externe. Avantages :
- Centralisation auth + rate limiting + logs
- Masquage de la topologie interne
- Transmission `X-User-Id` aux services sans re-vérifier le JWT à chaque service
- Swagger centralisé
- Possibilité d'ajouter de nouveaux microservices sans modifier le frontend

---

### ADR-05 : Stripe pour le paiement

**Contexte :** Paiements one-shot + abonnements récurrents. Conformité PCI-DSS requise.

**Décision :** Stripe (SDK v22). Justifications :
- Aucune donnée de carte stockée côté application (Stripe Elements)
- PCI-DSS délégué à Stripe
- Support natif abonnements récurrents (Stripe Subscriptions)
- Webhooks pour confirmation asynchrone (résilience aux coupures réseau)
- SDK TypeScript bien typé

---

### ADR-06 : Elasticsearch pour la recherche catalogue

**Contexte :** Recherche full-text sur le catalogue produits/services.

**Décision :** Elasticsearch 8.12.0 en single-node. Justifications :
- Recherche full-text performante avec scoring
- Filtrage et agrégation sur les attributs produits
- Configuration simplifiée en dev (`xpack.security.enabled=false`)
- Intégration possible avec Kibana pour monitoring en prod

**⚠ Note prod :** `xpack.security.enabled` doit être activé avec TLS en production.

---

### ADR-07 : Vérification JWT manuelle dans le Gateway

**Contexte :** Le gateway vérifie les JWT mais ne génère pas de tokens (les services bo-api et webapp-api génèrent les tokens).

**Décision :** Vérification HMAC-SHA256 manuelle dans `JwtAuthGuard` via le module `crypto` natif Node.js (sans `@nestjs/jwt` dans le gateway). Justifications :
- Évite une dépendance supplémentaire dans la gateway
- Le secret JWT est partagé via `JWT_SECRET` env var
- Contrôle total sur la logique de vérification

---

*Fin du document — CYNA DCT/DAT — Avril 2026*
