import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: createProductDto,
    });

    return product;
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;

    const products = await this.prisma.product.findMany({
      where: { available: true },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await this.prisma.product.count({
      where: { available: true },
    });
    const lastPage = Math.ceil(total / limit);

    return {
      data: products,
      metadata: {
        total,
        page,
        lastPage,
      },
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id, available: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  async update(updateProductDto: UpdateProductDto) {
    const { id, ...toUpdate } = updateProductDto;
    await this.findOne(id);

    const product = await this.prisma.product.update({
      where: { id },
      data: toUpdate,
    });

    return product;
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.product.update({
      where: { id },
      data: { available: false },
    });

    return { message: 'Product deleted successfully' };
  }
}
