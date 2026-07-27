import { SupabaseService } from '@app/supabase';
import { Injectable, Logger } from '@nestjs/common';
import { getDoubtsDto } from '../dto/get.dto';
import { CreateDoubtDto } from '../dto/create.dto';

@Injectable()
export class DoubtRepository {
  constructor(private supabase: SupabaseService) {}
  private logger = new Logger(DoubtRepository.name);

  async getAlls(appId: string): Promise<getDoubtsDto[]> {
    try {
      const db = this.supabase.getClient();

      const { data } = await db.from('doubts').select('*').eq('app_id', appId);
      return (data as getDoubtsDto[]) || [];
    } catch (error) {
      throw new Error(error);
    }
  }

  async create(payload: CreateDoubtDto): Promise<any> {
    try {
      const db = this.supabase.getClient();
      const { data } = await db.from('doubts').insert([payload]).select();
      return data;
    } catch (error) {
      this.logger.log(error);
      throw new Error(error);
    }
  }
}
