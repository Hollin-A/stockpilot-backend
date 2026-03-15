import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';

const mockPrismaService = {
  $transaction: jest.fn(),
  supplier: { findUnique: jest.fn() },
  purchaseOrder: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
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

  describe('createPurchaseOrder', () => {
    const dto: CreatePurchaseOrderDto = {
      supplierId: 'sup-1',
      items: [{ productId: 'prod-1', quantity: 10 }],
    };

    it('should create and return a purchase order', async () => {
      const order = {
        id: 'po-1',
        supplierId: 'sup-1',
        status: 'PENDING',
        items: [],
      };
      mockPrismaService.supplier.findUnique.mockResolvedValue({
        id: 'sup-1',
        name: 'Acme',
      });
      mockPrismaService.purchaseOrder.create.mockResolvedValue(order);
      expect(await service.createPurchaseOrder(dto)).toEqual(order);
    });

    it('should throw NotFoundException if supplier does not exist', async () => {
      mockPrismaService.supplier.findUnique.mockResolvedValue(null);
      await expect(service.createPurchaseOrder(dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('receivePurchaseOrder', () => {
    it('should receive a purchase order and update stock', async () => {
      const received = { id: 'po-1', status: 'RECEIVED' };
      mockPrismaService.$transaction.mockResolvedValue(received);
      expect(await service.receivePurchaseOrder('po-1')).toEqual(received);
    });

    it('should throw NotFoundException if purchase order does not exist', async () => {
      mockPrismaService.$transaction.mockImplementation(
        (fn: (tx: unknown) => Promise<unknown>) => {
          const tx = {
            purchaseOrder: { findUnique: jest.fn().mockResolvedValue(null) },
          };
          return fn(tx);
        },
      );
      await expect(service.receivePurchaseOrder('missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if purchase order is already received', async () => {
      mockPrismaService.$transaction.mockImplementation(
        (fn: (tx: unknown) => Promise<unknown>) => {
          const tx = {
            purchaseOrder: {
              findUnique: jest.fn().mockResolvedValue({
                id: 'po-1',
                status: 'RECEIVED',
                items: [],
              }),
            },
          };
          return fn(tx);
        },
      );
      await expect(service.receivePurchaseOrder('po-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
