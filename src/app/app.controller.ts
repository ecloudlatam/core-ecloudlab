import { Body, Controller, Get, Inject, Logger, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { IAppsRepository } from './domain/iapps.repository';
import {CreateAppDto} from './domain/dtos/create-app.dto'
import { AppEntity } from './domain/app.entity';

@Controller()
export class AppController {

  private readonly logger = new Logger(AppController.name);

  constructor(@Inject("IAppsRepository") private readonly iAppsRepository :IAppsRepository) {}

  @Get()
  async apps(): Promise<AppEntity[]>{
   return await this.iAppsRepository.findAll()
  }


 @Post()
  async create(@Body() body: CreateAppDto): Promise<AppEntity> {
    this.logger.log(body)
    return await this.iAppsRepository.create(body);
  }
}
