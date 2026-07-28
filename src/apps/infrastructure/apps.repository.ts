import { Injectable } from '@nestjs/common';
import { SupabaseService } from '@app/supabase';

@Injectable()
export class AppRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(nuevaApp: any): Promise<any> {
    try {
      const supabase = this.supabaseService.getClient();
      const { data } = await supabase.from('apps').insert([nuevaApp]).select();
      return data;
    } catch (error) {}
  }

  async findAll() {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.from('apps').select('*');
    if (error) throw new Error(error.message);
    return data;
  }
}
