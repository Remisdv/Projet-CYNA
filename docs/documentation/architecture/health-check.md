# Health Check

## Vue d'ensemble

Chaque service de l'architecture CYNA dispose d'un endpoint de health check permettant de vérifier son état de fonctionnement et la connexion à la base de données.

## Architecture des modules

Les modules Health suivent une architecture en couches :

```
src/
├── endpoint/
│   └── health.controller.ts    # Controller HTTP
├── service/
│   └── health.service.ts       # Logique métier
└── module/
    └── health.module.ts        # Configuration NestJS
```

## Services avec TypeORM

Les services **cyna-bo-api**, **cyna-service-api** et **cyna-webapp-api** utilisent TypeORM pour vérifier la connexion à PostgreSQL.

### Endpoint

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/health` | Vérifie l'état du service et de la BDD |

### Réponse

```json
{
  "status": "ok",
  "service": "cyna-bo-api",
  "timestamp": "2024-01-21T10:00:00.000Z",
  "database": {
    "status": "ok"
  }
}
```

En cas d'erreur de connexion à la base de données :

```json
{
  "status": "error",
  "service": "cyna-bo-api",
  "timestamp": "2024-01-21T10:00:00.000Z",
  "database": {
    "status": "error"
  }
}
```

## Gateway API

Le **cyna-gateway-api** agrège les health checks de tous les services. Il ne dispose pas de TypeORM car il sert uniquement de point d'entrée.

### Endpoints

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/health` | Health check agrégé de tous les services |
| GET | `/health/gateway` | Health check du Gateway uniquement |
| GET | `/health/bo-api` | Health check du Back-Office API |
| GET | `/health/service-api` | Health check du Service API |
| GET | `/health/webapp-api` | Health check du WebApp API |

### Réponse agrégée

```json
{
  "status": "ok",
  "timestamp": "2024-01-21T10:00:00.000Z",
  "services": {
    "gateway": {
      "status": "ok",
      "service": "cyna-gateway-api",
      "timestamp": "2024-01-21T10:00:00.000Z"
    },
    "bo-api": {
      "status": "ok",
      "service": "cyna-bo-api",
      "timestamp": "2024-01-21T10:00:00.000Z",
      "database": { "status": "ok" }
    },
    "service-api": {
      "status": "ok",
      "service": "cyna-service-api",
      "timestamp": "2024-01-21T10:00:00.000Z",
      "database": { "status": "ok" }
    },
    "webapp-api": {
      "status": "ok",
      "service": "cyna-webapp-api",
      "timestamp": "2024-01-21T10:00:00.000Z",
      "database": { "status": "ok" }
    }
  }
}
```

Si un ou plusieurs services sont indisponibles, le statut global sera `"degraded"`.

## Configuration

Les URLs des services sont configurées via variables d'environnement dans le fichier `docker/dev/.env` :

```bash
BO_API_URL=http://cyna-bo-api:3000
WEBAPP_API_URL=http://cyna-webapp-api:3000
SERVICE_API_URL=http://cyna-service-api:3000
```

## Swagger

La documentation Swagger est disponible sur le Gateway à l'adresse :

```
http://localhost:3000/api
```

Les endpoints Health sont documentés dans la section **Health**.
