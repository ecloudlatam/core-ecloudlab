import { Module } from "@nestjs/common";
import { ChatsController } from "./infrastructure/chats.controller";
import { WhatsAppService } from "./infrastructure/service/whatsapp.service";
import { AwsService } from "src/shared/aws-ssm.service";
import { GeminiService } from "./infrastructure/service/gemini.service";
import { VercelGatewayService } from "./infrastructure/service/vercel.service";
import { SessionManagerService } from "./infrastructure/service/session-redis.service";

@Module({
    imports:[],
    providers:[
        VercelGatewayService,
        SessionManagerService,
        WhatsAppService,
        GeminiService,
        AwsService
    ],
    controllers:[ChatsController],
    exports:[]
})
export class ChatsModule{}