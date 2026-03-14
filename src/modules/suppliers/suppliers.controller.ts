import { Body, Controller, Get, Post } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('suppliers')
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() body: any) {
    return this.suppliersService.create(body);
  }

  @Get()
  findAll() {
    return this.suppliersService.findAll();
  }
}
