# Seeds - Users

Ce dossier contient les scripts de seed pour initialiser la base de données avec des données d'exemple.

## Fichiers des seeds

- **users.seed.ts** : Crée 5 utilisateurs d'exemple pour tester l'API

## Données de seed

### Utilisateurs

| Email | Nom | Rôle | Statut |
|-------|------|------|--------|
| admin@cyna.fr | Admin CYNA | ADMIN | ACTIVE |
| user1@cyna.fr | Jean Dupont | ADMIN | ACTIVE |
| user2@cyna.fr | Marie Martin | USER | ACTIVE |
| user3@cyna.fr | Pierre Bernard | USER | INACTIVE |
| user4@cyna.fr | Sophie Durand | ADMIN | ACTIVE |

**Mot de passe temporaire par défaut :** `TempPassword123!`

## Comment exécuter les seeds

### Via npm/yarn

```bash
# Dans le dossier cyna-bo-api
yarn seed:users
# ou
npm run seed:users
```

### Via ts-node directement

```bash
ts-node -r tsconfig-paths/register src/database/seeds/users.seed.ts
```

## Comportement

- Les seeds vérifient si des données existent déjà avant de les insérer
- Si des utilisateurs existent déjà, le seed s'arrête et n'insère rien
- Tous les mots de passe sont hashés avec SHA256 (à remplacer par bcrypt/argon2 en production)

## Notes

- Les seeds ne doivent être exécutés qu'une seule fois ou après un reset de la base de données
- En production, utiliser un vrai service d'envoi d'email pour les mots de passe temporaires
