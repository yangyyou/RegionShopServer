import { LoggerModuleOptions } from '../shared/logger/logger.interface';
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
  logger: {
    level: 'warn',
    consoleLevel: 'debug',
    disableConsoleAtProd: false,
    appLogName: 'app',
    errorLogName: 'err',
    maxFile: '14d',
    maxFileSize: '10m',
  } as LoggerModuleOptions,
});

export default configuration;
