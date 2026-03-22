import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('sales')
  getSalesSummary() {
    return this.analyticsService.getSalesSummary();
  }

  @Get('top-products')
  getTopProducts() {
    return this.analyticsService.getTopProducts();
  }

  @Get('low-stock')
  getLowStockProducts() {
    return this.analyticsService.getLowStockProducts();
  }

  @Get('stock-movements')
  getStockMovements(@Query('productId') productId?: string) {
    return this.analyticsService.getStockMovements(productId);
  }

  @Get('sales-over-time')
  getSalesOverTime(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getSalesOverTime(startDate, endDate);
  }

  @Get('monthly-revenue')
  getMonthlyRevenue() {
    return this.analyticsService.getMonthlyRevenue();
  }
}
