import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { MovementType } from '@prisma/client';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private prisma: PrismaService) {}

  async createOrder(dto: CreateOrderDto) {
    let total = 0;
    this.logger.log(`Creating order with ${dto.items.length} item(s)`);

    const order = await this.prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: { total: 0 },
      });

      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          this.logger.warn(
            `Order failed: product not found: ${item.productId}`,
          );
          throw new NotFoundException('Product not found');
        }

        if (product.stock < item.quantity) {
          this.logger.warn(
            `Order failed: insufficient stock for product: ${product.id} (requested: ${item.quantity}, available: ${product.stock})`,
          );
          throw new BadRequestException(
            `Insufficient stock for product: ${product.id}`,
          );
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
        data: { total: Math.round(total * 100) / 100 },
      });

      return updatedOrder;
    });

    this.logger.log(`Order created: ${order.id} (total: ${order.total})`);
    return order;
  }
}
