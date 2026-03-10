import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { MovementType } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(dto: CreateOrderDto) {
    let total = 0;

    const order = await this.prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: { total: 0 },
      });

      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error('Product not found');
        }

        const price = product.price;
        total += price * item.quantity;

        await tx.orderItem.create({
          data: {
            orderId: createdOrder.id,
            productId: product.id,
            quantity: item.quantity,
            price,
          },
        });

        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: product.stock - item.quantity,
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: product.id,
            type: MovementType.SALE,
            quantity: -item.quantity,
          },
        });
      }

      const updatedOrder = await tx.order.update({
        where: { id: createdOrder.id },
        data: { total },
      });

      return updatedOrder;
    });

    return order;
  }
}
