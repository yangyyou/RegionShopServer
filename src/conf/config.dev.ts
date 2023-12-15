import { RedisModuleOptions } from '../shared/redis/redis.interface';

export const configuration = () => ({
  redis: [
    {
      name: 'default',
      host: 'localhost',
      port: 6379,
      password: 'secret_redis',
      db: 0,
    },
  ] as RedisModuleOptions[],
});

export default configuration;
