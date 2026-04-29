import { CustomExceptionFilter } from './custom-exception.filter';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Unit tests for CustomExceptionFilter
 * Validates Requirements 18.1-18.6 (Error Handling) and 25.4 (Error Response Format)
 */
describe('CustomExceptionFilter', () => {
  let filter: CustomExceptionFilter;
  let mockArgumentsHost: ArgumentsHost;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    filter = new CustomExceptionFilter();

    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });

    mockRequest = {
      url: '/test-endpoint',
    };

    mockResponse = {
      status: mockStatus,
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
      getArgByIndex: jest.fn(),
      getArgs: jest.fn(),
      getType: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    };
  });

  describe('HttpException handling', () => {
    it('should handle HttpException with status and message', () => {
      const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockJson).toHaveBeenCalledWith({
        statusCode: HttpStatus.NOT_FOUND,
        timestamp: expect.any(String),
        path: '/test-endpoint',
        message: 'Not Found',
      });
    });

    it('should handle HttpException with object response', () => {
      const exception = new HttpException(
        { message: 'Validation failed', errors: ['field1', 'field2'] },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: expect.any(String),
        path: '/test-endpoint',
        message: 'Validation failed',
      });
    });

    it('should handle HttpException with array message', () => {
      const exception = new HttpException(
        { message: ['Email is required', 'Password is too short'] },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: expect.any(String),
        path: '/test-endpoint',
        message: ['Email is required', 'Password is too short'],
      });
    });

    it('should handle 400 Bad Request for invalid data', () => {
      const exception = new HttpException(
        'Invalid email format',
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: expect.any(String),
        path: '/test-endpoint',
        message: 'Invalid email format',
      });
    });

    it('should handle 401 Unauthorized for authentication errors', () => {
      const exception = new HttpException(
        'Missing or invalid token',
        HttpStatus.UNAUTHORIZED,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockJson).toHaveBeenCalledWith({
        statusCode: HttpStatus.UNAUTHORIZED,
        timestamp: expect.any(String),
        path: '/test-endpoint',
        message: 'Missing or invalid token',
      });
    });

    it('should handle 403 Forbidden for authorization errors', () => {
      const exception = new HttpException(
        'Insufficient permissions',
        HttpStatus.FORBIDDEN,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(mockJson).toHaveBeenCalledWith({
        statusCode: HttpStatus.FORBIDDEN,
        timestamp: expect.any(String),
        path: '/test-endpoint',
        message: 'Insufficient permissions',
      });
    });

    it('should handle 404 Not Found for missing resources', () => {
      const exception = new HttpException(
        'Resource not found',
        HttpStatus.NOT_FOUND,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockJson).toHaveBeenCalledWith({
        statusCode: HttpStatus.NOT_FOUND,
        timestamp: expect.any(String),
        path: '/test-endpoint',
        message: 'Resource not found',
      });
    });

    it('should handle 409 Conflict for constraint violations', () => {
      const exception = new HttpException(
        'Email already registered',
        HttpStatus.CONFLICT,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockJson).toHaveBeenCalledWith({
        statusCode: HttpStatus.CONFLICT,
        timestamp: expect.any(String),
        path: '/test-endpoint',
        message: 'Email already registered',
      });
    });

    it('should handle 413 Payload Too Large for file size errors', () => {
      const exception = new HttpException(
        'File size exceeds 5MB limit',
        HttpStatus.PAYLOAD_TOO_LARGE,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.PAYLOAD_TOO_LARGE);
      expect(mockJson).toHaveBeenCalledWith({
        statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
        timestamp: expect.any(String),
        path: '/test-endpoint',
        message: 'File size exceeds 5MB limit',
      });
    });
  });

  describe('Generic Error handling', () => {
    it('should handle generic Error instances', () => {
      const exception = new Error('Database connection failed');

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockJson).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: expect.any(String),
        path: '/test-endpoint',
        message: 'Database connection failed',
      });
    });

    it('should handle unknown error types', () => {
      const exception = 'Unknown error string';

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockJson).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: expect.any(String),
        path: '/test-endpoint',
        message: 'Internal server error',
      });
    });

    it('should handle null exceptions', () => {
      const exception = null;

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockJson).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: expect.any(String),
        path: '/test-endpoint',
        message: 'Internal server error',
      });
    });
  });

  describe('Response format consistency', () => {
    it('should always include statusCode, timestamp, path, and message', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost);

      const response = mockJson.mock.calls[0][0];
      expect(response).toHaveProperty('statusCode');
      expect(response).toHaveProperty('timestamp');
      expect(response).toHaveProperty('path');
      expect(response).toHaveProperty('message');
    });

    it('should use ISO 8601 timestamp format', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost);

      const response = mockJson.mock.calls[0][0];
      const timestamp = response.timestamp;

      // Validate ISO 8601 format
      expect(timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
      expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });

    it('should include the request path in the response', () => {
      mockRequest.url = '/api/users/123';
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost);

      const response = mockJson.mock.calls[0][0];
      expect(response.path).toBe('/api/users/123');
    });
  });

  describe('Validation exception handling', () => {
    it('should handle validation errors with multiple messages', () => {
      const exception = new HttpException(
        {
          message: [
            'email must be an email',
            'password must be longer than or equal to 8 characters',
          ],
          error: 'Bad Request',
          statusCode: 400,
        },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: expect.any(String),
        path: '/test-endpoint',
        message: [
          'email must be an email',
          'password must be longer than or equal to 8 characters',
        ],
      });
    });

    it('should handle validation errors with single message', () => {
      const exception = new HttpException(
        {
          message: 'email must be an email',
          error: 'Bad Request',
          statusCode: 400,
        },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: expect.any(String),
        path: '/test-endpoint',
        message: 'email must be an email',
      });
    });
  });
});
