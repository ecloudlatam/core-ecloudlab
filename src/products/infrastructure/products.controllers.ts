import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

import { ApiKeyGuard } from 'src/guards';
import { CreateProductDto } from '../dto/create.dto';
import { ProductsService } from './products.service';

@Controller()
@UseGuards(ApiKeyGuard)
export class ProductsControllers {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(@Req() request, @Body() products: CreateProductDto) {
    try {
      const app = request['apps'];
      const data = await this.productsService.create(products, app.id);
      return data;
    } catch (error) {}
  }

  @Get()
  async get() {
    try {
      const data = await this.productsService.findAll();
      return data;
    } catch (error) {}
  }

  @Post('barcodes')
  async findBarCode(@Body() body: any) {
    const { barcodes } = body;
    return this.productsService.findBarCode(barcodes);
  }

  @Post('search')
  async findOne(@Body() body: any) {
    try {
      const { product, type } = body;
      const data = await this.productsService.searchProducts(product, type);
      return data;
    } catch (error) {}
  }
}
