import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { MovementType } from '@prisma/client';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';

@Injectable()
export class PurchaseOrdersService {
  constructor(private prisma: PrismaService) {}

  async createPurchaseOrder(data: CreatePurchaseOrderDto) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id: data.supplierId } });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

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
        throw new NotFoundException('Purchase order not found');
      }

      if (order.status === 'RECEIVED') {
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

      return tx.purchaseOrder.update({
        where: { id },
        data: { status: 'RECEIVED' },
      });
    });
  }
}
