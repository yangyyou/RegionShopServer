import { DynamicModule, Module, Provider } from '@nestjs/common';
import { Cluster, Redis } from 'ioredis';
import {
  RedisClients,
  RedisModuleAsyncOptions,
  RedisModuleOptions,
} from './redis.interface';
import {
  RedisService,
  REDIS_MODULE_OPTION_KEY,
  REDIS_CLIENT_KEY,
  REDIS_DEFAULT_CLIENT_NAME,
} from './redis.service';

@Module({ providers: [RedisService], exports: [RedisService] })
export class RedisModule {
  static registerAsync(opt: RedisModuleAsyncOptions): DynamicModule {
    const clientProvider = this.createAsyncProvider();
    return {
      module: RedisModule,
      providers: [
        clientProvider,
        {
          provide: REDIS_MODULE_OPTION_KEY,
          useFactory: opt.useFactory,
          inject: opt.inject,
        },
      ],
      exports: [clientProvider],
    };
  }

  private static createAsyncProvider(): Provider {
    return {
      provide: REDIS_CLIENT_KEY,
      inject: [REDIS_MODULE_OPTION_KEY],
      useFactory: (
        opt: RedisModuleOptions | RedisModuleOptions[],
      ): Map<string, Redis | Cluster> => {
        const clients: RedisClients = new Map<string, Redis | Cluster>();
        if (Array.isArray(opt)) {
          opt.forEach((option) => {
            const name = option.name ?? REDIS_DEFAULT_CLIENT_NAME;
            const newCli = this.createClient(option);
            clients.set(name, newCli);
          });
        }
        return clients;
      },
    };
  }

  private static createClient(option: RedisModuleOptions): Redis | Cluster {
    const { url, cluster, clusterOpt, node, ...redisOpt } = option;
    let client = null;
    if (url) client = new Redis(url);
    else if (cluster) client = new Cluster(node, clusterOpt);
    else client = new Redis(redisOpt);
    return client;
  }
}
