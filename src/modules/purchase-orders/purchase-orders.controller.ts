import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private service: PurchaseOrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: any) {
    return this.service.createPurchaseOrder(body);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/receive')
  receive(@Param('id') id: string) {
    return this.service.receivePurchaseOrder(id);
  }
}
