import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsNumber, IsPositive, Min } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsNumber()
  @IsPositive()
  id: number;
}
