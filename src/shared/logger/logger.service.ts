import {
  Inject,
  Injectable,
  LoggerService as NestLoggerServer,
  Optional,
} from '@nestjs/common';
import {
  LOGGER_CONTEXT_TOKEN,
  LOGGER_OPTIONS_TOKEN,
  LoggerModuleAsyncOptions,
  LoggerModuleOptions,
  WinstonLogLevel,
} from './logger.interface';
import {
  createLogger,
  Logger as WinstonLogger,
  format,
  transports,
} from 'winston';
import * as WinstonDailyRotateFile from 'winston-daily-rotate-file';
import * as chalk from 'chalk';

const LOG_LEVEL_VALUES: Record<WinstonLogLevel, number> = {
  debug: 4,
  verbose: 3,
  info: 2,
  warn: 1,
  error: 0,
};

export const LOG_CONSOLE_PREFIX = '[NEST]';

export const DEFAULT_LOG_CONTEXT = 'app';

export const DEFAULT_LOG_LEVEL = 'info';
export const DEFAULT_LOG_CONSOLE_LEVEL = 'error';
export const DEFAULT_LOG_MAX_FILE_SIZE = '20m';
export const DEFAULT_LOG_MAX_FILE_NUM = '2m';
export const DEFAULT_LOG_APP_NAME = 'web';
export const DEFAULT_LOG_ERROR_NAME = 'err';

export const DEFAULT_LOG_DIR_NAME = 'logs';

@Injectable()
export class LoggerService implements NestLoggerServer {
  /**
   * 日志文件夹位置
   */
  private logDir: string;

  /**
   * winston实例
   */
  private winstonLogger: WinstonLogger;

  constructor(context: string, options: LoggerModuleOptions);
  constructor(
    @Optional()
    @Inject(LOGGER_CONTEXT_TOKEN)
    private context: string,
    @Optional()
    @Inject(LOGGER_OPTIONS_TOKEN)
    private readonly options: LoggerModuleOptions,
  ) {
    !this.context && (this.context = DEFAULT_LOG_CONTEXT);
    !this.options.level && (this.options.level = DEFAULT_LOG_LEVEL);
    !this.options.consoleLevel &&
      (this.options.consoleLevel = DEFAULT_LOG_CONSOLE_LEVEL);
    !this.options.maxFileSize &&
      (this.options.maxFileSize = DEFAULT_LOG_MAX_FILE_SIZE);
    !this.options.maxFile && (this.options.maxFile = DEFAULT_LOG_MAX_FILE_NUM);
    !this.options.appLogName &&
      (this.options.appLogName = DEFAULT_LOG_APP_NAME);
    !this.options.errorLogName &&
      (this.options.errorLogName = DEFAULT_LOG_ERROR_NAME);
    console.log('日志文件配置');
    console.log(this.options);
    this.initWinston();
  }

  private initWinston() {
    if (this.options.dir) {
      this.logDir = this.options.dir;
    } else {
      this.logDir = process.cwd() + '/' + DEFAULT_LOG_DIR_NAME;
    }
    const transportOptions: WinstonDailyRotateFile.DailyRotateFileTransportOptions =
      {
        format: format.combine(
          format.timestamp({ format: 'YYYY/MM/DD hh:mm:ss' }),
          format.json(),
        ),
        datePattern: 'YYYY--MM-DD',
        dirname: this.logDir,
        maxSize: this.options.maxFileSize,
        maxFiles: this.options.maxFile,
        filename: this.options.appLogName,
      };

    // 定义日志文件记录设置
    const webTransport = new WinstonDailyRotateFile(transportOptions);
    transportOptions.filename = this.options.errorLogName;
    transportOptions.level = 'error';
    const errTransport = new WinstonDailyRotateFile(transportOptions);

    const consoleTransport = new transports.Console({
      level: this.options.consoleLevel,
      format: format.combine(
        format.colorize({
          colors: {
            debug: 'cyan',
            info: 'green',
            warn: 'yellow',
            error: 'red',
            verbose: 'magenta',
          },
        }),
        format.timestamp({ format: 'YYYY/MM/DD hh:mm:ss' }),
        format.printf((info) => {
          const { context, message, level, timestamp } = info;
          const contextStr = chalk.yellow('[' + context + ']');
          const pid = process.pid.toString();
          const appStr = chalk.green(LOG_CONSOLE_PREFIX + ' ' + pid);
          return `${appStr} - ${timestamp} ${level} ${contextStr} ${message}`;
        }),
      ),
    });

    // 初始化winston
    this.winstonLogger = createLogger({
      level: this.options.level,
      format: format.json({
        space: 0,
      }),
      levels: LOG_LEVEL_VALUES,
      transports: [webTransport, errTransport, consoleTransport],
    });
  }

  log(message: any, context?: string): void;
  log(message: any, ...optionalParams: any[]) {
    const { messages, context } = this.getMessageAndContext(...optionalParams);
    JSON.stringify(optionalParams);
    const messageStr = chalk.green(message);
    this.winstonLogger.log('info', messageStr, {
      context,
    });
  }

  error(message: any, context?: string): void;
  error(message: any, ...optionalParams: any[]) {
    const { messages, context } = this.getMessageAndContext(...optionalParams);
    this.winstonLogger.log('error', message, { context });
  }

  warn(message: any, context?: string): void;
  warn(message: any, ...optionalParams: any[]) {
    const { messages, context } = this.getMessageAndContext(...optionalParams);
    this.winstonLogger.log('warn', message, { context });
  }

  debug(message: any, context?: string): void;
  debug(message: any, ...optionalParams: any[]) {
    const { messages, context } = this.getMessageAndContext(...optionalParams);
    this.winstonLogger.log('debug', message, { context });
  }

  verbose(message: any, context?: string): void;
  verbose(message: any, ...optionalParams: any[]) {
    const { messages, context } = this.getMessageAndContext(...optionalParams);
    this.winstonLogger.log('verbose', message, { context });
  }

  private getMessageAndContext(...args: any[]): {
    messages: any;
    context?: string;
  } {
    if (args?.length == 0) {
      return { messages: args, context: this.context };
    }
    const lastElement = args[args.length - 1];
    if (typeof lastElement === 'string') {
      return {
        messages: args.splice(0, args.length - 1),
        context: lastElement,
      };
    }
    return {
      context: this.context,
      messages: args,
    };
  }
}
