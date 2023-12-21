import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseDto } from '../response.class';

@Catch()
export class HttpExceptionFilter<T> implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const status = exception.getStatus();

    res.status(status).json(
      new ResponseDto(
        status,
        {
          url: req.url,
          method: req.method,
          error: exception.getResponse()['error'],
        },
        exception.getResponse()['message'],
      ),
    );
  }
}
