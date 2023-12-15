import { Module } from '@nestjs/common';
import { RedisModule } from './redis/redis.module';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis/redis.service';
import { RedisModuleOptions } from './redis/redis.interface';

const providers = [RedisService];

@Module({
  imports: [
    RedisModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return config.get<RedisModuleOptions[]>('redis');
      },
    }),
  ],
  providers: providers,
  exports: providers,
})
export class SharedModule {}
