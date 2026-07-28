import { Module } from '@nestjs/common';
import { ProductsControllers } from './infrastructure/products.controllers';
import { SupabaseLibModule } from '@app/supabase';
import { ProductsRepository } from './infrastructure/products.repository';
import { CategoriesRepository } from 'src/categories/infrastructure/categories.repository';
import { AuthModule } from '@app/auth';
import { ProductsService } from './infrastructure/products.service';
import { GeminiModule } from 'src/common/gemini/gemini.module';
import { SupplierModule } from 'src/suppliers/supplier.module';
import { SupplierService } from 'src/suppliers/supplier.service';

@Module({
  imports: [SupabaseLibModule, AuthModule, GeminiModule, SupplierModule],
  providers: [
    ProductsRepository,
    CategoriesRepository,
    ProductsService,
    SupplierService,
  ],
  controllers: [ProductsControllers],
  exports: [ProductsService],
})
export class ProductsModules {}
