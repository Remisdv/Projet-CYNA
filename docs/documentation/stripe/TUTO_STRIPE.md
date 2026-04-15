# Guide Stripe — Intégration Paiement CYNA

Ce tutoriel explique comment fonctionne l'intégration Stripe dans le projet CYNA, comment la tester, et comment la configurer pour la production.

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Configuration des clés Stripe](#2-configuration-des-clés-stripe)
3. [Flux de paiement complet](#3-flux-de-paiement-complet)
4. [Tester avec les cartes de test](#4-tester-avec-les-cartes-de-test)
5. [Webhooks Stripe](#5-webhooks-stripe)
6. [Abonnements (services)](#6-abonnements-services)
7. [Gestion du panier et du stock](#7-gestion-du-panier-et-du-stock)
8. [Passage en production](#8-passage-en-production)
9. [Dépannage](#9-dépannage)

---

## 1. Vue d'ensemble

L'architecture de paiement utilise **Stripe Elements** côté frontend et **Stripe Node.js SDK** côté backend :

```
┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐
│   Webapp React   │  POST  │  Gateway (NestJS) │  proxy │  Webapp API      │
│                  │ ──────>│                   │ ──────>│  (NestJS)        │
│  Stripe Elements │        │  Auth + JWT       │        │  StripeService   │
│  (CardElement)   │        │  x-user-id header │        │  PaymentService  │
└──────────────────┘        └──────────────────┘        └──────────────────┘
                                                              │
                                                              │ API Stripe
                                                              ▼
                                                        ┌──────────────┐
                                                        │   Stripe.com │
                                                        └──────────────┘
```

**Flux résumé :**
1. L'utilisateur remplit ses infos et voit le récapitulatif
2. Le frontend appelle `POST /api/webapp/payment/create-intent` → le backend crée un `PaymentIntent` chez Stripe et retourne un `clientSecret`
3. Le frontend utilise `stripe.confirmCardPayment(clientSecret)` avec le `CardElement` pour confirmer le paiement
4. Stripe envoie un webhook au backend quand le paiement est réussi
5. Le backend met à jour la commande et envoie l'email de confirmation

---

## 2. Configuration des clés Stripe

### 2.1 Créer un compte Stripe

1. Allez sur [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Créez un compte gratuit
3. Vous serez automatiquement en **mode test** (sandbox)

### 2.2 Récupérer vos clés

1. Connectez-vous au [Dashboard Stripe](https://dashboard.stripe.com)
2. Cliquez sur **Développeurs** → **Clés API**
3. Vous verrez deux clés :
   - **Clé publique** (`pk_test_...`) : utilisée côté frontend, visible par le navigateur
   - **Clé secrète** (`sk_test_...`) : utilisée côté backend, **ne jamais exposer**

### 2.3 Configurer le fichier `.env`

Dans `docker/dev/.env`, ajoutez ou modifiez :

```env
# ─── STRIPE ───────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_SECRETE
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SECRET_WEBHOOK
STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_PUBLIQUE
```

| Variable | Où elle est utilisée | Description |
|---|---|---|
| `STRIPE_SECRET_KEY` | `cyna-webapp-api` (backend) | Clé secrète pour créer des PaymentIntents |
| `STRIPE_WEBHOOK_SECRET` | `cyna-webapp-api` (backend) | Vérifie la signature des webhooks Stripe |
| `STRIPE_PUBLISHABLE_KEY` | `cyna-webapp-front` (frontend) | Clé publique pour initialiser Stripe.js |

### 2.4 Variables Docker

Le `docker-compose.yml` transmet automatiquement ces variables :

```yaml
# Backend (cyna-webapp-api)
environment:
  - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
  - STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}

# Frontend (cyna-webapp-front)
environment:
  - VITE_STRIPE_PK=${STRIPE_PUBLISHABLE_KEY}
```

> **Important :** Après modification du `.env`, relancez les containers :
> ```bash
> docker compose up -d --build cyna-webapp-api cyna-webapp-front
> ```

---

## 3. Flux de paiement complet

### Étape 1 — Formulaire d'informations

L'utilisateur remplit ses coordonnées (prénom, nom, email, adresse). Si l'utilisateur est connecté, le formulaire est **pré-rempli** automatiquement depuis son profil.

### Étape 2 — Récapitulatif de commande

Affichage de tous les articles du panier avec les prix unitaires, quantités et le total.

### Étape 3 — Saisie de la carte bancaire

Le composant `CardElement` de Stripe s'affiche. Voici comment ça fonctionne techniquement :

```typescript
// 1. Initialisation de Stripe côté frontend
import { loadStripe } from '@stripe/stripe-js';
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK);

// 2. Wrapping du composant avec <Elements>
<Elements stripe={stripePromise}>
  <CardElement /> {/* Champ de carte sécurisé hébergé par Stripe */}
</Elements>
```

**Quand l'utilisateur clique "Payer" :**

```typescript
// 3. Appel au backend pour créer le PaymentIntent
const result = await api.post('/webapp/payment/create-intent', {
  items: [...],
  billingAddress: { street, city, postalCode, country },
});
const clientSecret = result.clientSecret;

// 4. Confirmation du paiement avec la carte
const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: {
      name: 'Jean Dupont',
      email: 'jean@exemple.fr',
      address: { line1: '12 rue de la Paix', city: 'Paris', postal_code: '75001', country: 'FR' },
    },
  },
});

if (paymentIntent.status === 'succeeded') {
  // Paiement réussi !
}
```

### Étape 4 — Confirmation

La commande est confirmée, le panier est vidé, et un email de confirmation est envoyé.

### Côté Backend — Création du PaymentIntent

```typescript
// Le backend appelle Stripe API pour créer un PaymentIntent
const intent = await stripe.paymentIntents.create({
  amount: Math.round(montant * 100),  // Stripe utilise les centimes !
  currency: 'eur',
  customer: stripeCustomerId,
  metadata: { userId, type: 'products' },
});
// Retourne le client_secret au frontend
```

> **Note :** Les montants Stripe sont toujours en **centimes**. 29.99€ = `2999` centimes.

---

## 4. Tester avec les cartes de test

En mode test, Stripe fournit des numéros de carte fictifs. **Aucune transaction réelle n'est effectuée.**

### Cartes de test courantes

| Scénario | Numéro de carte | Date | CVC |
|---|---|---|---|
| **Paiement réussi** | `4242 4242 4242 4242` | N'importe quelle date future | N'importe quel CVC (ex: `123`) |
| **Authentification 3D Secure requise** | `4000 0025 0000 3155` | Date future | CVC quelconque |
| **Carte refusée** | `4000 0000 0000 0002` | Date future | CVC quelconque |
| **Fonds insuffisants** | `4000 0000 0000 9995` | Date future | CVC quelconque |
| **Carte expirée** | `4000 0000 0000 0069` | Date future | CVC quelconque |
| **Erreur de traitement** | `4000 0000 0000 0119` | Date future | CVC quelconque |

### Comment tester

1. Allez sur `http://localhost` (webapp frontend)
2. Connectez-vous à votre compte
3. Ajoutez des articles au panier
4. Cliquez sur **Commander** → remplissez les infos
5. À l'étape **Paiement**, entrez :
   - Numéro : `4242 4242 4242 4242`
   - Date : `12/34` (n'importe quelle date future)
   - CVC : `123`
6. Cliquez **Payer**
7. Le paiement devrait être confirmé instantanément

### Vérifier le paiement dans Stripe

1. Allez sur [https://dashboard.stripe.com/test/payments](https://dashboard.stripe.com/test/payments)
2. Vous verrez le paiement listé avec le montant et le statut `Réussi`

---

## 5. Webhooks Stripe

Les webhooks permettent à Stripe de notifier votre backend quand un événement survient (paiement réussi, échoué, abonnement annulé, etc.).

### 5.1 Événements gérés

| Événement | Action du backend |
|---|---|
| `payment_intent.succeeded` | Met la commande en statut `CONFIRMED` + `PAID`, vide le panier, envoie l'email de confirmation |
| `payment_intent.payment_failed` | Met le paiement en statut `FAILED` |
| `invoice.paid` | Active l'abonnement |
| `customer.subscription.deleted` | Marque l'abonnement comme expiré |

### 5.2 Configuration locale avec Stripe CLI

En développement local, Stripe ne peut pas atteindre `localhost`. Utilisez la **Stripe CLI** pour rediriger les webhooks :

1. **Installer Stripe CLI** :
   ```bash
   # Windows (avec scoop)
   scoop install stripe

   # Ou téléchargez depuis https://stripe.com/docs/stripe-cli
   ```

2. **Se connecter** :
   ```bash
   stripe login
   ```

3. **Écouter les webhooks** :
   ```bash
   stripe listen --forward-to http://localhost/api/webapp/payment/stripe/webhook
   ```

4. Stripe CLI affichera un `whsec_...` — copiez-le dans votre `.env` :
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxx
   ```

5. **Relancez le container** :
   ```bash
   cd docker/dev
   docker compose up -d --build cyna-webapp-api
   ```

### 5.3 Tester les webhooks manuellement

```bash
# Déclencher un événement de test
stripe trigger payment_intent.succeeded
```

### 5.4 Sans Stripe CLI (mode simplifié)

Si vous ne configurez pas les webhooks, le paiement fonctionnera quand même côté frontend (le `confirmCardPayment` retourne le statut). Le backend recevra juste un statut `succeeded` directement du frontend flow, sans la double vérification du webhook.

> Pour les tests rapides, vous pouvez mettre une valeur fictive pour `STRIPE_WEBHOOK_SECRET` — les webhooks échoueront silencieusement mais le flow de base fonctionnera.

---

## 6. Abonnements (services)

Les articles de type `service` sont traités comme des **abonnements Stripe** (récurrents).

### Flux d'abonnement

1. Le backend crée un `Price` Stripe avec `recurring: { interval: 'month' | 'year' }`
2. Puis crée une `Subscription` Stripe avec `payment_behavior: 'default_incomplete'`
3. La première facture génère un `PaymentIntent` dont le `clientSecret` est renvoyé au frontend
4. Le frontend confirme le paiement comme pour un achat unique

### Types de périodicité

| Périodicité | Intervalle Stripe | Description |
|---|---|---|
| `mensuel` | `month` | Facturé chaque mois |
| `annuel` | `year` | Facturé chaque année |

Le tarif appliqué correspond à `prix_mensuel` ou `prix_annuel` du produit.

---

## 7. Gestion du panier et du stock

### Mode non-connecté (localStorage)
- Les articles sont stockés dans le `localStorage` du navigateur
- Pas de réservation de stock
- Les données persistent tant que le navigateur ne les supprime pas

### Mode connecté (serveur)
- Les articles sont sauvegardés en BDD (table `cart_items`)
- **Réservation de stock** : quand un article est ajouté au panier, le stock est décrémenté via l'API service
- **TTL de 1 heure** : si le panier n'est pas acheté dans l'heure, le stock est automatiquement relâché
- Un cron job tourne toutes les minutes pour vérifier les réservations expirées

### Fusion panier
Quand un utilisateur se connecte :
1. Le panier localStorage est automatiquement fusionné avec le panier serveur
2. Les articles en double voient leur quantité additionnée
3. Le localStorage est vidé après la fusion

### Après paiement réussi
- Le webhook `payment_intent.succeeded` appelle `cartService.markPurchased(userId)`
- Le panier est vidé **sans relâcher le stock** (les articles sont achetés)

---

## 8. Passage en production

### 8.1 Obtenir les clés de production

1. Dans le Dashboard Stripe, basculez du **mode test** au **mode live** (en haut à droite)
2. Complétez la vérification de votre identité / entreprise
3. Récupérez les clés live :
   - `pk_live_...` (clé publique)
   - `sk_live_...` (clé secrète)

### 8.2 Configurer les webhooks de production

1. Dashboard Stripe → **Développeurs** → **Webhooks**
2. Cliquez **Ajouter un point de terminaison**
3. URL : `https://votre-domaine.com/api/webapp/payment/stripe/webhook`
4. Événements à écouter :
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `invoice.paid`
   - `customer.subscription.deleted`
5. Copiez le **Secret de signature** (`whsec_...`) dans votre `.env` de production

### 8.3 Checklist production

- [ ] Remplacer les clés test par les clés live dans le `.env`
- [ ] Configurer le webhook de production dans le Dashboard Stripe
- [ ] Mettre à jour `STRIPE_WEBHOOK_SECRET` avec le secret de production
- [ ] Activer HTTPS (obligatoire pour Stripe en production)
- [ ] Tester avec une vraie carte (Stripe ne facture que les transactions réussies)
- [ ] Vérifier le Compliance : mentions légales, CGV, politique de remboursement

### 8.4 Sécurité

- Ne **jamais** exposer `STRIPE_SECRET_KEY` côté frontend
- Toujours vérifier la signature des webhooks avec `STRIPE_WEBHOOK_SECRET`
- Utiliser HTTPS en production
- Les montants sont calculés côté backend, pas côté frontend (empêche la manipulation)

---

## 9. Dépannage

### Le champ de carte ne s'affiche pas

- Vérifiez que `VITE_STRIPE_PK` est bien défini dans les variables d'environnement du container frontend
- Vérifiez la console du navigateur pour des erreurs Stripe.js
- La clé publique doit commencer par `pk_test_` ou `pk_live_`

### Erreur "Votre clé API est invalide"

- Vérifiez `STRIPE_SECRET_KEY` dans le `.env`
- Assurez-vous que le container webapp-api a bien été relancé après le changement

### Le webhook ne fonctionne pas

- Vérifiez que Stripe CLI écoute (en dev local)
- Vérifiez `STRIPE_WEBHOOK_SECRET` correspond à celui affiché par Stripe CLI
- Vérifiez les logs : `docker logs cyna-webapp-api --tail 50`

### Erreur "Montant minimum"

- Stripe requiert un montant minimum de **0.50€** (50 centimes)
- Vérifiez que vos produits ont des prix >= 0.50€

### Le paiement est "en cours de traitement"

- Certaines cartes de test (3D Secure) nécessitent une authentification supplémentaire
- En production, le client sera redirigé vers sa banque pour validation

### Vérifier les paiements

Consultez toujours le [Dashboard Stripe](https://dashboard.stripe.com/test/payments) pour voir l'historique des paiements, les erreurs et les logs détaillés.

---

## Fichiers concernés

| Fichier | Rôle |
|---|---|
| `service/api/cyna-webapp-api/src/service/Stripe/Stripe.service.ts` | SDK Stripe (create customer, intent, subscription) |
| `service/api/cyna-webapp-api/src/service/Payment/Payment.service.ts` | Logique métier (commandes, webhooks) |
| `service/api/cyna-webapp-api/src/endpoint/Payment/Payment.controller.ts` | Routes `/payment/create-intent` et `/payment/stripe/webhook` |
| `service/api/cyna-webapp-api/src/service/Cart/Cart.service.ts` | Panier + réservation de stock |
| `service/api/cyna-gateway-api/src/endpoint/WebappPaymentProxy.controller.ts` | Proxy Gateway pour le paiement |
| `service/front/webapp/src/features/checkout/CheckoutPage.tsx` | Page checkout 4 étapes + Stripe Elements |
| `service/front/webapp/src/features/checkout/hooks/usePayment.ts` | Hook React Query pour `create-intent` |
| `docker/dev/.env` | Variables d'environnement (clés Stripe) |
