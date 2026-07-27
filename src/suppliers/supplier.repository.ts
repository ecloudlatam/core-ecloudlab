import { Injectable } from '@nestjs/common';
import { SupabaseService } from '@app/supabase';

@Injectable()
export class SuppliersRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findall(): Promise<any> {
    try {
      const supabase = this.supabaseService.getClient();
      const data = await supabase.from('suppliers').select('*');
      return data;
    } catch (error) {}
  }

  async create(body: any) {
    try {
      const supabase = this.supabaseService.getClient();
      const data = await supabase.from('suppliers').insert([body]).select();
      return data;
    } catch (error) {}
  }

  async findOne(name: string): Promise<any> {
    try {
      const supabase = this.supabaseService.getClient();
      const data = await supabase
        .from('suppliers')
        .select('*')
        .ilike('name', `%${name}%`);
      return data;
    } catch (error) {}
  }
}
