import { SupabaseLibModule } from '@app/supabase';
import { Module } from '@nestjs/common';
import { AgentsControllers } from './infrastructure/agent.controllers';
import { AgentsRepository } from './infrastructure/agent.repository';
import { AgentService } from './infrastructure/agent.service';

@Module({
  controllers: [AgentsControllers],
  providers: [AgentsRepository, AgentService],
  imports: [SupabaseLibModule],
  exports: [AgentService, AgentsRepository],
})
export class AgentModule {}
