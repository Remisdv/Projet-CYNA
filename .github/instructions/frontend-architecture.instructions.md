---
applyTo: "service/front/**/*.{ts,tsx}"
---

# Architecture cible — Front-end (Feature-Based)

Architecture **feature-based** pour `cyna-bo-front` et `cyna-webapp-front` (React 18 + Vite + TanStack Query + React Router + React Hook Form + Tailwind + axios).

Principe : **chaque feature est une boîte autonome** qui contient son UI, ses hooks, ses appels API et ses types. On évite les dossiers transverses fourre-tout (`components/`, `hooks/`, `types/` à la racine).

---

## 1. Couches & responsabilités

```
┌──────────────────────────────────────────────────────────┐
│   Page (route)         CategoriesPage.tsx                │  Composition + layout
└────────────────┬─────────────────────────────────────────┘
                 ▼
┌──────────────────────────────────────────────────────────┐
│   Components (UI)      CategoryFormModal.tsx             │  Présentation / form
└────────────────┬─────────────────────────────────────────┘
                 ▼
┌──────────────────────────────────────────────────────────┐
│   Hooks (logique)      useCategories.ts                  │  TanStack Query, état
└────────────────┬─────────────────────────────────────────┘
                 ▼
┌──────────────────────────────────────────────────────────┐
│   API (data)           categories.api.ts                 │  Appels HTTP (axios)
└────────────────┬─────────────────────────────────────────┘
                 ▼
┌──────────────────────────────────────────────────────────┐
│   Types                category.types.ts                 │  Contrats TS
└──────────────────────────────────────────────────────────┘
```

| Couche | Rôle | Connaît | Ne connaît PAS |
|---|---|---|---|
| **Page** | Route racine. Compose layout + sous-composants. | Components, hooks de la feature | API, axios |
| **Component** | UI pure ou stateful local (form, modal). | Types, hooks (props uniquement) | API directement |
| **Hook** | Encapsule TanStack Query + état métier. | API, types | UI / JSX |
| **API** | Fonctions d'appel HTTP. Renvoie les types. | `apiClient` axios partagé, types | React, hooks |
| **Type** | Interfaces / DTO front. | rien | React, axios |

**Règle d'or :** un composant n'appelle **jamais** axios directement. Il passe **toujours** par un hook, qui passe par la couche API.

---

## 2. Arborescence type d'un projet front

```
src/
├── app/
│   ├── App.tsx                  Router racine
│   ├── main.tsx                 Bootstrap (QueryClient, providers)
│   └── routes.tsx               (optionnel) déclaration des routes
├── features/
│   ├── catalog/
│   │   ├── pages/
│   │   │   ├── CategoriesPage.tsx
│   │   │   └── ServicesPage.tsx
│   │   ├── components/
│   │   │   ├── CategoryFormModal.tsx
│   │   │   └── ServiceFormModal.tsx
│   │   ├── hooks/
│   │   │   ├── useCategories.ts
│   │   │   └── useServices.ts
│   │   ├── api/
│   │   │   ├── categories.api.ts
│   │   │   └── services.api.ts
│   │   └── types/
│   │       ├── category.types.ts
│   │       └── service.types.ts
│   │   └── locales/
│   │       └── fr.ts            Traductions FR de la feature
│   ├── orders/...
│   └── auth/...
├── shared/                      Code RÉUTILISÉ par 2+ features
│   ├── components/ui/           Boutons, inputs, modals génériques
│   ├── hooks/                   useDebounce, useToggle, useMediaQuery...
│   ├── lib/
│   │   ├── apiClient.ts         Client axios configuré (baseURL, interceptors)
│   │   ├── queryClient.ts       Configuration TanStack QueryClient
│   │   ├── i18n.ts              Init i18next + bundle des locales
│   │   └── utils.ts             formatDate, slugify...
│   └── types/                   User, Pagination<T>, ApiError
├── layouts/                     Layouts partagés (Sidebar, Topbar)
├── locales/
│   └── fr.ts                    Traductions globales (commun, navigation)
└── styles/                      index.css, tailwind.css
```

