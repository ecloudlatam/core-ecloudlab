import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { createClient, RedisClientType } from "redis";


interface ChatMessage {
    botId: number,
    phone: number,
    history: any;
}

@Injectable()
export class SessionManagerService implements OnModuleInit, OnModuleDestroy {

    private redisClient: RedisClientType;
    private readonly logger = new Logger(SessionManagerService.name)

    constructor() {
        this.redisClient = createClient({
            url: process.env.REDIS_URL
        })
    }


    async onModuleInit() {
        await this.redisClient.connect()
    }

    async onModuleDestroy() {
        await this.redisClient.disconnect()
    }

    async getSession(appId: string, botId: number, phone: number) {
        try {
            const key = `session:${appId}:${botId}:${phone}`
            const session = await this.redisClient.lRange(key, 0, -1);
            return session.map((item: any) => JSON.parse(item))
        } catch (error) {
            console.log("error", error)
        }

    }

    async createSession(appId: string, botId: number, phone: number, models: any) {
        try {
            const key = `session:${appId}:${botId}:${phone}`
            const res = await this.redisClient.rPush(key, JSON.stringify(models));
            await this.redisClient.expire(key, 100)
            return res
        } catch (error) {
            throw new Error(error)
        }
    }

}