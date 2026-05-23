import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SupabaseLibModule } from '@app/supabase';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [SupabaseLibModule, PassportModule.register({defaultStrategy:"api-key"})],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
