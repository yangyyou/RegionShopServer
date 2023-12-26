import { ModuleMetadata } from '@nestjs/common';
import { LoggerOptions } from 'winston';

export const LOGGER_OPTIONS_TOKEN = 'LOGGER_OPTIONS_TOKEN';
export const LOGGER_CONTEXT_TOKEN = 'LOGGER_CONTEXT_TOKEN';
export const LOGGER_TOKEN = 'WINSTON_LOGGER_TOKEN';

export type WinstonLogLevel = 'info' | 'error' | 'warn' | 'debug' | 'verbose';

export interface LoggerModuleOptions extends LoggerOptions {
  /**
   * 日志文件输出等级
   */
  level?: WinstonLogLevel | 'none';

  /**
   * 控制台输出等级
   */
  consoleLevel?: WinstonLogLevel | 'none';

  /**
   * 生产环境下关闭终端日志输出
   */
  disableConsoleAtProd?: boolean;

  /**
   * max file size, eg: 2m, 2k ,2g
   */
  maxFileSize?: string;

  /**
   * app log file name, eg: web.log
   */
  appLogName?: string;

  /**
   * error log file name, eg: error.log
   */
  errorLogName?: string;

  /**
   * 最大的日志文件数量, '15'保存15个文件， '15d'保存15天文件
   */
  maxFile?: string;

  /**
   * 开发环境下，日志输出路径，绝对路径
   */
  dir?: string;

}

export interface LoggerModuleAsyncOptions
  extends Pick<ModuleMetadata, 'exports' | 'providers'> {
  useFactory?: (...args: any[]) => LoggerModuleOptions;
  inject?: any[];
}
