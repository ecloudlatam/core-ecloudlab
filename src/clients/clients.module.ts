import { Module } from '@nestjs/common';
import { ClientController } from './infraestructure/client.controller';
import { ClientService } from './infraestructure/client.service';
import { SupabaseLibModule } from '@app/supabase';
import { ClientRepository } from './infraestructure/client.repository';

@Module({
  imports: [SupabaseLibModule],
  providers: [ClientService, ClientRepository],
  controllers: [ClientController],
})
export class ClientsModule {}
