import { Controller } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @MessagePattern({ cmd: 'create_product' })
  async create(@Payload() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @MessagePattern({ cmd: 'find_all_products' })
  async findAll(@Payload() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  @MessagePattern({ cmd: 'find_product_by_id' })
  async findOne(@Payload('id') id: number) {
    return this.productsService.findOne(id);
  }

  @MessagePattern({ cmd: 'update_product' })
  async update(@Payload() updateProductDto: UpdateProductDto) {
    return this.productsService.update(updateProductDto);
  }

  @MessagePattern({ cmd: 'delete_product' })
  async remove(@Payload('id') id: number) {
    return this.productsService.remove(id);
  }
}
