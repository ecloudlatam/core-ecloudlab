import { Controller, Get, Param } from '@nestjs/common';
import { AgentsRepository } from './agent.repository';

@Controller()
export class AgentsControllers {
  constructor(private readonly repository: AgentsRepository) {}

  @Get()
  async findAll() {
    const agent = this.repository.findAll();
    return agent;
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    console.log('params ===', slug);
    const agent = this.repository.findAgentools(slug);
    return agent;
  }
}
