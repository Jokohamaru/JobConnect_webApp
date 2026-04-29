import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global exception filter that catches all exceptions and transforms them
 * into consistent HTTP responses with proper error formatting.
 * 
 * Handles:
 * - HttpException: NestJS HTTP exceptions with status codes
 * - ValidationException: Class-validator validation errors
 * - Generic errors: Unexpected errors with 500 status
 * 
 * Requirements: 18.1-18.6, 25.4
 */
@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(CustomExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    // Handle HttpException (includes ValidationException)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Extract message from exception response
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      // Handle generic Error instances
      message = exception.message;
      
      // Log full stack trace for unexpected errors (Requirement 18.6)
      this.logger.error(
        `Unexpected error: ${exception.message}`,
        exception.stack,
      );
    } else {
      // Handle unknown error types
      this.logger.error('Unknown error type', JSON.stringify(exception));
    }

    // Return consistent error response format (Requirement 25.4)
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    };

    response.status(status).json(errorResponse);
  }
}
