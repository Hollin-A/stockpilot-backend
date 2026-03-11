import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.supplier.create({ data });
  }

  findAll() {
    return this.prisma.supplier.findMany();
  }
}
