import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.product.findMany();
  }

  async create(data: CreateProductDto) {
    try {
      const product = await this.prisma.product.create({ data });
      this.logger.log(`Product created: ${product.name} (SKU: ${product.sku})`);
      return product;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        this.logger.warn(`Attempted to create duplicate product SKU: ${data.sku}`);
        throw new ConflictException('A product with this SKU already exists');
      }
      throw e;
    }
  }
}
