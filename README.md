# Projet CYNA

Plateforme de cybersécurité B2B/B2C — monorepo fullstack (NestJS + React + Docker).

---

## Prérequis

- [Docker](https://www.docker.com/) & Docker Compose
- [Node.js](https://nodejs.org/) >= 18
- [Yarn](https://yarnpkg.com/) >= 4 (`npm install -g yarn`)
- PowerShell (Windows) ou Bash (Linux/macOS)

---

## Lancement du projet

### Windows (PowerShell)

```powershell
# Démarrer la stack complète
.\docker\start.all.stack.ps1

# Arrêter
.\docker\stop.all.stack.ps1

# Reset complet (supprime volumes et images, rebuild from scratch)
.\docker\reset.all.stack.ps1

# Rebuild + restart rapide
.\docker\restart.ps1
```

### Linux / macOS (Bash)

```bash
# Démarrer la stack complète
bash docker/start.all.stack.sh

# Arrêter
bash docker/stop.all.stack.sh

# Reset complet
bash docker/reset.all.stack.sh
```

---

## Services & Ports

Tout passe par le reverse proxy **Nginx** sur le port 80. Pas besoin d'accéder aux ports internes directement.

| Service | URL |
|---|---|
| Webapp (portail client) | http://localhost |
| Back-Office UI | http://bo.localhost |
| Gateway API | http://api.localhost |
| Swagger API Docs | http://api.localhost/docs |
| MailHog (emails de dev) | http://localhost:8025 |
| PostgreSQL | localhost:5432 |
| Elasticsearch | localhost:9200 |

---

## Seeding (données de test)

Une fois la stack démarrée, lancer le script de seed complet :

```powershell
.\docker\seed-all.ps1
```

Ce script insère dans l'ordre :

1. **Services & produits** — 8 services de cybersécurité + 48 produits
2. **Commandes BO** — 15 commandes (~105k€ de CA pour le dashboard)
3. **Utilisateurs BO** — 4 admins + 2 commerciaux
4. **Promos & carousel** — 8 catégories, 3 textes promo, 4 items carousel
5. **Utilisateurs webapp** — 3 comptes clients
6. **Commandes webapp** — Commandes + abonnements clients

### Comptes de test

> Mot de passe universel : `Password123!`

| Rôle | Email |
|---|---|
| Admin BO | admin@cyna.fr |
| Admin BO | lucas@cyna.fr |
| Admin BO | titouan@cyna.fr |
| Admin BO | remi@cyna.fr |
| Client webapp | lucas@cyna.fr |
| Client webapp | titouan@cyna.fr |
| Client webapp | remi@cyna.fr |

---

## Structure du monorepo

```
docker/          Scripts de gestion de la stack
service/
  api/
    cyna-gateway-api/    API Gateway (port 3000)
    cyna-bo-api/         API Back-Office
    cyna-service-api/    API Services & Produits
    cyna-webapp-api/     API Webapp (Stripe)
  front/
    back-office/         UI Back-Office (React + Vite)
    webapp/              UI Webapp (React + Vite + Stripe)
```
