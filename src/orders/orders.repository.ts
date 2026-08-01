import { Injectable } from '@nestjs/common';
import { SupabaseService } from '@app/supabase';
import { OrderCreateDto, orderDetailsDto } from './order-create.dto';

@Injectable()
export class OrdersRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createOrderDetails(orders: orderDetailsDto[]) {
    try {
      const db = this.supabaseService.getClient();
      const response = await db.from('order_details').insert(orders).select();
      return response;
    } catch (error) {}
  }

  async createOrder(order: OrderCreateDto) {
    const { reference_id, status, total } = order;
    try {
      const db = this.supabaseService.getClient();
      const response = await db
        .from('orders')
        .insert({
          reference_id,
          status,
          total,
        })
        .select();
      return response;
    } catch (error) {}
  }
}
