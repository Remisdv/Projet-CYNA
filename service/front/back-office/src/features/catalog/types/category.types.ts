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
  translations: Array<{
    lang: string;
    name: string;
    description?: string;
  }>;
}
