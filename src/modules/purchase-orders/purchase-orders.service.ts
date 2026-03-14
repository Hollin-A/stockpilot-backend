import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { MovementType } from '@prisma/client';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';

@Injectable()
export class PurchaseOrdersService {
  private readonly logger = new Logger(PurchaseOrdersService.name);

  constructor(private prisma: PrismaService) {}

  async createPurchaseOrder(data: CreatePurchaseOrderDto) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id: data.supplierId } });
    if (!supplier) {
      this.logger.warn(`Purchase order creation failed: supplier not found: ${data.supplierId}`);
      throw new NotFoundException('Supplier not found');
    }

    const order = await this.prisma.purchaseOrder.create({
      data: {
        supplierId: data.supplierId,
        status: 'PENDING',
        items: {
          create: data.items,
        },
      },
      include: {
        items: true,
      },
    });
    this.logger.log(`Purchase order created: ${order.id} for supplier: ${data.supplierId} with ${data.items.length} item(s)`);
    return order;
  }

  async receivePurchaseOrder(id: string) {
    this.logger.log(`Receiving purchase order: ${id}`);
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.purchaseOrder.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!order) {
        this.logger.warn(`Receive failed: purchase order not found: ${id}`);
        throw new NotFoundException('Purchase order not found');
      }

      if (order.status === 'RECEIVED') {
        this.logger.warn(`Receive failed: purchase order already received: ${id}`);
        throw new BadRequestException('Purchase order has already been received');
      }

      for (const item of order.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(`Product not found: ${item.productId}`);
        }

        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: product.stock + item.quantity,
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: product.id,
            type: MovementType.RESTOCK,
            quantity: item.quantity,
          },
        });
      }

      const received = await tx.purchaseOrder.update({
        where: { id },
        data: { status: 'RECEIVED' },
      });
      this.logger.log(`Purchase order received: ${id}`);
      return received;
    });
  }
}
