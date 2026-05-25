import { ForbiddenException, Injectable, Logger, Query } from "@nestjs/common";
import { GeminiService } from "./gemini.service";
import { VercelGatewayService } from "./vercel.service";
import { SessionManagerService } from "./session-redis.service";

@Injectable()
export class WhatsAppService {
    constructor(
        private readonly sessionManagerService : SessionManagerService,
        private readonly geminiService: GeminiService,
        private readonly vercelGatewayService: VercelGatewayService
    ) { }

    private readonly logger = new Logger(WhatsAppService.name)
    webhook(query: any) {

        const mode = query['hub.mode']
        const token = query['hub.verify_token']
        const challenge = query['hub.challenge']

        const myVerifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'MI_TOKEN_SECRETO_TIGRESA';

        if (mode === 'subscribe' && token === myVerifyToken) {
            this.logger.log('¡Webhook de WhatsApp verificado con éxito nativamente!');
            return challenge;
        }

        throw new ForbiddenException('Token de verificación inválido');
    }

    async messages(appId:string,botId: number, phone: number,body: any) {
        try {
            const {value} = await this.geminiService.runAgentAI(body)
            const {content} = value.candidates[0]
            await this.sessionManagerService.createSession(appId, botId, phone, content)
            return content
        } catch (error) {
            throw new Error(error)
        }

    }
}