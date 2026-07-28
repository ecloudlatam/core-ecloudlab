import { SupabaseService } from '@app/supabase';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async create(categories: any) {
    const db = this.supabase.getClient();
    const data = await db.from('categories').insert([categories]).select();
    return data;
  }

  async findone(uuid: string): Promise<any> {
    const db = this.supabase.getClient();
    const data = await db.from('categories').select('id').eq('id', uuid);
    return data;
  }
}
