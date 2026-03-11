import { IsArray, IsNumber, IsString } from 'class-validator';

export class OrderItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  items: OrderItemDto[];
}