**Conventions de nommage :**
- Pages : `XxxPage.tsx` (PascalCase + suffixe `Page`)
- Composants : `XxxYyy.tsx` (descriptif : `CategoryFormModal`, pas `Modal`)
- Hooks : `useXxx.ts` (camelCase, préfixe `use`)
- API : `xxx.api.ts`
- Types : `xxx.types.ts`

---

## 3. Patterns par couche

### 3.1 Page — composition

```tsx
// features/catalog/pages/CategoriesPage.tsx
import { useState } from 'react';
import { useCategories } from '../hooks/useCategories';
import { CategoryFormModal } from '../components/CategoryFormModal';

export function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const [editingId, setEditingId] = useState<string | null>(null);

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div>
      <h1>Catégories</h1>
      <ul>
        {categories?.map((c) => (
          <li key={c.id} onClick={() => setEditingId(c.id)}>{c.slug}</li>
        ))}
      </ul>
      {editingId && <CategoryFormModal id={editingId} onClose={() => setEditingId(null)} />}
    </div>
  );
}
```

**Règles Page :**
- Composer, **pas** implémenter de logique métier complexe.
- Pas d'`axios`, pas de `fetch` direct.
- Garde l'état d'orchestration UI (modal ouvert/fermé, sélection).

### 3.2 Component — UI

Deux types de composants :

**a) Présentation pure** — pas d'état, pas de hook data → va dans `shared/components/ui/` :

```tsx
// shared/components/ui/Button.tsx
export function Button({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className="px-4 py-2 rounded bg-blue-600 text-white" {...props}>{children}</button>;
}
```

