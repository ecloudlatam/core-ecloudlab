import { ForbiddenException, Injectable, Logger, Query } from "@nestjs/common";
import { GeminiService } from "./gemini.service";
import { VercelGatewayService } from "./vercel.service";
import { SessionManagerService } from "./session-redis.service";
import _ from 'lodash'

@Injectable()
export class WhatsAppService {
    constructor(
        private readonly sessionManagerService: SessionManagerService,
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

    async messages(appId: string, botId: number, phone: number, body: any) {
        try {
            const message = this.formatedText(body)

            if (!message) return message

            const history = await this.sessionManagerService.getSession(appId, botId, phone)
            console.log(history)

            const models = await this.geminiService.runAgentAI(history, message.parts[0].text)
            const modelPayload = {
                role: "model",
                parts: [{ text: models.message }]
            };
            await Promise.all([
                this.sessionManagerService.createSession(appId, botId, phone, message),
                this.sessionManagerService.createSession(appId, botId, phone, modelPayload),
                this.sendMessages(models.message, phone)
            ]);
            return models
        } catch (error) {
            throw new Error(error)
        }

    }

    formatedText(data: any) {
        this.logger.log(data)
        const { contacts, messages } = data.entry[0].changes[0].value

        if (!messages) return null

        const text = messages[0].text.body

        return {
            role: "user",
            parts: [{ text }]
        }
    }

    async sendMessages(message: string, userId: number) {

        const data = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": userId,
            "type": "text",
            "text": {
                "body": message
            }
        }
        const resp = await fetch(`https://graph.facebook.com/v25.0/${process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.TOKEN_MESSAGE}`,
            },
            body: JSON.stringify(data)
        })
        this.logger.log(resp)
    }
}