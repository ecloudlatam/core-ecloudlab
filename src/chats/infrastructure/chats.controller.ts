// src/chats/infrastructure/chats.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Res,
} from '@nestjs/common';
import { WhatsAppService } from './service/whatsapp.service';
import { get } from 'lodash';

@Controller('webhooks')
export class ChatsController {
  private readonly logger = new Logger(ChatsController.name);

  constructor(private readonly whatsappService: WhatsAppService) {}

  @Get(':appId')
  verifyWebhook(@Query() query: any): string {
    return this.whatsappService.webhook(query);
  }

  @Post(':appId')
  async handleIncomingMessage(
    @Body() body: any,
    @Param('appId') appId: string,
    @Res() response: any,
  ) {
    response.status(HttpStatus.OK).send('EVENT_RECEIVED');

    const value = body.entry[0].changes[0].value;
    const { wa_id } = get(value, 'contacts')[0];

    const botId = 593939017821;
    try {
      await this.whatsappService.events(appId, botId, wa_id, body);
      await this.whatsappService.menuprincipal(appId, botId, wa_id, body);
    } catch (error) {
      console.error('Error procesando agentShop:', error);
    }
  }
}
