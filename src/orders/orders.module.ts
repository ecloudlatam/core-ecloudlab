import { Module } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { OrderService } from './orders.service';
import { OrderController } from './order.controller';
import { SupabaseLibModule } from '@app/supabase';
import { AuthModule } from '@app/auth';
import { PdfModule } from 'src/common/pdf/pdf.module';

@Module({
  providers: [OrdersRepository, OrderService],
  exports: [OrderService, OrdersRepository],
  controllers: [OrderController],
  imports: [SupabaseLibModule, AuthModule, PdfModule],
})
export class OrderModule {}
