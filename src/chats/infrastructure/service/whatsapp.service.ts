import { ForbiddenException, Injectable, Logger, Query } from "@nestjs/common";
import { GeminiService } from "./gemini.service";
import { VercelGatewayService } from "./vercel.service";
import { SessionManagerService } from "./session-redis.service";
import { pick, assign, omit } from "lodash"

@Injectable()
export class WhatsAppService {
    constructor(
        private readonly sessionManagerService: SessionManagerService,
        private readonly geminiService: GeminiService,
    ) { }

    private readonly logger = new Logger(WhatsAppService.name)
    private readonly baseUrl = `${process.env.WHATSAPP_BASE_URL}/v25.0/${process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID}`

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

    async agentShop(appId: string, botId: number, phone: number, body: any) {
        try {
            const message = await this.formatedText(body)

            if (!message) return message

            const history = await this.sessionManagerService.getSession(appId, botId, phone)

            // 🎯 PASO 1: Router identifica la intención
            const routeInfo = await this.geminiService.agentRouter(history, message.parts[0].text)


            // 🤖 PASO 2: Ejecutor maneja la acción con contexto de la intención
            const models = await this.geminiService.runAgentAI(
                history, 
                message.parts[0].text,
                appId,
                phone,
                routeInfo,
               
            )

            const modelPayload = {
                role: "model",
                parts: [{ text: models.message }]
            };
            
            await Promise.all([
                this.sessionManagerService.createSession(appId, botId, phone, message),
                this.sessionManagerService.createSession(appId, botId, phone, modelPayload),
                this.sendMessages(models.message, phone)
            ]);
            
            return {
                ...models,
                routeInfo // Incluir info de routing para debugging
            };
        } catch (error) {
            // this.logger.error(`Error en agentShop: ${error.message}`)
            throw new Error(error)
        }

    }

    async formatedText(payload: any) {
        const { messages } = payload.entry[0].changes[0].value

        if (!messages) return null

        const { id, type } = pick(messages[0], ['from', "from_user_id", "id", "timestamp", "text", "type"])
        this.typingIndicator(id)
        const data = await this.typeMessage(type, messages)
        return {
            role: "user",
            parts: [{ text: data.text.body }]

        }
    }


    async typeMessage(key: string, message: any) {

        switch (key) {
            case "audio":
                return this.downloadWhatsAppAudio(message)
            case "text":
                return message[0]
            default:
                break;
        }
    }

    async typingIndicator(messageId: string) {
        const body = {
            "messaging_product": "whatsapp",
            "status": "read",
            "message_id": messageId,
            "typing_indicator": {
                "type": "text"
            }
        }
        this.apiPost("messages", body)

    }

    async sendMessages(message: string, userId: number) {

        const body = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": userId,
            "type": "text",
            "text": {
                "body": message
            }
        }
        this.apiPost("messages", body)

    }

    private async apiPost(endpoint: string, body: any) {
        try {
            const resp = await fetch(`${this.baseUrl}/${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN_MESSAGE}`,
                },
                body: JSON.stringify(body)
            });
            const data = await resp.json();
            if (!resp.ok) {
                this.logger.error(`[WhatsApp API Error] Endpoint: ${endpoint} | Error: ${JSON.stringify(data)}`);
                return null;
            }
            return data;
        } catch (error) {
            this.logger.error(`[Fetch Network Error] ${error.message}`);
            return null;
        }
    }

    private async apiGetAudio(id: string) {

        try {
            const resp = await fetch(`${process.env.WHATSAPP_BASE_URL}/v25.0/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN_MESSAGE}`,
                },
            });
            const { url } = await resp.json();

            const responseFile = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN_MESSAGE}`,
                }
            });

            const arrayBuffer = await responseFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            return buffer
        } catch (error) {
            console.log(error);
        }

    }

    async transcribeAudioBuffer(audioBuffer: Buffer): Promise<string | null> {
        try {
            const formData = new FormData();

            const audioBlob = new Blob([new Uint8Array(audioBuffer)], { type: 'audio/mp3' });
            formData.append('model_id', 'scribe_v2');

            formData.append('file', audioBlob, 'audio_cliente.mp3');

            // 4. Realizamos la petición POST
            const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
                method: 'POST',
                headers: {
                    'xi-api-key': process.env.ELEVENLABS_API_KEY,
                },
                body: formData, 
            });

            if (!response.ok) {
                const errorData = await response.json();
                this.logger.error(`Error en ElevenLabs STT: ${JSON.stringify(errorData)}`);
                return null;
            }

            const data = await response.json();
            return data.text; 

        } catch (error) {
            this.logger.error(`Error procesando el buffer en ElevenLabs: ${error.message}`);
            return null;
        }
    }

    private async downloadWhatsAppAudio(message: any) {
        const data = message[0]
        const buffer = await this.apiGetAudio(data.audio.id)
        const transcribeAudio = await this.transcribeAudioBuffer(buffer)
        return assign(omit(data, ['audio']), {text: {body: transcribeAudio}})
    }
}