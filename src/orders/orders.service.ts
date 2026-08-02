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

  generateInternalBarcode(productName: string) {
    try {
      console.log('productName ===', productName);
      const cleanName = productName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-0]/g, '')
        .substring(0, 6)
        .toUpperCase();

      const randomSuffix = Math.floor(1000 + Math.random() * 9000);

      console.log('cleanName', cleanName);

      return {
        success: true,
        data: `el codigo del producto ${productName} INT-${cleanName}-${randomSuffix}`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'error en crea el producto',
      };
    }
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
      return {
        success: true,
        message: 'crearon los registros',
        data: resp.map((item) => item).join(','),
      };
    } catch (error) {
      return { success: false, message: 'hubo errores para registrar datos' };
    }
  }

  async orderTotal(){
    try {

   const resp = await this.ordersRepository.getOrdersToday()
      return {
        success: true,
        message: 'ventas realizadas de hoy',
        data: {
          totalSalesToday: resp.totalSalesToday,
          totalCostToday : resp.totalCostToday,
          totalProfitToday:  resp.totalProfitToday,
          totalOrders: resp.totalOrders,
          orders: resp.orders.map((item) => item).join('')
        }
      };
    } catch (error) {
            return { success: false, message: 'hubo errores para registrar datos' };

    }
  }
}
