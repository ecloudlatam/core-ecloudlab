import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { SessionManagerService } from './session-redis.service';
import { pick, get } from 'lodash';
import { MessageService } from 'src/messages/infrastructure/messages.service';
import { MetaService } from '../meta/meta.service';
import { UsersService } from 'src/users/infrastructure/users.service';
import { AgentService } from 'src/agents/infrastructure/agent.service';

@Injectable()
export class WhatsAppService {
  constructor(
    private readonly sessionManagerService: SessionManagerService,
    private readonly geminiService: GeminiService,
    private readonly messageService: MessageService,
    private readonly metaService: MetaService,
    private readonly useService: UsersService,
    private readonly agentService: AgentService,
  ) {}

  private readonly logger = new Logger(WhatsAppService.name);

  webhook(query: any) {
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    const myVerifyToken =
      process.env.WHATSAPP_VERIFY_TOKEN || 'MI_TOKEN_SECRETO_TIGRESA';

    if (mode === 'subscribe' && token === myVerifyToken) {
      this.logger.log('¡Webhook de WhatsApp verificado con éxito nativamente!');
      return challenge;
    }

    throw new ForbiddenException('Token de verificación inválido');
  }

  async events(appId: string, botId: number, userId: number, body: any) {
    const value = body?.entry?.[0]?.changes?.[0]?.value;

    if (!value) {
      return;
    }

    let payload: Record<string, any> = {
      bot_id: botId,
      reference_id: userId,
      status: 'api',
      response: value,
    };

    if (value.statuses && value.statuses.length > 0) {
      // Desestructuramos el primer elemento directamente
      const [firstStatus] = value.statuses;

      const unixSeconds = parseInt(firstStatus.timestamp, 10);
      const dateObject = new Date(unixSeconds * 1000);

      payload = {
        ...payload,
        wam_id: firstStatus.id,
        status: firstStatus.status,
        timestamp: dateObject.toISOString(),
      };
    }

    await this.messageService.create(payload, appId);
  }

  async menuprincipal(appId: string, botId: number, userId: number, body: any) {
    try {
      const message = await this.formatedText(body);

      console.log('message ===', message);

      if (!message) return message;

      const history = await this.sessionManagerService.getSession(
        appId,
        botId,
        userId,
      );

      if (message.type == 'interactive') {
        // Cuando el usuario selecciona del menú, limpiar el intent anterior
        await this.sessionManagerService.clearLastIntent(appId, botId, userId);
        return await this.main(message, appId, userId, botId, history);
      }

      if (history.length <= 0) {
        return await this.metaService.menu(userId);
      }

      return await this.main(message, appId, userId, botId, history);
    } catch (error) {
      // this.logger.error(`Error en agentShop: ${error.message}`)
    }
  }

  async formatedText(payload: any) {
    const { messages } = payload.entry[0].changes[0].value;

    if (!messages) return null;
    const { id, type } = messages[0];
    this.metaService.typingIndicator(id);
    const parts = await this.typeMessage(type, messages);
    return { type, parts, role: 'user' };
  }

  async typeMessage(key: string, message: any) {
    console.log('typeMessage ==', message);
    switch (key) {
      case 'audio':
        return this.downloadWhatsAppAudio(message);
      case 'document':
        return this.metaService.transcribeDocuments(message);
      case 'text':
        const { text } = message[0];
        return [{ text: text.body }];

      case 'interactive':
        return this.interactive(message);

      case 'image':
        return this.metaService.apiGetImg(message);
      default:
        break;
    }
  }

  async transcribeAudioBuffer(audioBuffer: Buffer): Promise<string | null> {
    try {
      const formData = new FormData();

      const audioBlob = new Blob([new Uint8Array(audioBuffer)], {
        type: 'audio/mp3',
      });
      formData.append('model_id', 'scribe_v2');

      formData.append('file', audioBlob, 'audio_cliente.mp3');

      // 4. Realizamos la petición POST
      const response = await fetch(
        'https://api.elevenlabs.io/v1/speech-to-text',
        {
          method: 'POST',
          headers: {
            'xi-api-key': process.env.ELEVENLABS_API_KEY,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        this.logger.error(
          `Error en ElevenLabs STT: ${JSON.stringify(errorData)}`,
        );
        return null;
      }

      const data = await response.json();
      return data.text;
    } catch (error) {
      this.logger.error(`Error procesando el buffer en ElevenLabs: ${error}`);
      return null;
    }
  }

  private async downloadWhatsAppAudio(message: any) {
    const data = message[0];
    const buffer = await this.metaService.apiGetAudio(data.audio.id);
    const transcribeAudio = await this.transcribeAudioBuffer(buffer);
    return [{ text: transcribeAudio }];
  }

  private interactive(body: any) {
    const text = get(body[0], 'interactive.list_reply.title', 'hola');
    return [{ text }];
  }

  private async main(
    messages: any,
    appId: string,
    userId: number,
    botId: number,
    history: any,
  ) {
    try {
      const { success = false } = await this.useService.findOne(userId);
      const routerPrincipal = success ? 'router_vendedor' : 'router_client';
      const agentPrincipal = await this.agentService.findOne(routerPrincipal);

      console.log('agentPrincipal ====', agentPrincipal);

      // const config =
      // agentPrincipal.pivot_agents_tools(({ tools }) => tools.name) || [];

      // 🚀 OPTIMIZACIÓN: Recuperar el último intent de Redis
      const cachedIntent = await this.sessionManagerService.getLastIntent(
        appId,
        botId,
        userId,
      );

      console.log('cachedIntent ====', cachedIntent);

      let routeInfo;
      let intent;

      if (cachedIntent) {
        intent = cachedIntent;
        routeInfo = { intent, confidence: 1.0, extractedData: {} };
      } else {
        // 🔀 Primera interacción: ejecutar router para clasificar
        routeInfo = await this.geminiService.agentRouter(
          history,
          messages.parts,
          userId,
          agentPrincipal,
        );
        intent = routeInfo.intent;

        // Guardar el intent en Redis para próximas interacciones
        await this.sessionManagerService.setLastIntent(
          appId,
          botId,
          userId,
          intent,
        );
      }

      if (intent === 'general_chat') intent = routerPrincipal;

      const agentComplements = await this.agentService.findAgentTools(intent);
      const values = agentComplements.data;

      const models = await this.geminiService.agentPrincipal(
        history,
        messages.parts,
        appId,
        userId,
        routeInfo,
        values,
      );

      // 1. Si viene un objeto, extraes la propiedad de texto; si no, usas la variable tal cual
      const text =
        (typeof models.message === 'object'
          ? get(models, 'message', '')
          : models.message) ?? '';

      const bot = {
        role: 'model',
        parts: [{ text: text ?? '' }],
      };
      const user = pick(messages, ['role', 'parts']);

      await Promise.all([
        this.sessionManagerService.createSession(appId, botId, userId, user),
        this.sessionManagerService.createSession(appId, botId, userId, bot),
        this.metaService.sendMessages(models, userId),
      ]);

      return {
        ...models,
        routeInfo, // Incluir info de routing para debugging
      };
    } catch (error) {
      console.log('error ===', error);
    }
  }
}
