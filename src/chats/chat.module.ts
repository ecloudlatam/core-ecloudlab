import { Module } from '@nestjs/common';
import { ChatsController } from './infrastructure/chats.controller';
import { WhatsAppService } from './infrastructure/service/whatsapp.service';
import { GeminiService } from './infrastructure/service/gemini.service';
import { VercelGatewayService } from './infrastructure/service/vercel.service';
import { SessionManagerService } from './infrastructure/service/session-redis.service';
import { AwsModule } from 'src/shared/aws.module';
import { DoubtService } from 'src/doubt/infraestructure/doubt.service';
import { DoubtModule } from 'src/doubt/doubt.module';
import { FunctionService } from '../agents/tools/functions.service';
import { AgentModule } from 'src/agents/agent.module';
import { MessageModule } from 'src/messages/messages.module';
import { MetaService } from './infrastructure/meta/meta.service';
import { ProductsModules } from 'src/products/products.module';
import { UserModule } from 'src/users/user.module';
import { UsersService } from 'src/users/infrastructure/users.service';
import { CreditModule } from 'src/credits/credit.module';
import { CreditService } from 'src/credits/credit.service';
import { OrderService } from 'src/orders/orders.service';
import { OrderModule } from 'src/orders/orders.module';

@Module({
  imports: [
    AwsModule,
    DoubtModule,
    CreditModule,
    ProductsModules,
    AgentModule,
    MessageModule,
    UserModule,
    OrderModule,
  ],
  providers: [
    VercelGatewayService,
    SessionManagerService,
    WhatsAppService,
    GeminiService,
    CreditService,
    DoubtService,
    FunctionService,
    MetaService,
    UsersService,
    OrderService,
  ],
  controllers: [ChatsController],
  exports: [],
})
export class ChatsModule {}
