import { Inject, Injectable } from '@nestjs/common';
import { RedisClients } from './redis.interface';
import { Cluster, Redis } from 'ioredis';

export const REDIS_MODULE_OPTION_KEY = 'redis_module_opt_key';
export const REDIS_CLIENT_KEY = 'redis_clients_key';
export const REDIS_DEFAULT_CLIENT_NAME = 'default';

@Injectable()
export class RedisService {
  constructor(
    @Inject(REDIS_CLIENT_KEY)
    private readonly clients: RedisClients,
  ) {}

  getRedisClient(name: string): Redis {
    const client = this.clients.get(name);
    console.log(client);
    if (client instanceof Redis) {
      return client;
    }
    return null;
  }

  getClusterClient(name: string): Cluster {
    const client = this.clients.get(name);
    if (client instanceof Cluster) {
      return client;
    }
    return null;
  }
}
