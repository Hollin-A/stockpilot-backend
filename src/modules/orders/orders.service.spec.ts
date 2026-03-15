import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../../database/prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';

const mockPrismaService = {
  $transaction: jest.fn(),
};

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    const dto: CreateOrderDto = {
      items: [{ productId: 'prod-1', quantity: 2 }],
    };

    it('should create and return an order', async () => {
      const order = { id: 'order-1', total: 19.98 };
      mockPrismaService.$transaction.mockResolvedValue(order);
      expect(await service.createOrder(dto)).toEqual(order);
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException if product is not found', async () => {
      mockPrismaService.$transaction.mockImplementation(
        (fn: (tx: unknown) => Promise<unknown>) => {
          const tx = {
            order: { create: jest.fn().mockResolvedValue({ id: 'order-1' }) },
            product: { findUnique: jest.fn().mockResolvedValue(null) },
            orderItem: { create: jest.fn() },
            stockMovement: { create: jest.fn() },
          };
          return fn(tx);
        },
      );
      await expect(service.createOrder(dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if stock is insufficient', async () => {
      mockPrismaService.$transaction.mockImplementation(
        (fn: (tx: unknown) => Promise<unknown>) => {
          const tx = {
            order: { create: jest.fn().mockResolvedValue({ id: 'order-1' }) },
            product: {
              findUnique: jest
                .fn()
                .mockResolvedValue({ id: 'prod-1', stock: 1, price: 9.99 }),
            },
            orderItem: { create: jest.fn() },
            stockMovement: { create: jest.fn() },
          };
          return fn(tx);
        },
      );
      await expect(service.createOrder(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
