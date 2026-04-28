import { Injectable } from '@nestjs/common';
import { PaymentStatus } from '../../database/entity/order';
import { OrderRepository } from '../../repository/order/order.repository';
import { ProductRepository } from '../../repository/product/product.repository';
import { TrackingService } from '../tracking/tracking.service';
import { TrackingEventType } from '../../database/entity/tracking/tracking-event.entity';

@Injectable()
export class StatsService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
    private readonly trackingService: TrackingService,
  ) { }

  private validateDays(days: unknown): number {
    const d = Math.floor(Number(days));
    if (!Number.isFinite(d) || d < 1) return 30;
    if (d > 365) return 365;
    return d;
  }

  async getDashboardStats(rawDays: unknown) {
    const d = this.validateDays(rawDays);

    const [
      currentRevenue,
      previousRevenue,
      currentOrders,
      previousOrders,
      currentCustomers,
      previousCustomers,
      revenueByDay,
      ordersByDay,
      topProducts,
    ] = await Promise.all([
      this.orderRepository.getRevenueLastDays(PaymentStatus.PAID, d),
      this.orderRepository.getRevenuePreviousPeriod(PaymentStatus.PAID, d),
      this.orderRepository.countOrdersLastDays(d),
      this.orderRepository.countOrdersPreviousPeriod(d),
      this.orderRepository.countDistinctCustomersLastDays(d),
      this.orderRepository.countDistinctCustomersPreviousPeriod(d),
      this.orderRepository.getRevenueByDay(PaymentStatus.PAID, d),
      this.orderRepository.getOrdersByDay(d),
      this.orderRepository.getTopProducts(d),
    ]);

    const lowStockProducts = await this.productRepository.findLowStock(5, 10);

    // Tracking-based stats
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const sinceD = new Date(Date.now() - d * 24 * 60 * 60 * 1000);

    const [logins7d, cartAdds7d, cartCheckouts, topServicesRows] = await Promise.all([
      this.trackingService.countByType(TrackingEventType.LOGIN, since7d),
      this.trackingService.countByType(TrackingEventType.CART_ADD, since7d),
      this.trackingService.countByType(TrackingEventType.CART_CHECKOUT, sinceD),
      this.orderRepository.getTopServices(d),
    ]);

    const conversionRate =
      cartAdds7d > 0
        ? Math.round((cartCheckouts / cartAdds7d) * 1000) / 10
        : 0;

    const computeTrend = (cur: number, prev: number): number | null => {
      if (prev > 0) return Math.round(((cur - prev) / prev) * 1000) / 10;
      if (cur > 0) return 100;
      return null; // no data in either period
    };

    const curRev = parseFloat(currentRevenue[0]?.total ?? '0');
    const prevRev = parseFloat(previousRevenue[0]?.total ?? '0');
    const revenueTrend = computeTrend(curRev, prevRev);

    const curOrders = parseInt(currentOrders[0]?.total ?? '0', 10);
    const prevOrders = parseInt(previousOrders[0]?.total ?? '0', 10);
    const ordersTrend = computeTrend(curOrders, prevOrders);

    const curCustomers = parseInt(currentCustomers[0]?.total ?? '0', 10);
    const prevCustomers = parseInt(previousCustomers[0]?.total ?? '0', 10);
    const customersTrend = computeTrend(curCustomers, prevCustomers);

    return {
      kpis: {
        totalRevenue: curRev,
        revenueTrend,
        totalOrders: curOrders,
        ordersTrend,
        activeCustomers: curCustomers,
        customersTrend,
        conversionRate,
        logins7d,
        cartAdds7d,
      },
      revenueByDay: revenueByDay.map((r) => ({
        date: r.date,
        revenue: parseFloat(r.revenue),
      })),
      ordersByDay: ordersByDay.map((r) => ({
        date: r.date,
        orders: parseInt(r.orders, 10),
      })),
      topProducts: topProducts.map((r) => ({
        name: r.name,
        sales: parseInt(r.sales, 10),
      })),
      topServices: topServicesRows.map((r) => ({
        name: r.name,
        sales: parseInt(r.sales, 10),
      })),
      lowStockProducts: lowStockProducts.map((p) => ({
        id: p.id,
        name: p.nom,
        stock: p.stock,
      })),
    };
  }

  async getCommercialStats(rawDays: unknown) {
    const d = this.validateDays(rawDays);

    const [productSalesRows, dailySalesRows] = await Promise.all([
      this.orderRepository.getProductSalesComparison(d),
      this.orderRepository.getDailySales(PaymentStatus.PAID, d),
    ]);

    const productSales = productSalesRows.map((r) => {
      const salesThisMonth = parseInt(r.sales_this_period, 10);
      const salesLastMonth = parseInt(r.sales_last_period, 10);
      const growthPercent =
        salesLastMonth > 0
          ? Math.round(((salesThisMonth - salesLastMonth) / salesLastMonth) * 1000) / 10
          : salesThisMonth > 0
            ? 100
            : 0;
      return {
        productId: r.product_name,
        productName: r.product_name,
        salesThisMonth,
        revenueThisMonth: parseFloat(r.revenue_this_period),
        salesLastMonth,
        revenueLastMonth: parseFloat(r.revenue_last_period),
        growthPercent,
      };
    });

    const dailySales = dailySalesRows.map((r) => ({
      date: r.date,
      sales: parseInt(r.sales, 10),
      revenue: parseFloat(r.revenue),
    }));

    return { productSales, dailySales };
  }
}
