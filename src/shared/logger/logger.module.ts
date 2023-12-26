import { Module, DynamicModule } from '@nestjs/common';
import { LoggerService } from './logger.service';
import {
  LOGGER_OPTIONS_TOKEN,
  LOGGER_TOKEN,
  LoggerModuleAsyncOptions,
} from './logger.interface';
import { ConfigModule } from '@nestjs/config';

@Module({})
export class LoggerModule {
  static registerAsync(
    opt: LoggerModuleAsyncOptions,
    isGlobal = false,
  ): DynamicModule {
    return {
      module: LoggerModule,
      global: isGlobal,
      imports: [ConfigModule],
      providers: [
        {
          provide: LOGGER_TOKEN,
          useClass: LoggerService,
        },
        {
          provide: LOGGER_OPTIONS_TOKEN,
          useFactory: opt.useFactory,
          inject: opt.inject,
        },
      ],
      exports: [LOGGER_TOKEN],
    };
  }
}
