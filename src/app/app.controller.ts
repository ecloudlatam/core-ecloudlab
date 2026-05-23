import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { IAppsRepository } from './domain/iapps.repository';

@Controller()
export class AppController {
  constructor(@Inject("IAppsRepository") private readonly iAppsRepository :IAppsRepository) {}

  @Get()
  async apps(){
    await this.iAppsRepository.findAll()
  }


 @Post()
  async create(@Body() body: any) {
    return await this.iAppsRepository.create(body);
  }
}
