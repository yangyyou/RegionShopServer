import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AccessTokenGuard } from './auth/accessToken.guard';
import { ResponseInterceptor } from './common/response/response.interceptor';
import { HttpExceptionFilter } from './common/http_excetion_filter/http_exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 启用全局的应答中间件
  app.useGlobalInterceptors(new ResponseInterceptor());

  // 使用全局的异常捕捉
  app.useGlobalFilters(new HttpExceptionFilter());

  // 启用全局DTO验证
  app.useGlobalPipes(new ValidationPipe());

  // 启用关闭hook清理缓存
  app.enableShutdownHooks();

  await app.listen(3000);
}
bootstrap();
