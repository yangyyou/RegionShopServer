import { RedisModuleOptions } from '../shared/redis/redis.interface';

export const configuration = () => ({
  auth: {
    access_secret: 'access_secret',
    access_expire: '15m',
    refresh_secret: 'refresh_secret',
    refresh_expire: '7d',
  },
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
