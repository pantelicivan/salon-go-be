import {
  Inject,
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

// Filters
import { HttpExceptionFilter } from './http-exception.filter';
import { HttpExceptionDTO } from './dtos/res/http-exception.dto';

// Errors
import { UnknownError } from '../../../../common/static/results/application.errors';

@Catch()
export class ServerExceptionFilter implements ExceptionFilter {
  constructor(
    private httpExceptionFilter: HttpExceptionFilter,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Catches any exception thrown by the application and formats it for the response.
   * @param exception - Any type of exception
   * @param host - Provides access to parameters passed to handler.
   */
  async catch(exception: any, host: ArgumentsHost): Promise<void> {
    const httpHost = host.switchToHttp();
    const response = httpHost.getResponse<Response>();

    // Handle HTTP Exception.
    if (exception instanceof HttpException) {
      const httpExceptionData =
        await this.httpExceptionFilter.handleHttpException(exception, httpHost);
      response
        .status(httpExceptionData.statusCode)
        .json(new HttpExceptionDTO(httpExceptionData));
      return;
    }

    // Unknown exception: Probably internal sever error.
    // In this case exception is probably an instance of Error.
    this.logger.error('Unknown server error!', {
      exception_message: exception.message,
      exception_stack: exception.stack,
    });
    const unknownError = UnknownError();
    response.status(500).json(
      new HttpExceptionDTO({
        statusCode: 500,
        errorMessage: unknownError.message,
        errorCode: unknownError.code,
        timestamp: new Date(),
      }),
    );
  }
}
