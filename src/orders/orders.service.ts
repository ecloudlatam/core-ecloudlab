import { Injectable } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { OrderCreateDto } from './order-create.dto';

@Injectable()
export class OrderService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async create(orderCreateDto: OrderCreateDto, appId: string) {
    console.log('appId ===', appId);
    const { items } = orderCreateDto;

    const order = await this.ordersRepository.createOrder(orderCreateDto);

    const { data: orderData } = order;
    const orderId = orderData[0].id;

    orderCreateDto.items.forEach((item) => {
      item.order_id = orderId;
    });

    const orderDetails = await this.ordersRepository.createOrderDetails(items);
    return orderDetails;
  }

  async createList(products: any, appId: string): Promise<any> {
    const resp = [];
    try {
      for (let index = 0; index < products.length; index++) {
        const element = products[index];
        const item = JSON.parse(element);
        const items = await this.create(item, appId);

        resp.push(items);
      }
      return { success: true, message: 'crearon los registros', data: resp };
    } catch (error) {
      return { success: false, message: 'hubo errores para registrar datos' };
    }
  }
}
