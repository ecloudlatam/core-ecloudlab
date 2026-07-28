import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

interface ChatMessage {
  botId: number;
  phone: number;
  history: any;
}

@Injectable()
export class SessionManagerService implements OnModuleInit, OnModuleDestroy {
  private redisClient: RedisClientType;
  private readonly logger = new Logger(SessionManagerService.name);

  constructor() {
    this.redisClient = createClient({
      url: process.env.REDIS_URL,
    });
  }

  async onModuleInit() {
    await this.redisClient.connect();
  }

  async onModuleDestroy() {
    await this.redisClient.disconnect();
  }

  async getSession(appId: string, botId: number, phone: number) {
    try {
      const key = `session:${appId}:${botId}:${phone}`;
      const session = await this.redisClient.lRange(key, 0, -1);
      return session.map((item: any) => JSON.parse(item));
    } catch (error) {}
  }

  async createSession(
    appId: string,
    botId: number,
    userId: number,
    models: any,
  ) {
    try {
      const key = `session:${appId}:${botId}:${userId}`;
      const res = await this.redisClient.rPush(key, JSON.stringify(models));
      await this.redisClient.expire(key, 1000);
      return res;
    } catch (error) {
      throw new Error(error);
    }
  }

  // Guardar el último intent usado para evitar re-ejecutar el router
  async setLastIntent(
    appId: string,
    botId: number,
    userId: number,
    intent: string,
  ) {
    try {
      const key = `intent:${appId}:${botId}:${userId}`;
      await this.redisClient.set(key, intent, { EX: 1000 }); // Expira en 1000 segundos
      this.logger.debug(`✅ Intent guardado en Redis: ${intent}`);
    } catch (error) {
      this.logger.error(`Error guardando intent en Redis: ${error.message}`);
    }
  }

  // Obtener el último intent usado
  async getLastIntent(
    appId: string,
    botId: number,
    userId: number,
  ): Promise<string | null> {
    try {
      const key = `intent:${appId}:${botId}:${userId}`;
      const intent = await this.redisClient.get(key);
      if (intent) {
        this.logger.debug(`♻️ Intent recuperado de Redis: ${intent}`);
      }
      return intent;
    } catch (error) {
      this.logger.error(`Error obteniendo intent de Redis: ${error.message}`);
      return null;
    }
  }

  // Limpiar el intent cuando se requiera (ej: cambio de contexto explícito)
  async clearLastIntent(appId: string, botId: number, userId: number) {
    try {
      const key = `intent:${appId}:${botId}:${userId}`;
      await this.redisClient.del(key);
      this.logger.debug(`🗑️ Intent limpiado de Redis`);
    } catch (error) {
      this.logger.error(`Error limpiando intent de Redis: ${error.message}`);
    }
  }
}
