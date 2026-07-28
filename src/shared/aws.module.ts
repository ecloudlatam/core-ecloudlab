import { Module } from '@nestjs/common';
import { SupabaseLibModule } from '@app/supabase';
import { AwsService } from './aws.service';

@Module({
  imports: [SupabaseLibModule],
  providers: [AwsService],
  exports: [AwsService],
})
export class AwsModule {}
