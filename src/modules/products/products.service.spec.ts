import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';

const mockPrismaService = {
  product: { findMany: jest.fn(), create: jest.fn() },
};

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const products = [{ id: '1', name: 'Widget', sku: 'WGT-01' }];
      mockPrismaService.product.findMany.mockResolvedValue(products);
      expect(await service.findAll()).toEqual(products);
    });
  });

  describe('create', () => {
    const dto: CreateProductDto = {
      name: 'Widget',
      sku: 'WGT-01',
      price: 9.99,
      stock: 100,
      threshold: 10,
    };

    it('should create and return a product', async () => {
      const created = { id: '1', ...dto };
      mockPrismaService.product.create.mockResolvedValue(created);
      expect(await service.create(dto)).toEqual(created);
    });

    it('should throw ConflictException on duplicate SKU', async () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint',
        { code: 'P2002', clientVersion: '1' },
      );
      mockPrismaService.product.create.mockRejectedValue(error);
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });
});