**b) Composant feature** (formulaire, modal d'une feature) — peut utiliser des hooks de la même feature :

```tsx
// features/catalog/components/CategoryFormModal.tsx
import { useForm } from 'react-hook-form';
import { useCreateCategory } from '../hooks/useCategories';
import type { CategoryInput } from '../types/category.types';

interface Props { onClose: () => void; }

export function CategoryFormModal({ onClose }: Props) {
  const { register, handleSubmit } = useForm<CategoryInput>();
  const createCategory = useCreateCategory();

  const onSubmit = (data: CategoryInput) => {
    createCategory.mutate(data, { onSuccess: onClose });
  };

  return <form onSubmit={handleSubmit(onSubmit)}>{/* ... */}</form>;
}
```

**Règles Component :**
- Pas d'appel API direct (toujours via hook).
- Props **typées** (interface dédiée si > 2 props).
- Présentation pure → `shared/components/ui/`. Feature → `features/<X>/components/`.

### 3.3 Hook — TanStack Query + logique

```ts
// features/catalog/hooks/useCategories.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../api/categories.api';
import type { CategoryInput } from '../types/category.types';

const QUERY_KEY = ['categories'] as const;

export function useCategories() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: categoriesApi.list,
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => categoriesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CategoryInput) => categoriesApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
```

**Règles Hook :**
- **Toujours** déléguer l'appel HTTP à `*.api.ts`.
- **Pas** d'`axios` ni de `fetch` ici.
- Centraliser les `queryKey` (constante locale au fichier).
- Un fichier de hook par sous-domaine (`useCategories.ts`, pas `useCatalog.ts` fourre-tout).

### 3.4 API — appels HTTP

```ts
// features/catalog/api/categories.api.ts
import { apiClient } from '@/shared/lib/apiClient';
import type { Category, CategoryInput } from '../types/category.types';

export const categoriesApi = {
  list: async (): Promise<Category[]> => {
    const { data } = await apiClient.get<Category[]>('/categories');
    return data;
  },
  getById: async (id: string): Promise<Category> => {
    const { data } = await apiClient.get<Category>(`/categories/${id}`);
    return data;
  },
  create: async (input: CategoryInput): Promise<Category> => {
    const { data } = await apiClient.post<Category>('/categories', input);
    return data;
  },
  update: async (id: string, input: CategoryInput): Promise<Category> => {
    const { data } = await apiClient.put<Category>(`/categories/${id}`, input);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};
```

**Règles API :**
- **Seul** endroit autorisé à utiliser le client axios (en dehors de `shared/lib/apiClient.ts` qui le configure).
- Exporte un objet (`categoriesApi`) ou des fonctions nommées — pas de classe.
- Renvoie des types stricts (jamais `any`).
- Pas de logique métier, pas de mapping complexe (rester proche du backend).

### 3.5 Types — contrats

```ts
// features/catalog/types/category.types.ts
export interface CategoryTranslation {
  id: string;
  lang: string;
  name: string;
  description: string;
}

export interface Category {
  id: string;
  slug: string;
  isActive: boolean;
  translations: CategoryTranslation[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInput {
  slug: string;
  isActive?: boolean;
  translations: Array<{ lang: string; name: string; description?: string }>;
}
```

**Règles Types :**
- Préférer `interface` pour les objets, `type` pour les unions / utilitaires.
- Pas de logique, juste la forme des données.
- Si un type est utilisé par 2+ features → `shared/types/`.

---

## 4. Couche `shared/` — code réellement partagé

À utiliser **uniquement** quand quelque chose est consommé par **2 features ou plus**.

```
shared/
├── components/ui/        Button, Input, Modal, Table — génériques sans logique métier
├── hooks/                useDebounce, useToggle — hooks utilitaires sans appel API
├── lib/
│   ├── apiClient.ts      Client axios configuré (baseURL, interceptors)
│   ├── queryClient.ts    Configuration TanStack QueryClient
│   └── utils.ts          formatDate, slugify...
└── types/                User, Pagination<T>, ApiError — types globaux
```

**Règle :** dès qu'on hésite entre `features/X/` et `shared/`, on commence dans `features/X/` et on remonte uniquement quand la duplication apparaît.

---

## 5. Pureté des fichiers — chaque chose à sa place

Règle stricte : **un fichier = un type d'artefact**. Pas de définitions parasites.

| Fichier | Doit contenir | À PROSCRIRE absolument |
|---|---|---|
| `*Page.tsx` | Le composant Page racine de la route. | Hooks data réutilisables exportés, types métier exportés, fonctions API, sous-composants réutilisables, **plus de 300 lignes** |
| `*.tsx` (component) | UN composant React + ses sous-composants strictement privés. | Types exportés, fonctions API, hooks de query exportés, **plus de 300 lignes**, **chaînes en dur** (utiliser `t()`) |
| `use*.ts` | Hooks React (`useQuery`, `useMutation`, état). | Types métier exportés, fonctions axios, **plus de 300 lignes** |
| `*.api.ts` | Fonctions d'appel HTTP. | Hooks React, JSX, état React, types métier (sauf import) |
| `*.types.ts` | `interface` / `type` uniquement. | Code exécutable, JSX, fonctions, axios |
| `locales/fr.ts` | Objet de traductions (clés → chaînes). | JSX, hooks, axios, logique |

**Exemples interdits :**

```tsx
// ❌ CategoriesPage.tsx — interface API et axios dans la page
interface Category { id: string; }                          // → category.types.ts
const { data } = await axios.get('/categories');            // → categories.api.ts via hook
```

```ts
// ❌ useCategories.ts — type ET appel HTTP redéclarés ici
export interface Category { /* ... */ }                     // → category.types.ts
const { data } = await axios.get('/categories');            // → categories.api.ts
```

```tsx
// ❌ CategoryFormModal.tsx — appel API direct
const onSubmit = async (data) => {
  await axios.post('/categories', data);                    // → useCreateCategory().mutate(data)
};
```

```ts
// ❌ categories.api.ts — JSX ou hook
export function CategoriesList() { return <div />; }        // → un component
export function useFoo() { /* ... */ }                      // → un hook
```

**Vérification rapide avant de commit :**
1. Le nom du fichier (`*Page.tsx`, `use*.ts`, `*.api.ts`, `*.types.ts`) correspond-il à ce qu'il contient ?
2. Y a-t-il un import `axios` ailleurs que dans `*.api.ts` ou `shared/lib/apiClient.ts` ? → Bouger.
3. Une `interface`/`type` exportée déclarée ailleurs que dans `*.types.ts` ? → Bouger.
4. Un appel direct `fetch`/`axios` dans un composant ? → Passer par un hook.

---

## 6. Règles transverses

### Taille des fichiers — atomicité

**Limite stricte : 300 lignes par fichier.** Au-delà, c'est le signal qu'il faut découper.

Stratégies de découpage selon le type de fichier :

| Fichier trop long | Comment découper |
|---|---|
| `XxxPage.tsx` qui dépasse 300 lignes | Extraire les sections en sous-composants : `XxxHeader.tsx`, `XxxFilters.tsx`, `XxxTable.tsx` dans `features/<X>/components/` |
| `XxxFormModal.tsx` trop gros | Extraire les champs complexes en sous-composants `XxxFieldA.tsx`, `XxxFieldB.tsx` ; sortir la validation dans `xxx.schema.ts` |
| `useXxx.ts` qui regroupe trop de hooks | Splitter par usage : `useXxxList.ts`, `useXxxMutations.ts`, `useXxxFilters.ts` |
| `xxx.api.ts` avec trop d'endpoints | Splitter par sous-domaine : `xxx-list.api.ts`, `xxx-stats.api.ts` (ou créer une sous-feature) |
| `xxx.types.ts` trop fourni | Splitter par entité : `category.types.ts`, `category-translation.types.ts` |

**Règles :**
- Un composant > 150 lignes JSX → extraire des sous-composants.
- Un fichier qui fait 2 choses (ex: liste + formulaire) → 2 fichiers.
- Préférer 3 petits fichiers cohérents à 1 gros fichier multi-responsabilité.
- Les sous-composants **privés** à un parent (non réutilisés) restent à côté dans `components/` avec un nom préfixé : `CategoriesPage.tsx` + `CategoriesPageHeader.tsx`.

### Internationalisation (i18n)

Le projet est **monolingue FR** pour l'instant, mais la structure doit être prête pour ajouter d'autres langues plus tard. **Pas de chaînes en dur dans le JSX.**

**Stack :** `react-i18next` + `i18next`.

**Organisation des traductions :**
- Chaque feature porte ses propres clés dans `features/<X>/locales/fr.ts`.
- Les libellés transverses (navigation, boutons communs, erreurs génériques) vont dans `src/locales/fr.ts`.
- Le namespace i18next correspond au nom de la feature : `catalog`, `orders`, `common`...

**Init (à mettre dans `shared/lib/i18n.ts`) :**

```ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import common from '@/locales/fr';
import catalog from '@/features/catalog/locales/fr';
import orders from '@/features/orders/locales/fr';

void i18n.use(initReactI18next).init({
  lng: 'fr',
  fallbackLng: 'fr',
  defaultNS: 'common',
  resources: {
    fr: { common, catalog, orders },
  },
  interpolation: { escapeValue: false },
});

export default i18n;
```

**Fichier de traductions feature :**

```ts
// features/catalog/locales/fr.ts
export default {
  pageTitle: 'Catégories',
  createButton: 'Nouvelle catégorie',
  form: {
    slug: 'Slug',
    name: 'Nom',
    description: 'Description',
    save: 'Enregistrer',
  },
  errors: {
    notFound: 'Catégorie introuvable',
  },
} as const;
```

**Usage dans un composant :**

```tsx
import { useTranslation } from 'react-i18next';

export function CategoriesPage() {
  const { t } = useTranslation('catalog');
  return <h1>{t('pageTitle')}</h1>;
}
```

**Règles i18n :**
- ❌ `<h1>Catégories</h1>` → ✅ `<h1>{t('pageTitle')}</h1>`
- ❌ Concaténer des chaînes traduites (`t('hello') + ' ' + name`) → ✅ Interpolation : `t('hello', { name })`
- ❌ Mettre les libellés dans les types ou les schémas → ✅ Toujours via `t()` au moment du rendu.
- Les **messages d'erreur backend** (réponses API) ne sont pas traduits côté front : afficher tel quel ou mapper via `t('errors.<code>')`.
- Les clés sont en **camelCase**, hiérarchisées par sous-objet (`form.save`).

### Imports
- Alias `@/` pour `src/` dans `tsconfig.json` et `vite.config.ts` (recommandé).
- **Pas d'import croisé entre features** : `features/catalog/` ne doit pas importer `features/orders/`. Si besoin de partager, remonter dans `shared/`.

### État
- État serveur → **TanStack Query** (jamais `useState` + `useEffect` pour des données API).
- État UI local → `useState` / `useReducer`.
- État global cross-features → React Context (dans `shared/`) ou Zustand si complexité.

### Formulaires
- **React Hook Form** + résolveur (`zod` recommandé pour la validation côté front).
- Le formulaire renvoie un DTO d'entrée typé → passé tel quel à `mutation.mutate()`.

### Erreurs
- Gérer dans le composant via `mutation.isError` / `mutation.error`.
- Un `ErrorBoundary` global dans `app/App.tsx` pour les erreurs non capturées.

### Tests
- **Component** : React Testing Library, mock du hook (`vi.mock('../hooks/useCategories')`).
- **Hook** : tester avec `QueryClientProvider` et MSW pour mocker l'API.
- **API** : tests d'intégration légers (peuvent être omis si la couche est triviale).

---

## 7. Checklist de refactoring (par feature à reprendre)

- [ ] Créer la structure `features/<X>/{pages,components,hooks,api,types}/`.
- [ ] Extraire les `interface` / `type` exportés depuis les hooks vers `types/<x>.types.ts`.
- [ ] Extraire tous les `axios.get/post/put/delete` vers `api/<x>.api.ts`. Le hook ne contient plus que `useQuery({ queryFn: api.list })`.
- [ ] Vérifier qu'aucun composant ni page n'importe `axios` directement.
- [ ] Renommer le composant racine de la route en `XxxPage.tsx` s'il ne l'est pas déjà.
- [ ] Déplacer les composants UI génériques (`Button`, `Modal`...) vers `shared/components/ui/`.
- [ ] Vérifier qu'aucune feature n'importe une autre feature.
- [ ] Lancer le build (`yarn workspace cyna-bo-front build`) pour valider les types.

---

## 8. Anti-patterns à proscrire

| ❌ À éviter | ✅ Faire à la place |
|---|---|
| `axios.get(...)` dans une Page ou un Component | Hook `useXxx()` qui appelle `*.api.ts` |
| `interface Category` exportée depuis `useCategories.ts` | Déclarer dans `types/category.types.ts` |
| `useState` + `useEffect` + `fetch` pour des données serveur | `useQuery` avec TanStack Query |
| Dossiers globaux `src/components/`, `src/hooks/`, `src/types/` fourre-tout | `features/<X>/` ou `shared/` |
| Une feature qui importe une autre feature | Remonter le code commun dans `shared/` |
| `any` comme type de retour API | Type explicite (`Category[]`) |
| Logique métier complexe dans une Page | Extraire en hook `useXxxLogic()` |
| Fichier > 300 lignes | Découper en sous-composants / sous-hooks cohérents |
| Chaînes UI en dur (`<button>Enregistrer</button>`) | `<button>{t('form.save')}</button>` via `react-i18next` |
