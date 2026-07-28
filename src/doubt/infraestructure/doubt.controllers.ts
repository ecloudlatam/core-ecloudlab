import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiKeyGuard } from 'src/guards';
import { CreateDoubtDto } from '../dto/create.dto';
import { DoubtService } from './doubt.service';

@Controller()
@UseGuards(ApiKeyGuard)
export class DoubtController {
  constructor(private readonly doubtService: DoubtService) {}

  private looger = new Logger(DoubtController.name);

  @Get()
  async findalls(@Request() req) {
    try {
      const data = await this.doubtService.findAll(req['apps'].id);
      return data;
    } catch (error) {
      throw new Error(error);
    }
  }

  @Post()
  async create(@Body() doubt: CreateDoubtDto[]) {
    this.looger.log(doubt);

    return null;
  }
}
