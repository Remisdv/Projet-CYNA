import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { OrderEntity, OrderStatus, PaymentStatus } from '../../database/entity/order';

@Injectable()
export class OrderRepository {
    constructor(
        @InjectRepository(OrderEntity)
        private readonly repo: Repository<OrderEntity>,
    ) { }

    findById(id: string): Promise<OrderEntity | null> {
        return this.repo.findOne({ where: { id } });
    }

    findByRef(ref: string): Promise<OrderEntity | null> {
        return this.repo.findOne({ where: { ref } });
    }

    create(partial: Partial<OrderEntity>): OrderEntity {
        return this.repo.create(partial);
    }

    save(entity: OrderEntity): Promise<OrderEntity> {
        return this.repo.save(entity);
    }

    findAndCount(
        where: FindOptionsWhere<OrderEntity>,
        skip: number,
        take: number,
    ): Promise<[OrderEntity[], number]> {
        return this.repo.findAndCount({
            where,
            order: { createdAt: 'DESC' },
            skip,
            take,
        });
    }

    // ------- Raw SQL aggregations consumed by StatsService -------

    getRevenueLastDays(status: PaymentStatus, days: number): Promise<{ total: string }[]> {
        return this.repo.manager.query<{ total: string }[]>(
            `SELECT COALESCE(SUM(amount::numeric), 0) AS total
         FROM orders
         WHERE "paymentStatus" = $1
           AND "createdAt" >= NOW() - make_interval(days => $2)`,
            [status, days],
        );
    }

    getRevenuePreviousPeriod(status: PaymentStatus, days: number): Promise<{ total: string }[]> {
        return this.repo.manager.query<{ total: string }[]>(
            `SELECT COALESCE(SUM(amount::numeric), 0) AS total
         FROM orders
         WHERE "paymentStatus" = $1
           AND "createdAt" >= NOW() - make_interval(days => $2 * 2)
           AND "createdAt" <  NOW() - make_interval(days => $2)`,
            [status, days],
        );
    }

    countOrdersLastDays(days: number): Promise<{ total: string }[]> {
        return this.repo.manager.query<{ total: string }[]>(
            `SELECT COUNT(*) AS total
         FROM orders
         WHERE "createdAt" >= NOW() - make_interval(days => $1)`,
            [days],
        );
    }

    countOrdersPreviousPeriod(days: number): Promise<{ total: string }[]> {
        return this.repo.manager.query<{ total: string }[]>(
            `SELECT COUNT(*) AS total
         FROM orders
         WHERE "createdAt" >= NOW() - make_interval(days => $1 * 2)
           AND "createdAt" <  NOW() - make_interval(days => $1)`,
            [days],
        );
    }

    countDistinctCustomersLastDays(days: number): Promise<{ total: string }[]> {
        return this.repo.manager.query<{ total: string }[]>(
            `SELECT COUNT(DISTINCT "clientEmail") AS total
         FROM orders
         WHERE "createdAt" >= NOW() - make_interval(days => $1)`,
            [days],
        );
    }

    countDistinctCustomersPreviousPeriod(days: number): Promise<{ total: string }[]> {
        return this.repo.manager.query<{ total: string }[]>(
            `SELECT COUNT(DISTINCT "clientEmail") AS total
         FROM orders
         WHERE "createdAt" >= NOW() - make_interval(days => $1 * 2)
           AND "createdAt" <  NOW() - make_interval(days => $1)`,
            [days],
        );
    }

    getRevenueByDay(
        status: PaymentStatus,
        days: number,
    ): Promise<{ date: string; revenue: string }[]> {
        return this.repo.manager.query<{ date: string; revenue: string }[]>(
            `SELECT TO_CHAR("createdAt"::date, 'YYYY-MM-DD') AS date,
                COALESCE(SUM(amount::numeric), 0)         AS revenue
         FROM orders
         WHERE "paymentStatus" = $1
           AND "createdAt" >= NOW() - make_interval(days => $2)
         GROUP BY "createdAt"::date
         ORDER BY "createdAt"::date ASC`,
            [status, days],
        );
    }

    getOrdersByDay(days: number): Promise<{ date: string; orders: string }[]> {
        return this.repo.manager.query<{ date: string; orders: string }[]>(
            `SELECT TO_CHAR("createdAt"::date, 'YYYY-MM-DD') AS date,
                COUNT(*)                                   AS orders
         FROM orders
         WHERE "createdAt" >= NOW() - make_interval(days => $1)
         GROUP BY "createdAt"::date
         ORDER BY "createdAt"::date ASC`,
            [days],
        );
    }

    getTopProducts(days: number): Promise<{ name: string; sales: string }[]> {
        return this.repo.manager.query<{ name: string; sales: string }[]>(
            `SELECT item->>'productName'         AS name,
                SUM((item->>'quantity')::int) AS sales
         FROM orders,
              jsonb_array_elements(COALESCE(items, '[]'::jsonb)) AS item
         WHERE "createdAt" >= NOW() - make_interval(days => $1)
         GROUP BY item->>'productName'
         ORDER BY sales DESC
         LIMIT 5`,
            [days],
        );
    }

    getTopServices(days: number): Promise<{ name: string; sales: string }[]> {
        return this.repo.manager.query<{ name: string; sales: string }[]>(
            `SELECT item->>'productName'         AS name,
                SUM((item->>'quantity')::int) AS sales
         FROM orders,
              jsonb_array_elements(COALESCE(items, '[]'::jsonb)) AS item
         WHERE item->>'productType' = 'service'
           AND "createdAt" >= NOW() - make_interval(days => $1)
         GROUP BY item->>'productName'
         ORDER BY sales DESC
         LIMIT 5`,
            [days],
        );
    }

    getProductSalesComparison(days: number): Promise<{
        product_name: string;
        sales_this_period: string;
        revenue_this_period: string;
        sales_last_period: string;
        revenue_last_period: string;
    }[]> {
        return this.repo.manager.query<
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
            [days],
        );
    }

    getDailySales(
        status: PaymentStatus,
        days: number,
    ): Promise<{ date: string; sales: string; revenue: string }[]> {
        return this.repo.manager.query<{ date: string; sales: string; revenue: string }[]>(
            `SELECT
           TO_CHAR("createdAt"::date, 'YYYY-MM-DD')                                             AS date,
           SUM(jsonb_array_length(COALESCE(items, '[]'::jsonb)))                               AS sales,
           COALESCE(SUM(CASE WHEN "paymentStatus" = $1 THEN amount::numeric ELSE 0 END), 0)   AS revenue
         FROM orders
         WHERE "createdAt" >= NOW() - make_interval(days => $2)
         GROUP BY "createdAt"::date
         ORDER BY "createdAt"::date ASC`,
            [status, days],
        );
    }
}
