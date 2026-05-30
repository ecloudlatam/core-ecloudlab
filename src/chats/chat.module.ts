import { Module } from "@nestjs/common";
import { ChatsController } from "./infrastructure/chats.controller";
import { WhatsAppService } from "./infrastructure/service/whatsapp.service";
import { ChatService } from './infrastructure/chats.service';
import { GeminiService } from "./infrastructure/service/gemini.service";
import { VercelGatewayService } from "./infrastructure/service/vercel.service";
import { SessionManagerService } from "./infrastructure/service/session-redis.service";
import { AwsModule } from "src/shared/aws.module";
import { ToolService } from "./infrastructure/tools/parameters.service";
import { DoubtService } from "src/doubt/infraestructure/doubt.service";
import { DoubtRepository } from "src/doubt/infraestructure/doubt.repository";
import { DoubtModule } from "src/doubt/doubt.module";
import { FunctionService } from "./infrastructure/tools/functions.service";


@Module({
    imports:[
        AwsModule,
        DoubtModule
    ],
    providers:[
        VercelGatewayService,
        SessionManagerService,
        WhatsAppService,
        GeminiService,
        DoubtService,
        ChatService,
        FunctionService,
        ToolService
        
    ],
    controllers:[ChatsController],
    exports:[]
})
export class ChatsModule{}