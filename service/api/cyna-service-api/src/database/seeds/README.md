# Seeds - Services

Ce dossier contient les scripts de seed pour initialiser la base de données avec des données d'exemple.

## Fichiers des seeds

- **services.seed.ts** : Crée 4 catégories et 8 services d'exemple pour tester l'API

## Données de seed

### Catégories

1. **Cybersécurité** - Services et solutions de cybersécurité
2. **Audit de sécurité** - Audits et tests de pénétration
3. **Conformité** - Services de conformité et gouvernance
4. **Formation** - Formations en sécurité informatique

### Services

**Cybersécurité :**
- Threat Intelligence
- EDR - Endpoint Detection and Response
- XDR - Extended Detection and Response

**Audit de sécurité :**
- Test de pénétration

**Conformité :**
- Audit de conformité GDPR
- Audit de conformité ISO 27001

**Formation :**
- Formation cybersécurité niveau 1 (Publié)
- Formation cybersécurité niveau avancé (Brouillon)

## Comment exécuter les seeds

### Via npm/yarn

```bash
# Dans le dossier cyna-service-api
yarn seed:services
# ou
npm run seed:services
```

### Via ts-node directement

```bash
ts-node -r tsconfig-paths/register src/database/seeds/services.seed.ts
```

## Comportement

- Les seeds vérifient si des catégories existent déjà avant de les insérer
- Si des catégories existent déjà, le seed s'arrête et n'insère rien
- Les slugs sont générés automatiquement et sont uniques

## Notes

- Les slugs sont générés à partir des noms et garantis d'être uniques
- Les métadonnées SEO (meta_title, meta_description, keywords) sont incluses
- Tous les services sont en statut PUBLISHED sauf "Formation cybersécurité niveau avancé" qui est en DRAFT
