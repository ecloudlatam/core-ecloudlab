import { Module } from '@nestjs/common';
import { SupabaseLibModule } from '@app/supabase';
import { AuthModule } from '@app/auth';
import { SuppliersRepository } from './supplier.repository';
import { SupplierService } from './supplier.service';

@Module({
  providers: [SupplierService, SuppliersRepository],
  exports: [SupplierService, SuppliersRepository],
  imports: [SupabaseLibModule, AuthModule],
})
export class SupplierModule {}
