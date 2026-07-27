import { Module } from '@nestjs/common';
import { SupabaseLibModule } from '@app/supabase';
import { AuthModule } from '@app/auth';
import { CreditsRepository } from './credit.repository';
import { CreditService } from './credit.service';

@Module({
  providers: [CreditService, CreditsRepository],
  exports: [CreditService, CreditsRepository],
  controllers: [],
  imports: [SupabaseLibModule, AuthModule],
})
export class CreditModule {}
