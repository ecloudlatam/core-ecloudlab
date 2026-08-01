import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { AppsModule } from './apps/apps.module';
import { UserModule } from './users/user.module';
import { ProductsModules } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { ChatsModule } from './chats/chat.module';
import { DoubtModule } from './doubt/doubt.module';
import { ClientsModule } from './clients/clients.module';
import { AgentModule } from './agents/agent.module';
import { MessageModule } from './messages/messages.module';
import { HealthController } from './health/health.controller';
import { OrderModule } from './orders/orders.module';

@Module({
  controllers: [HealthController],
  imports: [
    AppsModule,
    UserModule,
    ChatsModule,
    ClientsModule,
    ProductsModules,
    CategoriesModule,
    AgentModule,
    DoubtModule,
    MessageModule,
    OrderModule,
    RouterModule.register([
      {
        path: 'apps',
        module: AppsModule,
      },
      {
        path: 'users',
        module: UserModule,
      },
      {
        path: 'chats',
        module: ChatsModule,
      },
      {
        path: 'doubts',
        module: DoubtModule,
      },
      {
        path: 'products',
        module: ProductsModules,
      },
      {
        path: 'categories',
        module: CategoriesModule,
      },
      {
        path: 'agents',
        module: AgentModule,
      },
      {
        path: 'clients',
        module: ClientsModule,
      },
      {
        path: 'messages',
        module: MessageModule,
      },
      {
        path: 'orders',
        module: OrderModule,
      },
    ]),
  ],
})
export class MainModule {}
