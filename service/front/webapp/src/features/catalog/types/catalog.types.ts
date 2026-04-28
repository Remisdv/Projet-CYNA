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
}

export interface Product {
  id: string;
  nom: string;
  description: string;
  description_longue?: string;
  prix_mensuel?: number;
  prix_annuel?: number;
  prix?: number;
  type: 'produit' | 'service';
  statut: 'publié' | 'archivé';
  categorie?: string;
  images?: string[];
  caracteristiques?: Record<string, string>;
}

export interface ProductFilters {
  categorie?: string;
  type?: string;
  q?: string;
  statut?: string;
}
