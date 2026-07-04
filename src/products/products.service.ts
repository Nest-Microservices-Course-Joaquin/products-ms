import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { RpcException } from '@nestjs/microservices';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  private handleUniqueConstraintError(error: unknown, name?: string): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new RpcException({
        status: HttpStatus.CONFLICT,
        message: `Product with name '${name}' already exists`,
      });
    }

    throw error;
  }

  async create(createProductDto: CreateProductDto) {
    try {
      const product = await this.prisma.product.create({
        data: createProductDto,
      });

      return product;
    } catch (error) {
      this.handleUniqueConstraintError(error, createProductDto.name);
    }
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
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Product with id ${id} not found`,
      });
    }

    return product;
  }

  async update(updateProductDto: UpdateProductDto) {
    const { id, ...toUpdate } = updateProductDto;
    await this.findOne(id);

    try {
      const product = await this.prisma.product.update({
        where: { id },
        data: toUpdate,
      });

      return product;
    } catch (error) {
      this.handleUniqueConstraintError(error, toUpdate.name);
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.product.update({
      where: { id },
      data: { available: false },
    });

    return { message: 'Product deleted successfully' };
  }

  async validateProducts(ids: number[]) {
    ids = Array.from(new Set(ids));

    const products = await this.prisma.product.findMany({
      where: { id: { in: ids } },
    });

    if (products.length !== ids.length) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `Some products were not found`,
      });
    }

    return products;
  }
}
