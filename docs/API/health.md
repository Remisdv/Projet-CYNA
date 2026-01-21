# Health Check API

Documentation des endpoints de Health Check pour tous les services CYNA.

## Gateway API (port 3000)

### GET /health

Retourne l'état de santé agrégé de tous les services.

**Réponse 200 OK**

```json
{
  "status": "ok | degraded",
  "timestamp": "2024-01-21T10:00:00.000Z",
  "services": {
    "gateway": { ... },
    "bo-api": { ... },
    "service-api": { ... },
    "webapp-api": { ... }
  }
}
```

### GET /health/gateway

Retourne l'état de santé du Gateway uniquement.

**Réponse 200 OK**

```json
{
  "status": "ok",
  "service": "cyna-gateway-api",
  "timestamp": "2024-01-21T10:00:00.000Z"
}
```

### GET /health/bo-api

Proxy vers le health check du Back-Office API.

### GET /health/service-api

Proxy vers le health check du Service API.

### GET /health/webapp-api

Proxy vers le health check du WebApp API.

---

## Back-Office API (port 3001)

### GET /health

**Réponse 200 OK**

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

---

## Service API (port 3003)

### GET /health

**Réponse 200 OK**

```json
{
  "status": "ok",
  "service": "cyna-service-api",
  "timestamp": "2024-01-21T10:00:00.000Z",
  "database": {
    "status": "ok"
  }
}
```

---

## WebApp API (port 3002)

### GET /health

**Réponse 200 OK**

```json
{
  "status": "ok",
  "service": "cyna-webapp-api",
  "timestamp": "2024-01-21T10:00:00.000Z",
  "database": {
    "status": "ok"
  }
}
```

---

## Codes de statut

| Statut | Description |
|--------|-------------|
| `ok` | Service opérationnel |
| `error` | Service en erreur (BDD inaccessible) |
| `degraded` | Un ou plusieurs sous-services en erreur (Gateway uniquement) |

## Swagger UI

Documentation interactive disponible sur :

```
http://localhost:3000/api
```
