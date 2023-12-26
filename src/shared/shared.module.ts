import { Global, Module } from '@nestjs/common';
import { RedisModule } from './redis/redis.module';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis/redis.service';
import { RedisModuleOptions } from './redis/redis.interface';
import { LoggerModule } from './logger/logger.module';
import { LoggerModuleOptions } from './logger/logger.interface';

const providers = [RedisService];
@Global()
@Module({
  imports: [
    RedisModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return config.get<RedisModuleOptions[]>('redis');
      },
    }),
    LoggerModule.registerAsync(
      {
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          return config.get<LoggerModuleOptions>('logger');
        },
      },
      true,
    ),
  ],
  providers: providers,
  exports: providers,
})
export class SharedModule {}
