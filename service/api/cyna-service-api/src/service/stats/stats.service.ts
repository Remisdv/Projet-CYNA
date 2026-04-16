import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity, PaymentStatus } from '../../database/entity/order';
import { ProductEntity, ProductStatus } from '../../database/entity/product';
import { TrackingService } from '../tracking/tracking.service';
import { TrackingEventType } from '../../database/entity/tracking/tracking-event.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
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
      this.orderRepository.manager.query<{ total: string }[]>(
        `SELECT COALESCE(SUM(amount::numeric), 0) AS total
         FROM orders
         WHERE "paymentStatus" = $1
           AND "createdAt" >= NOW() - make_interval(days => $2)`,
        [PaymentStatus.PAID, d],
      ),
      this.orderRepository.manager.query<{ total: string }[]>(
        `SELECT COALESCE(SUM(amount::numeric), 0) AS total
         FROM orders
         WHERE "paymentStatus" = $1
           AND "createdAt" >= NOW() - make_interval(days => $2 * 2)
           AND "createdAt" <  NOW() - make_interval(days => $2)`,
        [PaymentStatus.PAID, d],
      ),
      this.orderRepository.manager.query<{ total: string }[]>(
        `SELECT COUNT(*) AS total
         FROM orders
         WHERE "createdAt" >= NOW() - make_interval(days => $1)`,
        [d],
      ),
      this.orderRepository.manager.query<{ total: string }[]>(
        `SELECT COUNT(*) AS total
         FROM orders
         WHERE "createdAt" >= NOW() - make_interval(days => $1 * 2)
           AND "createdAt" <  NOW() - make_interval(days => $1)`,
        [d],
      ),
      this.orderRepository.manager.query<{ total: string }[]>(
        `SELECT COUNT(DISTINCT "clientEmail") AS total
         FROM orders
         WHERE "createdAt" >= NOW() - make_interval(days => $1)`,
        [d],
      ),
      this.orderRepository.manager.query<{ total: string }[]>(
        `SELECT COUNT(DISTINCT "clientEmail") AS total
         FROM orders
         WHERE "createdAt" >= NOW() - make_interval(days => $1 * 2)
           AND "createdAt" <  NOW() - make_interval(days => $1)`,
        [d],
      ),
      this.orderRepository.manager.query<{ date: string; revenue: string }[]>(
        `SELECT TO_CHAR("createdAt"::date, 'YYYY-MM-DD') AS date,
                COALESCE(SUM(amount::numeric), 0)         AS revenue
         FROM orders
         WHERE "paymentStatus" = $1
           AND "createdAt" >= NOW() - make_interval(days => $2)
         GROUP BY "createdAt"::date
         ORDER BY "createdAt"::date ASC`,
        [PaymentStatus.PAID, d],
      ),
      this.orderRepository.manager.query<{ date: string; orders: string }[]>(
        `SELECT TO_CHAR("createdAt"::date, 'YYYY-MM-DD') AS date,
                COUNT(*)                                   AS orders
         FROM orders
         WHERE "createdAt" >= NOW() - make_interval(days => $1)
         GROUP BY "createdAt"::date
         ORDER BY "createdAt"::date ASC`,
        [d],
      ),
      this.orderRepository.manager.query<{ name: string; sales: string }[]>(
        `SELECT item->>'productName'         AS name,
                SUM((item->>'quantity')::int) AS sales
         FROM orders,
              jsonb_array_elements(COALESCE(items, '[]'::jsonb)) AS item
         WHERE "createdAt" >= NOW() - make_interval(days => $1)
         GROUP BY item->>'productName'
         ORDER BY sales DESC
         LIMIT 5`,
        [d],
      ),
    ]);

    const lowStockProducts = await this.productRepository
      .createQueryBuilder('p')
      .select(['p.id', 'p.nom', 'p.stock'])
      .where('p.stock IS NOT NULL')
      .andWhere('p.stock <= COALESCE(p.seuil_alerte_stock, :threshold)', { threshold: 5 })
      .andWhere('p.statut = :status', { status: ProductStatus.PUBLISHED })
      .orderBy('p.stock', 'ASC')
      .limit(10)
      .getMany();

    // Tracking-based stats
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const sinceD = new Date(Date.now() - d * 24 * 60 * 60 * 1000);

    const [logins7d, cartAdds7d, cartCheckouts, topServicesRows] = await Promise.all([
      this.trackingService.countByType(TrackingEventType.LOGIN, since7d),
      this.trackingService.countByType(TrackingEventType.CART_ADD, since7d),
      this.trackingService.countByType(TrackingEventType.CART_CHECKOUT, sinceD),
      this.orderRepository.manager.query<{ name: string; sales: string }[]>(
        `SELECT item->>'productName'         AS name,
                SUM((item->>'quantity')::int) AS sales
         FROM orders,
              jsonb_array_elements(COALESCE(items, '[]'::jsonb)) AS item
         WHERE item->>'productType' = 'service'
           AND "createdAt" >= NOW() - make_interval(days => $1)
         GROUP BY item->>'productName'
         ORDER BY sales DESC
         LIMIT 5`,
        [d],
      ),
    ]);

    const conversionRate =
      cartAdds7d > 0
        ? Math.round((cartCheckouts / cartAdds7d) * 1000) / 10
        : 0;

    const curRev = parseFloat(currentRevenue[0]?.total ?? '0');
    const prevRev = parseFloat(previousRevenue[0]?.total ?? '0');
    const revenueTrend =
      prevRev > 0 ? Math.round(((curRev - prevRev) / prevRev) * 1000) / 10 : 0;

    const curOrders = parseInt(currentOrders[0]?.total ?? '0', 10);
    const prevOrders = parseInt(previousOrders[0]?.total ?? '0', 10);
    const ordersTrend =
      prevOrders > 0 ? Math.round(((curOrders - prevOrders) / prevOrders) * 1000) / 10 : 0;

    const curCustomers = parseInt(currentCustomers[0]?.total ?? '0', 10);
    const prevCustomers = parseInt(previousCustomers[0]?.total ?? '0', 10);
    const customersTrend =
      prevCustomers > 0
        ? Math.round(((curCustomers - prevCustomers) / prevCustomers) * 1000) / 10
        : 0;

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
      this.orderRepository.manager.query<
        {
          product_name: string;
          sales_this_period: string;
          revenue_this_period: string;
          sales_last_period: string;
          revenue_last_period: string;
        }[]
      >(
        `SELECT
           item->>'productName' AS product_name,
           SUM(CASE WHEN "createdAt" >= NOW() - make_interval(days => $1)
               THEN (item->>'quantity')::int   ELSE 0 END) AS sales_this_period,
           SUM(CASE WHEN "createdAt" >= NOW() - make_interval(days => $1)
               THEN (item->>'subtotal')::numeric ELSE 0 END) AS revenue_this_period,
           SUM(CASE WHEN "createdAt" <  NOW() - make_interval(days => $1)
                    AND "createdAt" >= NOW() - make_interval(days => $1 * 2)
               THEN (item->>'quantity')::int   ELSE 0 END) AS sales_last_period,
           SUM(CASE WHEN "createdAt" <  NOW() - make_interval(days => $1)
                    AND "createdAt" >= NOW() - make_interval(days => $1 * 2)
               THEN (item->>'subtotal')::numeric ELSE 0 END) AS revenue_last_period
         FROM orders,
              jsonb_array_elements(COALESCE(items, '[]'::jsonb)) AS item
         WHERE "createdAt" >= NOW() - make_interval(days => $1 * 2)
         GROUP BY item->>'productName'
         ORDER BY sales_this_period DESC
         LIMIT 15`,
        [d],
      ),
      this.orderRepository.manager.query<
        { date: string; sales: string; revenue: string }[]
      >(
        `SELECT
           TO_CHAR("createdAt"::date, 'YYYY-MM-DD')                                             AS date,
           SUM(jsonb_array_length(COALESCE(items, '[]'::jsonb)))                               AS sales,
           COALESCE(SUM(CASE WHEN "paymentStatus" = $1 THEN amount::numeric ELSE 0 END), 0)   AS revenue
         FROM orders
         WHERE "createdAt" >= NOW() - make_interval(days => $2)
         GROUP BY "createdAt"::date
         ORDER BY "createdAt"::date ASC`,
        [PaymentStatus.PAID, d],
      ),
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
