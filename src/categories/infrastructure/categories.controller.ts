import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from 'src/guards';
import { CategoriesService } from './categories.service';

@Controller()
@UseGuards(ApiKeyGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findall() {
    return { ok: true };
  }

  @Post()
  async create(@Req() request: any, @Body() createCategoriesDto: any) {
    try {
      const app = request['apps'];
      return this.categoriesService.create(createCategoriesDto, app.id);
    } catch (error) {}
  }
}
