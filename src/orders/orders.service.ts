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
}
