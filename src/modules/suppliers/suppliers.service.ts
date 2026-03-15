import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateSupplierDto } from './dto/create-supplier.dto';

@Injectable()
export class SuppliersService {
  private readonly logger = new Logger(SuppliersService.name);

  constructor(private prisma: PrismaService) {}

  async create(data: CreateSupplierDto) {
    try {
      const supplier = await this.prisma.supplier.create({ data });
      this.logger.log(
        `Supplier created: ${supplier.name} (id: ${supplier.id})`,
      );
      return supplier;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        this.logger.warn(
          `Attempted to create duplicate supplier: ${data.name}`,
        );
        throw new ConflictException(
          'A supplier with these details already exists',
        );
      }
      throw e;
    }
  }

  findAll() {
    return this.prisma.supplier.findMany();
  }
}
