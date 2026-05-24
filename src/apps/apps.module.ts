import { Module } from '@nestjs/common';
import { AppsController } from './infrastructure/apps.controller';
import { SupabaseLibModule } from '@app/supabase';
import { ConfigModule } from '@nestjs/config';

import {AppRepository} from "./infrastructure/apps.repository"
import { AuthModule } from '@app/auth';
import { AppsService } from './infrastructure/apps.service';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    SupabaseLibModule,
    AuthModule,
  ],
  controllers: [AppsController],
  providers: [
    AppRepository,
    AppsService
    
  ],
})
export class AppsModule {}
