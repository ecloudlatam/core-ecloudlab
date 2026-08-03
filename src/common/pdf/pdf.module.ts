import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { AwsModule } from 'src/shared/aws.module';

@Module({
  exports: [PdfService],
  providers: [PdfService],
  imports: [AwsModule],
})
export class PdfModule {}
