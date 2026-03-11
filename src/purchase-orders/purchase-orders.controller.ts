import { Body, Controller, Param, Post } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';

@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private service: PurchaseOrdersService) {}

  @Post()
  create(@Body() body: any) {
    return this.service.createPurchaseOrder(body);
  }

  @Post(':id/receive')
  receive(@Param('id') id: string) {
    return this.service.receivePurchaseOrder(id);
  }
}
