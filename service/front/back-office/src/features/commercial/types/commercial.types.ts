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

export interface CommercialStats {
  productSales: ProductSales[];
  dailySales: DailySales[];
}
