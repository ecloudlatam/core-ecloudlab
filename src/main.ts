import { NestFactory } from '@nestjs/core';
import { MainModule } from './main.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(MainModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted:true,
      transform:true
    })
  )
  await app.listen(3000);
}
bootstrap();
