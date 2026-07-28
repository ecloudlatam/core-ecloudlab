import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { MessageService } from './messages.service';
import { ApiKeyGuard } from 'src/guards';

@Controller()
@UseGuards(ApiKeyGuard)
export class MessagesControllers {
  constructor(private readonly userService: MessageService) {}

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
}
