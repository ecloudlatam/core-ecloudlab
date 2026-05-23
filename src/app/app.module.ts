import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseLibModule } from '@app/supabase';
import { ConfigModule } from '@nestjs/config';

import {AppRepository} from "./infrastructure/apps.repository"

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    SupabaseLibModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppRepository,
    { 
      provide: "IAppsRepository", 
      useExisting: AppRepository
    }
  ],
})
export class AppModule {}
