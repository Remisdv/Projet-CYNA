import { useQuery } from '@tanstack/react-query';
import { commercialApi } from '../api/commercial.api';
import type { CommercialStats } from '../types/commercial.types';

export type { ProductSales, DailySales } from '../types/commercial.types';

export const useCommercial = (days = 30) => {
  const { data, isLoading, isError } = useQuery<CommercialStats>({
    queryKey: ['commercial-stats', days],
    queryFn: () => commercialApi.stats(days),
  });

  return {
    productSales: data?.productSales ?? [],
    dailySales: data?.dailySales ?? [],
    isLoading,
    isError,
  };
};

