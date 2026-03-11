import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

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
}
