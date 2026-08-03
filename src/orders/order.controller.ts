import { Body, Controller, Post, Req, UseGuards, Get } from '@nestjs/common';
import { ApiKeyGuard } from 'src/guards';
import { OrderService } from './orders.service';
import { OrderCreateDto } from './order-create.dto';

@Controller('')
@UseGuards(ApiKeyGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
  @Post()
  async create(@Req() request: any, @Body() orderCreateDto: OrderCreateDto) {
    const app = request['apps'];
    const resp = await this.orderService.create(orderCreateDto, app.id);
    return resp;
  }

  @Post('generate')
  generate(@Req() @Body() body: any) {
    const { product } = body;
    const resp = this.orderService.generateInternalBarcode(product);
    return resp;
  }

  @Get('total')
  async total() {
    const resp = await this.orderService.generatePdfOrderTotal();
    return resp;
  }
}
