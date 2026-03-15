/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateUserDto, UserRole } from './dto/create-user.dto';

const mockPrismaService = {
  user: { create: jest.fn(), findUnique: jest.fn() },
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto: CreateUserDto = {
      email: 'user@example.com',
      password: 'password123',
      role: UserRole.STAFF,
    };

    it('should create a user with a hashed password', async () => {
      const created = {
        id: '1',
        email: dto.email,
        role: dto.role,
        password: 'hashed',
      };
      mockPrismaService.user.create.mockResolvedValue(created);

      const result = (await service.create(dto)) as { email: string };
      expect(result.email).toBe(dto.email);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ email: dto.email, role: dto.role }),
        }),
      );
      // password should be hashed, not plain text
      expect(mockPrismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({ password: dto.password }),
        }),
      );
    });

    it('should throw ConflictException on duplicate email', async () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint',
        { code: 'P2002', clientVersion: '1' },
      );
      mockPrismaService.user.create.mockRejectedValue(error);
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const user = { id: '1', email: 'user@example.com' };
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      const found = (await service.findByEmail('user@example.com')) as {
        id: string;
        email: string;
      };
      expect(found).toEqual(user);
    });

    it('should return null if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      expect(await service.findByEmail('missing@example.com')).toBeNull();
    });
  });
});
