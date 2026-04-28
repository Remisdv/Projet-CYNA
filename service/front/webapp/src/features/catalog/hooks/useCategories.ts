import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';

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
      const { data } = await apiClient.get('/bo/categories');
      const list = (data?.data ?? data ?? []) as Category[];
      return list.filter((c) => c.isActive !== false);
    },
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Resolve a category id (UUID) or slug to its localized name.
 * Returns the raw value if categories aren't loaded yet or no match is found.
 */
export function useCategoryName(idOrSlug: string | undefined, lang = 'fr'): string {
  const { data: categories } = usePublicCategories();
  if (!idOrSlug) return '';
  const match = categories?.find((c) => c.id === idOrSlug || c.slug === idOrSlug);
  return match ? getCategoryName(match, lang) : idOrSlug;
}
