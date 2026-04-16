import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

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

export function getCategoryName(cat: Category, lang = 'fr'): string {
  return cat.translations.find((t) => t.lang === lang)?.name ?? cat.slug;
}

export function getCategoryDescription(cat: Category, lang = 'fr'): string {
  return cat.translations.find((t) => t.lang === lang)?.description ?? '';
}

export function usePublicCategories() {
  return useQuery({
    queryKey: ['bo-categories'],
    queryFn: async () => {
      const { data } = await api.get('/bo/categories');
      const list = (data?.data ?? data ?? []) as Category[];
      return list.filter((c) => c.isActive !== false);
    },
    staleTime: 1000 * 60 * 10,
  });
}
