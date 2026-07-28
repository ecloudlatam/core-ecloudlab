import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiKeyGuard } from 'src/guards';

@Controller()
@UseGuards(ApiKeyGuard)
export class UsersControllers {
  constructor(private readonly userService: UsersService) {}

  @Get()
  async users() {
    return await this.userService.findAll();
  }

  @Post()
  async create(@Req() request: any, @Body() createUserDto: any) {
    const app = request['apps'];
    const resp = await this.userService.create(createUserDto, app.id);
    return resp;
  }

  @Get(':userId')
  async user(@Param('userId') userId: number) {
    return await this.userService.findOne(userId);
  }
}
