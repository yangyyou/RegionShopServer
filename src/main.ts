import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AccessTokenGuard } from './auth/accessToken.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 启用全局DTO验证
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();
