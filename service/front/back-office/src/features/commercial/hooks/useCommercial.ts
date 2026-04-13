import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

// ========== TYPES ==========

export interface ProductSales {
  productId: string;
  productName: string;
  salesThisMonth: number;
  revenueThisMonth: number;
  salesLastMonth: number;
  revenueLastMonth: number;
  growthPercent: number;
}

export interface DailySales {
  date: string;
  sales: number;
  revenue: number;
}

interface CommercialStats {
  productSales: ProductSales[];
  dailySales: DailySales[];
}

// ========== HOOK ==========

export const useCommercial = (days = 30) => {
  const { data, isLoading, isError } = useQuery<CommercialStats>({
    queryKey: ['commercial-stats', days],
    queryFn: async () => {
      const { data } = await api.get<CommercialStats>('/stats/commercial', {
        params: { days },
      });
      return data;
    },
  });

  return {
    productSales: data?.productSales ?? [],
    dailySales: data?.dailySales ?? [],
    isLoading,
    isError,
  };
};
