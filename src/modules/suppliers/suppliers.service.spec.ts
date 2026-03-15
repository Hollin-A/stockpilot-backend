import { Test, TestingModule } from '@nestjs/testing';
import { SuppliersService } from './suppliers.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateSupplierDto } from './dto/create-supplier.dto';

const mockPrismaService = { supplier: { create: jest.fn(), findMany: jest.fn() } };

describe('SuppliersService', () => {
  let service: SuppliersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuppliersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SuppliersService>(SuppliersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto: CreateSupplierDto = { name: 'Acme Corp', email: 'acme@example.com' };

    it('should create and return a supplier', async () => {
      const created = { id: '1', ...dto };
      mockPrismaService.supplier.create.mockResolvedValue(created);
      expect(await service.create(dto)).toEqual(created);
    });

    it('should throw ConflictException on duplicate supplier', async () => {
      const error = new Prisma.PrismaClientKnownRequestError('Unique constraint', { code: 'P2002', clientVersion: '1' });
      mockPrismaService.supplier.create.mockRejectedValue(error);
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all suppliers', async () => {
      const suppliers = [{ id: '1', name: 'Acme Corp' }];
      mockPrismaService.supplier.findMany.mockResolvedValue(suppliers);
      expect(await service.findAll()).toEqual(suppliers);
    });
  });
});
