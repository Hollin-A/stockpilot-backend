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
      totalRevenue: result._sum.total ?? 0,
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
}
