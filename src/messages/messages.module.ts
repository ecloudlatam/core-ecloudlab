import { Module } from '@nestjs/common';
import { MessagesControllers } from './infrastructure/messages.controller';
import { SupabaseLibModule } from '@app/supabase';
import { MessageService } from './infrastructure/messages.service';
import { MessageRepository } from './infrastructure/messages.repository';
import { AuthModule } from '@app/auth';

@Module({
  providers: [MessageService, MessageRepository],
  controllers: [MessagesControllers],
  imports: [SupabaseLibModule, AuthModule],
  exports: [MessageService],
})
export class MessageModule {}
