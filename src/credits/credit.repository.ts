import { Injectable } from '@nestjs/common';
import { SupabaseService } from '@app/supabase';

@Injectable()
export class CreditsRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findall(): Promise<any> {
    try {
      const supabase = this.supabaseService.getClient();
      const data = await supabase.from('credits').select('*');
      return data;
    } catch (error) {}
  }

  async create(body: any) {
    try {
      const supabase = this.supabaseService.getClient();
      const data = await supabase.from('credits').insert([body]).select();
      return data;
    } catch (error) {}
  }
  async findOne(userId: number) {
    try {
      const supabase = this.supabaseService.getClient();

      const data = await supabase
        .from('credits')
        .select('*')
        .eq('reference_id', userId)
        .single();

      return data;
    } catch (error) {
      throw error;
    }
  }
}
