import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MovementType } from '@prisma/client';

@Injectable()
export class PurchaseOrdersService {
  constructor(private prisma: PrismaService) {}

  async createPurchaseOrder(data: any) {
    return this.prisma.purchaseOrder.create({
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
  }

  async receivePurchaseOrder(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.purchaseOrder.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!order) {
        throw new Error('Purchase order not found');
      }

      for (const item of order.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
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

      return tx.purchaseOrder.update({
        where: { id },
        data: { status: 'RECEIVED' },
      });
    });
  }
}
