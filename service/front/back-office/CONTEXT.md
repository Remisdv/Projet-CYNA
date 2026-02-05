# Contexte : Back-Office (Frontend Admin)

## Responsabilités
Interface d'administration pour les équipes internes.

## Pages Clés
- `/dashboard` : Vue d'ensemble.
- `/catalog` : Gestion produits/catégories.
- `/support` : Gestion tickets.
- `/content` : CMS.

## Stack Technique
- **Framework**: React (SPA) + Vite (recommandé) ou Create React App.
- **UI**: Tailwind CSS.
- **Router**: React Router.
- **Port Interne**: 80 (via Nginx pour servir les fichiers statiques).

## Sécurité
- Authentification forte requise (JWT stocké en HttpOnly cookie idéalement, ou localStorage avec précautions).
