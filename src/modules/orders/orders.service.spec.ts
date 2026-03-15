import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../../database/prisma/prisma.service';

const mockPrismaService = {
  $transaction: jest.fn(),
  order: { create: jest.fn(), update: jest.fn() },
  orderItem: { create: jest.fn() },
  product: { findUnique: jest.fn(), update: jest.fn() },
  stockMovement: { create: jest.fn() },
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
});
