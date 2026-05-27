import { Module } from "@nestjs/common";
import { ChatsController } from "./infrastructure/chats.controller";
import { WhatsAppService } from "./infrastructure/service/whatsapp.service";
import { ChatService } from './infrastructure/chats.service';
import { GeminiService } from "./infrastructure/service/gemini.service";
import { VercelGatewayService } from "./infrastructure/service/vercel.service";
import { SessionManagerService } from "./infrastructure/service/session-redis.service";
import { AwsModule } from "src/shared/aws.module";


@Module({
    imports:[
        AwsModule,
    ],
    providers:[
        VercelGatewayService,
        SessionManagerService,
        WhatsAppService,
        GeminiService,
        ChatService,
        
    ],
    controllers:[ChatsController],
    exports:[]
})
export class ChatsModule{}