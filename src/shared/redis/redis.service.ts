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

  getRedisClient(name = REDIS_DEFAULT_CLIENT_NAME): Redis {
    const client = this.clients.get(name);
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

  async set(
    redis: Redis,
    key: string,
    value: number | string | boolean | object,
    expire?: number | string,
  ): Promise<boolean> {
    let result: string;
    if (typeof value === 'object') {
      result = await redis.set(key, Buffer.from(JSON.stringify(value)));
    } else if (typeof value === 'boolean') {
      result = await redis.set(key, String(value));
    } else {
      result = await redis.set(key, value);
    }

    if (expire) {
      let seconds: number;
      if (typeof expire === 'string') {
        const matchArray = expire.match(/(\d+)([mhd])/);
        if (!matchArray) {
          throw new Error('Invalid ttl format.');
        }
        const [, num, unit] = matchArray;
        const multiplier: Record<string, number> = {
          m: 60,
          h: 60 * 60,
          d: 24 * 60 * 60,
        };
        seconds = Math.floor(parseInt(num) * multiplier[unit]);
      } else {
        seconds = expire;
      }
      await redis.expire(key, seconds);
    }

    return result === 'OK';
  }
}
