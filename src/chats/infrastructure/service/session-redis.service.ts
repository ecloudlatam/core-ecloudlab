import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { createClient, RedisClientType } from "redis";


@Injectable()
export class SessionManagerService implements OnModuleInit, OnModuleDestroy {

    private redisClient: RedisClientType

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
        const key = `session:${appId}:${botId}:${phone}`

        const res = await this.redisClient.get(key)
        console.log(res);
        return res
    }

    async createSession(appId: string, botId: number, phone: number, newMessage: any) {
        const key = `session:${appId}:${botId}:${phone}`

        const res = await this.redisClient.set(key, JSON.stringify(newMessage), {
            EX: 1800,
        });

        console.log(res);
        return res

    }

}