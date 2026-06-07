// src/chats/infrastructure/chats.controller.ts
import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus, Logger, Param, Res } from '@nestjs/common';
import { WhatsAppService } from './service/whatsapp.service';

@Controller('webhooks')
export class ChatsController {
  private readonly logger = new Logger(ChatsController.name);

  constructor(private readonly whatsappService: WhatsAppService,
  ) { }

  @Get(':appId')
  verifyWebhook(@Query() query: any): string {
    return this.whatsappService.webhook(query)
  }

 @Post(':appId') // O la ruta que manejes
  async handleIncomingMessage(
    @Body() body: any,
    @Param('appId') appId: string,
    @Res() response: any
  ) {
    response.status(HttpStatus.OK).send('EVENT_RECEIVED');

    const botId = 12345678;
    const phone = 593983258685;

    try {
      await this.whatsappService.events(appId, botId, phone, body)
      await this.whatsappService.menuprincipal(appId, botId, phone, body);
    } catch (error) {
      console.error('Error procesando agentShop:', error);
    }
  }
}