import { Test, TestingModule } from '@nestjs/testing';
import { LoggingInterceptor } from './logging.interceptor';
import { ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggingInterceptor],
    }).compile();

    interceptor = module.get<LoggingInterceptor>(LoggingInterceptor);

    // Mock ExecutionContext
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method: 'POST',
          url: '/auth/login',
          body: { email: 'test@example.com', password: 'password123' },
          user: { userId: 'user123', role: 'CANDIDATE' },
          ip: '127.0.0.1',
        }),
        getResponse: jest.fn().mockReturnValue({
          statusCode: 200,
        }),
      }),
    } as any;

    // Mock CallHandler
    mockCallHandler = {
      handle: jest.fn(),
    } as any;

    // Spy on logger methods
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('Authentication Events', () => {
    it('should log successful login', (done) => {
      const mockResponse = {
        user: { id: 'user123', email: 'test@example.com' },
        access_token: 'token',
      };

      mockCallHandler.handle = jest.fn().mockReturnValue(of(mockResponse));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          expect(Logger.prototype.log).toHaveBeenCalledWith(
            expect.stringContaining('[AUTH SUCCESS]'),
          );
          expect(Logger.prototype.log).toHaveBeenCalledWith(
            expect.stringContaining('User login successful'),
          );
          expect(Logger.prototype.log).toHaveBeenCalledWith(
            expect.stringContaining('test@example.com'),
          );
          done();
        },
      });
    });

    it('should log failed login', (done) => {
      const mockError = {
        status: 401,
        message: 'Invalid credentials',
      };

      mockCallHandler.handle = jest
        .fn()
        .mockReturnValue(throwError(() => mockError));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        error: () => {
          expect(Logger.prototype.warn).toHaveBeenCalledWith(
            expect.stringContaining('[AUTH FAILURE]'),
          );
          expect(Logger.prototype.warn).toHaveBeenCalledWith(
            expect.stringContaining('Login failed'),
          );
          done();
        },
      });
    });

    it('should log successful registration', (done) => {
      const mockRequest = {
        method: 'POST',
        url: '/auth/register',
        body: {
          email: 'newuser@example.com',
          password: 'password123',
          role: 'CANDIDATE',
        },
        user: null,
        ip: '127.0.0.1',
      };

      mockExecutionContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn().mockReturnValue({ statusCode: 201 }),
      });

      const mockResponse = {
        id: 'user456',
        email: 'newuser@example.com',
      };

      mockCallHandler.handle = jest.fn().mockReturnValue(of(mockResponse));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          expect(Logger.prototype.log).toHaveBeenCalledWith(
            expect.stringContaining('[AUTH SUCCESS]'),
          );
          expect(Logger.prototype.log).toHaveBeenCalledWith(
            expect.stringContaining('User registration successful'),
          );
          done();
        },
      });
    });

    it('should log token refresh', (done) => {
      const mockRequest = {
        method: 'POST',
        url: '/auth/refresh',
        body: { refresh_token: 'refresh_token_value' },
        user: { userId: 'user123', role: 'CANDIDATE' },
        ip: '127.0.0.1',
      };

      mockExecutionContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn().mockReturnValue({ statusCode: 200 }),
      });

      const mockResponse = { access_token: 'new_token' };

      mockCallHandler.handle = jest.fn().mockReturnValue(of(mockResponse));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          expect(Logger.prototype.log).toHaveBeenCalledWith(
            expect.stringContaining('[AUTH SUCCESS]'),
          );
          expect(Logger.prototype.log).toHaveBeenCalledWith(
            expect.stringContaining('Token refresh successful'),
          );
          done();
        },
      });
    });
  });

  describe('Resource Operations', () => {
    it('should log resource creation', (done) => {
      const mockRequest = {
        method: 'POST',
        url: '/applications',
        body: { job_id: 'job123', cv_id: 'cv123' },
        user: { userId: 'user123', role: 'CANDIDATE' },
        ip: '127.0.0.1',
      };

      mockExecutionContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn().mockReturnValue({ statusCode: 201 }),
      });

      const mockResponse = { id: 'app123', status: 'APPLIED' };

      mockCallHandler.handle = jest.fn().mockReturnValue(of(mockResponse));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          expect(Logger.prototype.log).toHaveBeenCalledWith(
            expect.stringContaining('[RESOURCE CREATE]'),
          );
          expect(Logger.prototype.log).toHaveBeenCalledWith(
            expect.stringContaining('Resource created'),
          );
          expect(Logger.prototype.log).toHaveBeenCalledWith(
            expect.stringContaining('app123'),
          );
          done();
        },
      });
    });

    it('should log resource update with changed fields', (done) => {
      const mockRequest = {
        method: 'PATCH',
        url: '/applications/app123/status',
        body: { status: 'REVIEWING' },
        user: { userId: 'recruiter123', role: 'RECRUITER' },
        ip: '127.0.0.1',
      };

      mockExecutionContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn().mockReturnValue({ statusCode: 200 }),
      });

      const mockResponse = { id: 'app123', status: 'REVIEWING' };

      mockCallHandler.handle = jest.fn().mockReturnValue(of(mockResponse));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          expect(Logger.prototype.log).toHaveBeenCalledWith(
            expect.stringContaining('[RESOURCE UPDATE]'),
          );
          expect(Logger.prototype.log).toHaveBeenCalledWith(
            expect.stringContaining('Resource updated'),
          );
          expect(Logger.prototype.log).toHaveBeenCalledWith(
            expect.stringContaining('Changed fields: status'),
          );
          done();
        },
      });
    });

    it('should log resource deletion', (done) => {
      const mockRequest = {
        method: 'DELETE',
        url: '/applications/app123',
        body: {},
        user: { userId: 'user123', role: 'CANDIDATE' },
        ip: '127.0.0.1',
      };

      mockExecutionContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn().mockReturnValue({ statusCode: 200 }),
      });

      const mockResponse = { message: 'Application withdrawn successfully' };

      mockCallHandler.handle = jest.fn().mockReturnValue(of(mockResponse));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          expect(Logger.prototype.log).toHaveBeenCalledWith(
            expect.stringContaining('[RESOURCE DELETE]'),
          );
          expect(Logger.prototype.log).toHaveBeenCalledWith(
            expect.stringContaining('Resource deleted'),
          );
          done();
        },
      });
    });
  });

  describe('Authorization Failures', () => {
    it('should log authorization failure (403)', (done) => {
      const mockRequest = {
        method: 'POST',
        url: '/jobs',
        body: { title: 'New Job' },
        user: { userId: 'user123', role: 'CANDIDATE' },
        ip: '127.0.0.1',
      };

      mockExecutionContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn().mockReturnValue({ statusCode: 403 }),
      });

      const mockError = {
        status: 403,
        message: 'Insufficient permissions',
      };

      mockCallHandler.handle = jest
        .fn()
        .mockReturnValue(throwError(() => mockError));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        error: () => {
          expect(Logger.prototype.warn).toHaveBeenCalledWith(
            expect.stringContaining('[AUTHORIZATION FAILURE]'),
          );
          expect(Logger.prototype.warn).toHaveBeenCalledWith(
            expect.stringContaining('Access denied'),
          );
          expect(Logger.prototype.warn).toHaveBeenCalledWith(
            expect.stringContaining('CANDIDATE'),
          );
          done();
        },
      });
    });

    it('should log token validation failure (401)', (done) => {
      const mockRequest = {
        method: 'GET',
        url: '/applications',
        body: {},
        user: { userId: 'user123', role: 'CANDIDATE' },
        ip: '127.0.0.1',
      };

      mockExecutionContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn().mockReturnValue({ statusCode: 401 }),
      });

      const mockError = {
        status: 401,
        message: 'Token expired',
      };

      mockCallHandler.handle = jest
        .fn()
        .mockReturnValue(throwError(() => mockError));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        error: () => {
          expect(Logger.prototype.warn).toHaveBeenCalledWith(
            expect.stringContaining('[AUTH FAILURE]'),
          );
          expect(Logger.prototype.warn).toHaveBeenCalledWith(
            expect.stringContaining('Token validation failed'),
          );
          done();
        },
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle requests without user context', (done) => {
      const mockRequest = {
        method: 'POST',
        url: '/auth/login',
        body: { email: 'test@example.com' },
        user: null,
        ip: '127.0.0.1',
      };

      mockExecutionContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn().mockReturnValue({ statusCode: 200 }),
      });

      const mockResponse = { user: { id: 'user123' } };

      mockCallHandler.handle = jest.fn().mockReturnValue(of(mockResponse));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          expect(Logger.prototype.log).toHaveBeenCalledWith(
            expect.stringContaining('anonymous'),
          );
          done();
        },
      });
    });

    it('should not log sensitive fields in changed fields', (done) => {
      const mockRequest = {
        method: 'PATCH',
        url: '/users/me',
        body: { password: 'newpassword', email: 'newemail@example.com' },
        user: { userId: 'user123', role: 'CANDIDATE' },
        ip: '127.0.0.1',
      };

      mockExecutionContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn().mockReturnValue({ statusCode: 200 }),
      });

      const mockResponse = { id: 'user123', email: 'newemail@example.com' };

      mockCallHandler.handle = jest.fn().mockReturnValue(of(mockResponse));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          const logCalls = (Logger.prototype.log as jest.Mock).mock.calls;
          const updateLog = logCalls.find((call) =>
            call[0].includes('[RESOURCE UPDATE]'),
          );
          expect(updateLog[0]).toContain('email');
          expect(updateLog[0]).not.toContain('password');
          done();
        },
      });
    });
  });
});
