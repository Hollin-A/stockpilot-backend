import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';

@Module({
  imports: [PrismaModule, ProductsModule, OrdersModule, SuppliersModule, PurchaseOrdersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
