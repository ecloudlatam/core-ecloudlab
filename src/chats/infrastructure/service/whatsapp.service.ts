import { ForbiddenException, Injectable, Logger, Query } from "@nestjs/common";
import { GeminiService } from "./gemini.service";
import { SessionManagerService } from "./session-redis.service";
import { pick, assign, omit, get } from "lodash"
import { MessageService } from "src/messages/infrastructure/messages.service";
import { AwsService } from "src/shared/aws.service";
import { MetaService } from "../meta/meta.service";

@Injectable()
export class WhatsAppService {
    constructor(
        private readonly sessionManagerService: SessionManagerService,
        private readonly geminiService: GeminiService,
        private readonly messageService: MessageService,
        private readonly metaService: MetaService,
        private readonly awsService: AwsService
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

    async events(appId: string, botId: number, phone: number, body: any) {

        const value = body.entry[0].changes[0].value

        let payload = { bot_id: botId, reference_id: phone, status: "api", response: value }
        if (value.statuses) {
            const { statuses } = value

            const unixSeconds = parseInt(statuses[0].timestamp, 10);
            const dateObject = new Date(unixSeconds * 1000);

            const supabaseTimestamp = dateObject.toISOString();
            payload = assign(payload, { wam_id: statuses[0].id, status: statuses[0].status, timestamp: supabaseTimestamp })
        }

        await this.messageService.create(payload, appId)
    }

    async menuprincipal(appId: string, botId: number, phone: number, body: any) {
        try {

            const message = await this.formatedText(body)

            if (!message) return message
            console.log("message", message)

            const history = await this.sessionManagerService.getSession(appId, botId, phone)
            console.log("history", history.length)


            if (message.type == "interactive") {
                return await this.main(message, appId, phone, botId, history)
            }

            if (history.length <= 0) {
                return await this.metaService.menu(phone)
            }

            return await this.main(message, appId, phone, botId, history)
        } catch (error) {
            // this.logger.error(`Error en agentShop: ${error.message}`)
            throw new Error(error)
        }

    }

    async formatedText(payload: any) {
        const { messages, statuses = [] } = payload.entry[0].changes[0].value

        if (!messages) return null
        const { id, type } = messages[0]
        this.metaService.typingIndicator(id)
        const parts = await this.typeMessage(type, messages)
        return { type, parts, role: "user" }
    }


    async typeMessage(key: string, message: any) {

        console.log("key", key);
        switch (key) {
            case "audio":
                return this.downloadWhatsAppAudio(message)
            case "text":
                const { text } = message[0]
                return [{ text: text.body }]

            case "interactive":
                return this.interactive(message)

            case "image":
                return this.metaService.apiGetImg(message)
            default:
                break;
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
        const buffer = await this.metaService.apiGetAudio(data.audio.id)
        const transcribeAudio = await this.transcribeAudioBuffer(buffer)
        // return assign(omit(data, ['audio']), { text: { body: transcribeAudio } })
        return [{ text: transcribeAudio }]
    }

    private interactive(body: any) {
        const text = get(body[0], "interactive.list_reply.title", "hola")
        return [{ text }]
    }


    private async main(messages: any, appId: string, phone: number, botId: number, history: any) {
        const routeInfo = await this.geminiService.agentRouter(history, messages.parts)

        const models = await this.geminiService.agentPrincipal(
            history,
            messages.parts,
            appId,
            phone,
            routeInfo,
        )

        console.log(models);
        
        const bot = {
            role: "model",
            parts: [{ text: models.message ?? "" }]
        };
        const user = pick(messages, ['role', 'parts'])


        await Promise.all([
            this.sessionManagerService.createSession(appId, botId, phone, user),
            this.sessionManagerService.createSession(appId, botId, phone, bot),
            this.metaService.sendMessages(models.message, phone)
        ]);

        return {
            ...models,
            routeInfo // Incluir info de routing para debugging
        };

    }
}