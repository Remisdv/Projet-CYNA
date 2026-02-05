# Middlewares

Les middlewares s'appliquent à toutes les requêtes entrantes avant les guards et controllers.

## Logger Middleware

Log automatique de toutes les requêtes HTTP.

**Format de log :**
```
[2024-01-21T10:00:00.000Z] GET /health 200 12ms - 127.0.0.1
```

**Variables d'environnement :**

| Variable | Défaut | Description |
|----------|--------|-------------|
| `LOG_LEVEL` | `info` | Niveau de log (`info`, `warn`, `error`) |
| `LOG_COLORS` | `true` | Active les couleurs dans les logs |

**Niveaux de log :**
- `info` : Toutes les requêtes
- `warn` : Uniquement 4xx et 5xx
- `error` : Uniquement 5xx

---

## Rate Limit Middleware

Limite le nombre de requêtes par IP pour éviter les abus.

**Headers de réponse :**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1705834860
```

**Variables d'environnement :**

| Variable | Défaut | Description |
|----------|--------|-------------|
| `RATE_LIMIT_WINDOW_MS` | `60000` | Fenêtre de temps en ms (1 min) |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Nombre max de requêtes par fenêtre |

**Réponse 429 (limite dépassée) :**
```json
{
  "statusCode": 429,
  "message": "Too many requests, please try again later",
  "retryAfter": 45
}
```

---

## Helmet Middleware

Ajoute des headers HTTP de sécurité pour protéger contre les attaques courantes.

**Headers ajoutés :**

| Header | Valeur | Protection |
|--------|--------|------------|
| `X-Content-Type-Options` | `nosniff` | MIME sniffing |
| `X-Frame-Options` | `DENY` | Clickjacking |
| `X-XSS-Protection` | `1; mode=block` | XSS (navigateurs legacy) |
| `Strict-Transport-Security` | `max-age=31536000` | Force HTTPS |
| `X-Download-Options` | `noopen` | Exécution IE |
| `X-Permitted-Cross-Domain-Policies` | `none` | Flash/PDF |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Fuite de données |
| `Content-Security-Policy` | `default-src 'self'` | Injection de contenu |

**Variables d'environnement :**

| Variable | Défaut | Description |
|----------|--------|-------------|
| `CSP_POLICY` | `default-src 'self'` | Politique CSP personnalisée |

---

## Request ID Middleware

Ajoute un identifiant unique à chaque requête pour la traçabilité.

**Header :** `X-Request-Id`

- Si le client envoie déjà un `X-Request-Id`, il est réutilisé
- Sinon, un UUID v4 est généré automatiquement
- L'ID est disponible dans `req.requestId` pour les logs/services

**Exemple de réponse :**
```
X-Request-Id: 550e8400-e29b-41d4-a716-446655440000
```

---

## Compression Middleware

Compresse les réponses HTTP en gzip pour réduire la bande passante.

**Variables d'environnement :**

| Variable | Défaut | Description |
|----------|--------|-------------|
| `COMPRESSION_ENABLED` | `true` | Active/désactive la compression |
| `COMPRESSION_THRESHOLD` | `1024` | Taille minimum en bytes pour compresser |

**Comportement :**
- Ne compresse que si le client accepte `gzip` (header `Accept-Encoding`)
- Ne compresse que si la réponse dépasse le seuil
- Ajoute le header `Content-Encoding: gzip`

---

## Ordre d'exécution

Les middlewares s'exécutent dans cet ordre :

1. **RequestId** → Génère l'ID de traçabilité
2. **Helmet** → Ajoute les headers de sécurité
3. **Logger** → Log la requête entrante
4. **RateLimit** → Vérifie les limites
5. **Compression** → Compresse la réponse sortante
