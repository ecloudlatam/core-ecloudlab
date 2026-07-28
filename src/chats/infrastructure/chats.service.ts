import { WhatsAppService } from './service/whatsapp.service';

export class ChatService {
  constructor(protected readonly whatsAppService: WhatsAppService) {}
}
