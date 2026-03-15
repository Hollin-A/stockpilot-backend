import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PrismaService } from 'src/database/prisma/prisma.service';

const mockPrismaService = {
  $transaction: jest.fn(),
  supplier: { findUnique: jest.fn() },
  purchaseOrder: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
  product: { findUnique: jest.fn(), update: jest.fn() },
  stockMovement: { create: jest.fn() },
};

describe('PurchaseOrdersService', () => {
  let service: PurchaseOrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseOrdersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PurchaseOrdersService>(PurchaseOrdersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
