import { Body, Controller, Get, Post } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';

@Controller('suppliers')
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @Post()
  create(@Body() body: any) {
    return this.suppliersService.create(body);
  }

  @Get()
  findAll() {
    return this.suppliersService.findAll();
  }
}
