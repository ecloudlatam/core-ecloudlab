import { SupabaseService } from '@app/supabase';
import { Injectable } from '@nestjs/common';
import {
  CreateProductBarcodeDto,
  CreateVariantWithExtraDto,
} from '../dto/create-variant.dto';

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

  async createProductVariants(product: CreateVariantWithExtraDto) {
    try {
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

  async createProductBarCode(product: CreateProductBarcodeDto) {
    try {
      const db = this.supabaseService.getClient();
      const { data } = await db
        .from('product_barcodes')
        .insert([product])
        .select();
      return data;
    } catch (error) {
      console.log('error === ', error);
    }
  }

  async findProductBarCode(barcode: string) {
    try {
      const db = this.supabaseService.getClient();
      const { data } = await db
        .from('product_barcodes')
        .select('*')
        .eq('barcode', barcode)
        .limit(1);
      return data;
    } catch (error) {}
  }

  async findProductBarCodes(barcodes: string[]) {
    try {
      const db = this.supabaseService.getClient();

      const data = await db
        .from('product_barcodes')
        .select(
          `
          *,
          product_variants!inner (
            id,stock,tax_rate,valid_to,image_url,price_buy,unit_type,price_sell,sku_number,valid_from,unit_quantity,
            products!inner (id,name )
          )
        `,
        )
        .in('barcode', barcodes);

      return data; // Retorna un Array con todas las coincidencias encontradas
    } catch (error) {
      console.error('Error en findProductBarCodes ===', error);
      throw error;
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
          `id, name, images, cant,suppliers!inner(id,name), product_variants (id, stock, image_url, price_buy, price_sell, unit_type,tax_rate)`,
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
          `id, name, images, cant, product_variants (id, stock, image_url, price_buy, price_sell, unit_type,tax_rate)`,
        );
    } catch (error) {}
  }
}
