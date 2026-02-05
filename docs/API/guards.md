# Guards (Authentification & Autorisation)

Les guards protègent les routes et s'exécutent après les middlewares.

## JWT Auth Guard

Vérifie la présence et la validité d'un token JWT. Activé globalement sur toutes les routes par défaut.

**Header requis :**
```
Authorization: Bearer <token>
```

**Variable d'environnement :**

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | Clé secrète pour signer/vérifier les tokens |

**Réponses d'erreur :**

| Code | Message |
|------|---------|
| 401 | `Authorization header missing` |
| 401 | `Invalid authorization format` |
| 401 | `Invalid or expired token` |

---

## Roles Guard

Vérifie que l'utilisateur a le rôle requis. Fonctionne avec le JWT Auth Guard.

**Rôles disponibles (Backoffice) :**
- `admin`
- `commercial`

---

## Décorateurs

### @Public()

Désactive l'authentification JWT sur une route ou un controller.

```typescript
import { Public } from './common';

@Controller('health')
@Public()
export class HealthController {}
```

### @Roles(...roles)

Restreint l'accès aux utilisateurs ayant un des rôles spécifiés.

```typescript
import { Roles } from './common';

@Controller('admin')
export class AdminController {

  @Get('users')
  @Roles('admin')
  getUsers() {}

  @Get('dashboard')
  @Roles('admin', 'commercial')
  getDashboard() {}
}
```

---

## Exemples d'utilisation

**Route publique (sans auth) :**
```typescript
@Public()
@Get('status')
getStatus() {}
```

**Route protégée (JWT requis) :**
```typescript
@Get('profile')
getProfile() {}  // JWT vérifié automatiquement
```

**Route admin uniquement :**
```typescript
@Roles('admin')
@Delete('user/:id')
deleteUser() {}
```

**Combinaison controller + méthode :**
```typescript
@Controller('bo')
@Roles('admin', 'commercial')  // Appliqué à tout le controller
export class BackOfficeController {

  @Get('stats')
  getStats() {}  // admin ou commercial

  @Roles('admin')  // Override: admin uniquement
  @Delete('data')
  deleteData() {}
}
```
