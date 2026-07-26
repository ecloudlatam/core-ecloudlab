import { SupabaseService } from '@app/supabase';
import { Injectable } from '@nestjs/common';
import { head } from 'lodash';

@Injectable()
export class AgentsRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll() {
    try {
      const db = this.supabaseService.getClient();
      const agent = await db.from('agents').select();
      return agent;
    } catch (error) {
      console.log(error);
    }
  }

  async fndOne(slug: string) {
    try {
      const db = this.supabaseService.getClient();
      const { data } = await db.from('agents').select().eq('slug', slug);
      return head(data) ?? {};
    } catch (error) {}
  }

  async findAgentools(agent: string) {
    try {
      const db = this.supabaseService.getClient();
      // Con id: directo, rápido y limpio
      const data = await db
        .from('agents')
        .select(
          `
        id,
        slug,
        model,
        prompt,
        pivot_agents_tools (
          tools (
            id,
            name,
            description,
            tools_parameters (
              id,
              key,
              description,
              type
            )
          )
        )
      `,
        )
        .eq('slug', agent)
        .single(); // <-- Importante: te devuelve 1 solo objeto en vez de un array
      return data;
    } catch (error) {}
  }
}
