import { Module } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { OrderService } from './orders.service';
import { OrderController } from './order.controller';
import { SupabaseLibModule } from '@app/supabase';
import { AuthModule } from '@app/auth';

@Module({
  controllers: [OrderController],
  providers: [OrdersRepository, OrderService],
  exports: [OrderService],
  imports: [SupabaseLibModule, AuthModule],
})
export class OrderModule {}
