# CYNA Back-Office

Interface d'administration complète pour la plateforme CYNA SaaS.

## 🎯 Fonctionnalités Implémentées

### ✅ Authentification & Sécurité
- Login admin avec email/password
- 2FA (Two-Factor Authentication) par email
- Gestion de session avec JWT tokens
- Refresh automatique des tokens
- Protection des routes

### 📊 Dashboard
- Statistiques en temps réel (revenu total, abonnements actifs)
- Graphiques interactifs avec Recharts :
  - Évolution du revenu sur 7j/30j/90j
  - Services les plus vendus (bar chart)
- Alertes de stock faible
- Design moderne et responsive

### 🛍️ Gestion Catalogue
#### Services
- Liste complète des services avec filtres
- Création/Modification/Suppression (CRUD complet)
- Multi-langues (FR/EN)
- Gestion des plans tarifaires (illimités)
- Gestion du stock (quantité, seuil d'alerte)
- Upload d'images
- Activation/Désactivation

#### Catégories
- CRUD complet
- Multi-langues (FR/EN)
- Système de slug pour URLs SEO-friendly
- Activation/Désactivation

### 📝 Gestion Contenu
#### FAQ
- CRUD complet
- Multi-langues (FR/EN)
- Ordre personnalisable
- Support des questions/réponses hiérarchiques

#### Carousel
- CRUD complet des slides
- Images, titres, textes, liens
- Ordre personnalisable

#### Publicités
- CRUD complet
- Gestion des dates de début/fin
- Positions configurables
- Statut actif/inactif automatique

### 👥 Gestion Utilisateurs
- Liste complète des utilisateurs
- CRUD complet
- Gestion des rôles (CUSTOMER, SUPPORT, ADMIN, SUPERADMIN)
- Activation/Désactivation des comptes
- Modification des mots de passe

## 🏗️ Architecture Technique

### Stack Frontend
- **React** 18.2.0 - UI Library
- **React Router** 6.18.0 - Navigation
- **TypeScript** 5.2.2 - Type Safety
- **Vite** 5.0.0 - Build Tool & Dev Server
- **Tailwind CSS** 3.3.5 - Styling
- **TanStack Query** 5.12.2 - Server State Management
- **React Hook Form** 7.48.2 - Form Management
- **Zod** 3.22.4 - Schema Validation
- **Recharts** 2.9.0 - Data Visualization
- **Lucide React** 0.292.0 - Icons
- **Axios** 1.6.2 - HTTP Client

### Structure du Projet
```
frontend/back-office/
├── src/
│   ├── components/
│   │   └── ui/              # Composants UI réutilisables
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Card.tsx
│   │       ├── Table.tsx
│   │       ├── Modal.tsx
│   │       ├── Badge.tsx
│   │       ├── Textarea.tsx
│   │       └── Select.tsx
│   ├── context/
│   │   └── AuthContext.tsx  # Contexte d'authentification
│   ├── layouts/
│   │   └── MainLayout.tsx   # Layout principal avec sidebar
│   ├── pages/
│   │   ├── auth/            # Pages d'authentification
│   │   ├── dashboard/       # Dashboard avec statistiques
│   │   ├── catalog/         # Gestion catalogue
│   │   │   ├── ServicesPage.tsx
│   │   │   ├── ServiceFormModal.tsx
│   │   │   ├── CategoriesPage.tsx
│   │   │   └── CategoryFormModal.tsx
│   │   ├── content/         # Gestion contenu
│   │   │   ├── FAQPage.tsx
│   │   │   ├── FAQFormModal.tsx
│   │   │   ├── CarouselPage.tsx
│   │   │   ├── CarouselFormModal.tsx
│   │   │   ├── AdvertisementsPage.tsx
│   │   │   └── AdvertisementFormModal.tsx
│   │   └── users/           # Gestion utilisateurs
│   │       ├── UsersPage.tsx
│   │       └── UserFormModal.tsx
│   ├── services/
│   │   ├── api.ts           # Client Axios avec intercepteurs
│   │   └── queries.ts       # Hooks React Query
│   ├── lib/
│   │   └── utils.ts         # Utilitaires (cn, etc.)
│   ├── App.tsx              # Configuration routes
│   └── main.tsx             # Point d'entrée
├── Dockerfile
└── package.json
```

## 🎨 Design System

### Sidebar Navigation
- Design moderne avec dégradés (bleu)
- Navigation hiérarchique avec sous-menus
- Indicateurs visuels pour la route active
- Informations utilisateur en bas
- Bouton de déconnexion

### Composants UI
Tous les composants suivent le même design system :
- Palette de couleurs cohérente (bleu primaire, gris neutres)
- Transitions et animations fluides
- States visuels clairs (hover, active, disabled)
- Responsive design
- Accessibilité

### Modales
- Overlay avec backdrop blur
- Tailles configurables (sm, md, lg, xl, full)
- Header avec titre et bouton fermer
- Footer avec actions
- Contenu scrollable

## 🔌 API Integration

### Endpoints Utilisés
Tous les endpoints communiquent avec `/api/bo` :

**Dashboard**
- `GET /dashboard/overview?range=30d`

**Utilisateurs**
- `GET /users`
- `POST /users`
- `PUT /users/:id`
- `DELETE /users/:id`

**Catégories**
- `GET /categories`
- `POST /categories`
- `PUT /categories/:id`
- `DELETE /categories/:id`

**Services**
- `GET /services`
- `GET /services/:id`
- `POST /services`
- `PUT /services/:id`
- `DELETE /services/:id`
- `GET /stocks/low`

**Contenu**
- `GET/POST/PUT/DELETE /faq/:id`
- `GET/POST/PUT/DELETE /carousel/:id`
- `GET/POST/PUT/DELETE /advertisements/:id`

**Fichiers**
- `POST /file/upload`

### Gestion des Erreurs
- Refresh automatique du token JWT (401)
- Déconnexion automatique si refresh échoue
- Messages d'erreur utilisateur-friendly
- Retry automatique des requêtes (1x)

## 🚀 Développement

### Installation
```bash
cd frontend/back-office
npm install
```

### Démarrage en mode développement
```bash
npm run dev
# Serveur Vite démarre sur http://localhost:5173
```

### Build pour production
```bash
npm run build
# Génère les fichiers dans /dist
```

### Variables d'Environnement
Le back-office utilise le proxy Traefik, donc toutes les requêtes API sont relatives à `/api/bo`.

## 🐳 Docker

### Build de l'image
```bash
docker-compose build back-office
```

### Démarrage
```bash
docker-compose up -d back-office
```

L'application est accessible via Traefik sur `http://localhost/admin`

## 📝 Utilisation

### Premier Login
1. Accéder à `http://localhost/admin/login`
2. Se connecter avec un compte admin :
   - Email: admin@cyna.com
   - Password: (défini lors du seeding)
3. Entrer le code 2FA reçu par email (ou `123456` en dev)
4. Redirection vers le dashboard

### Navigation
- **Dashboard** : Vue d'ensemble des statistiques
- **Catalogue** :
  - Services : Gérer les produits/services
  - Catégories : Organiser les services
- **Contenu** :
  - FAQ : Questions fréquentes
  - Carousel : Slides page d'accueil
  - Publicités : Bannières promotionnelles
- **Utilisateurs** : Gestion des comptes

### Workflow Typique

#### Créer un nouveau service
1. Aller dans Catalogue > Services
2. Cliquer sur "Nouveau Service"
3. Remplir les informations :
   - Slug, catégorie, statut
   - Traductions FR/EN
   - Plans tarifaires (ajouter autant que nécessaire)
   - Stock
4. Enregistrer

#### Modifier une FAQ
1. Aller dans Contenu > FAQ
2. Cliquer sur l'icône Edit
3. Modifier les champs
4. Enregistrer

## 🔒 Sécurité

### Authentification
- JWT stockés dans localStorage (avec mécanisme de refresh)
- Tokens expirés automatiquement (8h pour admin)
- 2FA obligatoire pour tous les admins

### Autorisations
Les routes sont protégées par rôle au niveau backend :
- SUPPORT : Accès lecture tickets
- ADMIN : Accès complet catalogue/contenu
- SUPERADMIN : Accès complet + gestion utilisateurs

## 🎯 Prochaines Évolutions

### Non implémenté (selon cahier des charges)
- ❌ Système de tickets/chat temps réel (sera un microservice séparé)
- ❌ Page contents éditable (textes marketing)
- ❌ Gestion des abonnements détaillée

### Améliorations futures
- Export de données (CSV, Excel)
- Filtres avancés sur toutes les listes
- Upload d'images via drag & drop
- Prévisualisation avant publication
- Historique des modifications
- Notifications push
- Mode sombre

## 🐛 Debug

### Logs
```bash
# Logs du back-office
docker-compose logs -f back-office

# Logs de l'API BO
docker-compose logs -f bo-api
```

### Problèmes courants

**Erreur 401 lors de l'accès aux pages**
- Vérifier que le token JWT est valide
- Se déconnecter et se reconnecter

**Erreur de connexion à l'API**
- Vérifier que bo-api est bien démarré
- Vérifier Traefik : `http://localhost:8080`

**Build TypeScript échoue**
- Vérifier les types dans les fichiers modifiés
- Nettoyer node_modules : `rm -rf node_modules && npm install`

## 📄 License

Projet privé CYNA SaaS - Tous droits réservés

## 👥 Contribution

Interface développée pour répondre au cahier des charges CYNA_Dev_ARCHI.md
