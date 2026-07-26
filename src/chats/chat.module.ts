import { Module } from '@nestjs/common';
import { ChatsController } from './infrastructure/chats.controller';
import { WhatsAppService } from './infrastructure/service/whatsapp.service';
import { GeminiService } from './infrastructure/service/gemini.service';
import { VercelGatewayService } from './infrastructure/service/vercel.service';
import { SessionManagerService } from './infrastructure/service/session-redis.service';
import { AwsModule } from 'src/shared/aws.module';
import { ToolService } from '../agents/tools/parameters.service';
import { DoubtService } from 'src/doubt/infraestructure/doubt.service';
import { DoubtModule } from 'src/doubt/doubt.module';
import { FunctionService } from '../agents/tools/functions.service';
import { AgentModule } from 'src/agents/agent.module';
import { MessageModule } from 'src/messages/messages.module';
import { MetaService } from './infrastructure/meta/meta.service';
import { ProductsService } from 'src/products/infrastructure/products.service';
import { ProductsModules } from 'src/products/products.module';
import { UserModule } from 'src/users/user.module';
import { UsersService } from 'src/users/infrastructure/users.service';

@Module({
  imports: [
    AwsModule,
    DoubtModule,
    ProductsModules,
    AgentModule,
    MessageModule,
    UserModule,
  ],
  providers: [
    VercelGatewayService,
    SessionManagerService,
    WhatsAppService,
    GeminiService,
    DoubtService,
    FunctionService,
    MetaService,
    ToolService,
    UsersService,
  ],
  controllers: [ChatsController],
  exports: [],
})
export class ChatsModule {}
