import { SupabaseLibModule, SupabaseService } from '@app/supabase';
import { Inject, Injectable } from '@nestjs/common';
import { omit } from 'lodash';

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
          `
          *,
          suppliers!inner (
            id,
            name
          )
        `,
        )
        .ilike('suppliers.name', `%${supplierName}%`); // ilike para búsqueda insensible a mayúsculas/minúsculas
      return data;
    } catch (error) {
      throw error;
    }
  }

  async findAll(): Promise<any> {
    try {
      const db = this.supabaseService.getClient();
      return await db.from('products').select();
    } catch (error) {}
  }
}
