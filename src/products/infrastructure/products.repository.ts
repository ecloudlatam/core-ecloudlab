import { SupabaseService } from '@app/supabase';
import { Injectable } from '@nestjs/common';
import { CreateVariantDto } from '../dto/create-variant.dto';

@Injectable()
export class ProductsRepository {
  constructor(private readonly supabaseService: SupabaseService) {}
  async create(products: any) {
    try {
      const db = this.supabaseService.getClient();
      const response = await db.from('products').insert([products]).select();

      return response;
    } catch (error) {}
  }

  async createProductPrices(product: CreateVariantDto) {
    try {
      console.log('products ===', product);
      const db = this.supabaseService.getClient();
      const response = await db
        .from('product_variants')
        .insert([product])
        .select();

      return response;
    } catch (error) {
      console.log('error ===', error);
    }
  }

  async findOne(embedding: any) {
    try {
      const db = this.supabaseService.getClient();

      const data = await db.rpc('match_products', {
        query_embedding: embedding,
        match_threshold: 0.3,
        match_count: 5,
      });

      return data;
    } catch (error) {}
  }

  async findbySupplier(supplierName: string) {
    try {
      const db = this.supabaseService.getClient();

      const data = await db
        .from('products')
        .select(
          `id, name, images, cant, sku,suppliers!inner(id,name), product_variants (id, stock, unit_type ,price_buy, price_sell)`,
        )
        .ilike('suppliers.name', `%${supplierName}%`);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async findAll(): Promise<any> {
    try {
      const db = this.supabaseService.getClient();
      return await db
        .from('products')
        .select(
          `id, name, images, cant, sku, product_variants (id, stock, unit_type, price_buy, price_sell)`,
        );
    } catch (error) {}
  }
}
