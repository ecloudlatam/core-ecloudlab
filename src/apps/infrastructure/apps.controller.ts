import { Body, Controller, Get, Logger, Post, UseGuards } from '@nestjs/common';
import { AppsService } from './apps.service';
import { CreateAppDto } from '../domain/dtos/create-apps.dto';
import { AppEntity } from '../domain/apps.entity';
import { MasterKeyGuardTsGuard } from 'src/guards';

@Controller()
@UseGuards(MasterKeyGuardTsGuard)
export class AppsController {
  private readonly logger = new Logger(AppsController.name);

  constructor(private readonly appservice: AppsService) {}

  @Get()
  async apps(): Promise<AppEntity[]> {
    return await this.appservice.findAll();
  }

  @Post()
  async create(@Body() body: CreateAppDto): Promise<AppEntity> {
    this.logger.log(body);
    return await this.appservice.create(body);
  }
}
