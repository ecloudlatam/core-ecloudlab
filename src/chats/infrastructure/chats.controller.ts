// src/chats/infrastructure/chats.controller.ts
import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus, ForbiddenException, Logger, Req, Param } from '@nestjs/common';
import { WhatsAppService } from './service/whatsapp.service';
import { SessionManagerService } from './service/session-redis.service';

@Controller('webhooks')
export class ChatsController {
  private readonly logger = new Logger(ChatsController.name);

  constructor(private readonly whatsappService: WhatsAppService,
    private readonly sessionManagerService:SessionManagerService
  ) { }

  @Get(':appId')
  verifyWebhook(@Query() query: any): string {
    return this.whatsappService.webhook(query)
  }

  @Post(':appId')
  @HttpCode(HttpStatus.OK)
  async handleIncomingMessage(
    @Body() body: any,
    @Param('appId') appId: string,
  ) {

    const botId = 12345678;
    const phone = 593983258685;
    const resp =  await this.whatsappService.agentShop(appId, botId, phone, body)
    return resp;
  }
}