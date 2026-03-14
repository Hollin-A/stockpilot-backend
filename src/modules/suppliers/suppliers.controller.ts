import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('suppliers')
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: any) {
    return this.suppliersService.create(body);
  }

  @Get()
  findAll() {
    return this.suppliersService.findAll();
  }
}
