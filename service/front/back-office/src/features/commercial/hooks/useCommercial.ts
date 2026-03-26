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

// ========== MOCK DATA ==========

const generateMockProductSales = (): ProductSales[] => {
  const products = [
    'SOC Monitoring Pro',
    'EDR Protection Advanced',
    'XDR Platform Enterprise',
    'Penetration Test',
    'Security Audit',
    'Firewall NextGen',
    'IDS/IPS Pro',
    'SIEM Solution',
    'Vulnerability Scanner',
    'Email Security Gateway',
    'Web Application Firewall',
    'Endpoint Detection',
    'Threat Intelligence Feed',
    'Security Training',
    'Incident Response Service',
  ];

  return products.map((name, index) => {
    const salesThisMonth = Math.floor(Math.random() * 80) + 10;
    const salesLastMonth = Math.floor(Math.random() * 70) + 10;
    const avgPrice = 500 + Math.random() * 2000;
    const revenueThisMonth = Math.round(salesThisMonth * avgPrice);
    const revenueLastMonth = Math.round(salesLastMonth * avgPrice);
    const growthPercent = ((salesThisMonth - salesLastMonth) / salesLastMonth) * 100;

    return {
      productId: `prod-${(index + 1).toString().padStart(3, '0')}`,
      productName: name,
      salesThisMonth,
      revenueThisMonth,
      salesLastMonth,
      revenueLastMonth,
      growthPercent: Math.round(growthPercent * 10) / 10,
    };
  });
};

const generateDailySalesData = (): DailySales[] => {
  const data: DailySales[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const baseSales = 15 + Math.random() * 25;
    const weekendMultiplier = date.getDay() === 0 || date.getDay() === 6 ? 0.6 : 1;
    const sales = Math.round(baseSales * weekendMultiplier);
    const avgPrice = 800 + Math.random() * 1200;
    const revenue = Math.round(sales * avgPrice);

    data.push({ date: dateStr, sales, revenue });
  }

  return data;
};

const mockProductSales = generateMockProductSales();
const mockDailySales = generateDailySalesData();

// ========== HOOK ==========

export const useCommercial = () => ({
  productSales: mockProductSales,
  dailySales: mockDailySales,
  isLoading: false as const,
  isError: false as const,
});
