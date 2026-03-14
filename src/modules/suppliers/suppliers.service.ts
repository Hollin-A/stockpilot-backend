import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    try {
      return await this.prisma.supplier.create({ data });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('A supplier with these details already exists');
      }
      throw e;
    }
  }

  findAll() {
    return this.prisma.supplier.findMany();
  }
}
