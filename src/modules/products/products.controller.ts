import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Roles('ADMIN')
  @Post()
  create(@Body() body: any) {
    return this.productsService.create(body);
  }
}
