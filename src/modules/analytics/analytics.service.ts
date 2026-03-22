import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getSalesSummary() {
    const result = await this.prisma.order.aggregate({
      _count: { id: true },
      _sum: { total: true },
    });

    return {
      totalOrders: result._count.id,
      totalRevenue: Math.round((result._sum.total ?? 0) * 100) / 100,
    };
  }

  async getTopProducts() {
    const grouped = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const products = await this.prisma.product.findMany({
      where: { id: { in: grouped.map((g) => g.productId) } },
      select: { id: true, name: true, sku: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    return grouped.map((g) => ({
      ...productMap.get(g.productId),
      totalQuantitySold: g._sum.quantity,
    }));
  }

  async getLowStockProducts() {
    return this.prisma.product.findMany({
      where: { stock: { lte: this.prisma.product.fields.threshold } },
    });
  }

  async getStockMovements(productId?: string) {
    return this.prisma.stockMovement.findMany({
      where: productId ? { productId } : {},
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });
  }

  async getSalesOverTime(startDate?: string, endDate?: string) {
    const start = startDate
      ? new Date(startDate)
      : (
          await this.prisma.order.findFirst({
            orderBy: { createdAt: 'asc' },
            select: { createdAt: true },
          })
        )?.createdAt;

    const end = endDate
      ? new Date(endDate)
      : (
          await this.prisma.order.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { createdAt: true },
          })
        )?.createdAt;

    if (!start || !end) return [];

    const conditions: string[] = [];
    const params: unknown[] = [start, end];
    conditions.push(`"createdAt" >= $1`, `"createdAt" <= $2`);

    const rows = await this.prisma.$queryRawUnsafe<
      { date: string; revenue: number }[]
    >(
      `SELECT "createdAt"::date::text AS date,
              COALESCE(SUM(total), 0) AS revenue
       FROM "Order"
       WHERE ${conditions.join(' AND ')}
       GROUP BY "createdAt"::date
       ORDER BY date ASC`,
      ...params,
    );

    const revenueMap = new Map(
      rows.map((r) => [r.date, Math.round(Number(r.revenue) * 100) / 100]),
    );

    const result: { date: string; revenue: number }[] = [];
    const cursor = new Date(start);
    cursor.setUTCHours(0, 0, 0, 0);
    const endDate_ = new Date(end);
    endDate_.setUTCHours(0, 0, 0, 0);

    while (cursor <= endDate_) {
      const key = cursor.toISOString().slice(0, 10);
      result.push({ date: key, revenue: revenueMap.get(key) ?? 0 });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return result;
  }

  async getMonthlyRevenue() {
    const orders = await this.prisma.order.findMany({
      select: {
        total: true,
        createdAt: true,
      },
    });

    const grouped: Record<string, number> = {};

    for (const order of orders) {
      const date = new Date(order.createdAt);

      const monthKey = date.toLocaleString('en-US', {
        month: 'short',
        year: 'numeric',
      });

      if (!grouped[monthKey]) {
        grouped[monthKey] = 0;
      }

      grouped[monthKey] += order.total;
    }

    return Object.entries(grouped).map(([month, revenue]) => ({
      month,
      revenue: Math.round(revenue * 100) / 100,
    }));
  }
}
