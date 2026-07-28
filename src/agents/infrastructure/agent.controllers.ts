import { Controller, Get, Param } from '@nestjs/common';
import { AgentService } from './agent.service';

@Controller()
export class AgentsControllers {
  constructor(private readonly agentService: AgentService) {}

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const agent = this.agentService.findExec(slug);
    return agent;
  }
}
