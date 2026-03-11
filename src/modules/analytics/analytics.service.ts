import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getSalesSummary() {
    const orders = await this.prisma.order.findMany();

    const revenue = orders.reduce((sum, order) => sum + order.total, 0);

    return {
      totalOrders: orders.length,
      totalRevenue: revenue,
    };
  }

  async getTopProducts() {
    return this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });
  }

  async getLowStockProducts() {
    return this.prisma.product.findMany({
      where: {
        stock: {
          lte: this.prisma.product.fields.threshold,
        },
      },
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
