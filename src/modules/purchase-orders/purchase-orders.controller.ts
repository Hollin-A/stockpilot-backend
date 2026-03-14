import { Body, Controller, Param, Post } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';

@Roles('ADMIN')
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private service: PurchaseOrdersService) {}

  @Post()
  create(@Body() dto: CreatePurchaseOrderDto) {
    return this.service.createPurchaseOrder(dto);
  }

  @Post(':id/receive')
  receive(@Param('id') id: string) {
    return this.service.receivePurchaseOrder(id);
  }
}
