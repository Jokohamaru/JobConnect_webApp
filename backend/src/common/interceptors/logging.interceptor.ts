import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

/**
 * Logging Interceptor for audit trail
 * Requirements: 24.1-24.6
 * 
 * Logs:
 * - Authentication events (login success/failure, token generation)
 * - Resource operations (create, update, delete)
 * - Authorization failures
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AuditLog');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, body, user, ip } = request;
    const timestamp = new Date().toISOString();

    // Extract user information if available
    const userId = user?.userId || 'anonymous';
    const userRole = user?.role || 'none';

    // Log the incoming request
    this.logger.log(
      `[${timestamp}] ${method} ${url} - User: ${userId} (${userRole}) - IP: ${ip}`,
    );

    return next.handle().pipe(
      tap((data) => {
        // Log successful operations
        this.logSuccessfulOperation(
          method,
          url,
          userId,
          userRole,
          ip,
          timestamp,
          body,
          data,
          response.statusCode,
        );
      }),
      catchError((error) => {
        // Log failed operations
        this.logFailedOperation(
          method,
          url,
          userId,
          userRole,
          ip,
          timestamp,
          body,
          error,
        );
        return throwError(() => error);
      }),
    );
  }

  /**
   * Log successful operations
   * Requirements: 24.1, 24.2, 24.3
   */
  private logSuccessfulOperation(
    method: string,
    url: string,
    userId: string,
    userRole: string,
    ip: string,
    timestamp: string,
    body: any,
    data: any,
    statusCode: number,
  ): void {
    // Authentication events - Login success
    if (url.includes('/auth/login') && method === 'POST') {
      this.logger.log(
        `[AUTH SUCCESS] [${timestamp}] User login successful - Email: ${body.email} - User ID: ${data?.user?.id || 'N/A'} - IP: ${ip}`,
      );
    }

    // Authentication events - Registration
    if (url.includes('/auth/register') && method === 'POST') {
      this.logger.log(
        `[AUTH SUCCESS] [${timestamp}] User registration successful - Email: ${body.email} - User ID: ${data?.id || 'N/A'} - Role: ${body.role} - IP: ${ip}`,
      );
    }

    // Authentication events - Token refresh
    if (url.includes('/auth/refresh') && method === 'POST') {
      this.logger.log(
        `[AUTH SUCCESS] [${timestamp}] Token refresh successful - User ID: ${userId} - IP: ${ip}`,
      );
    }

    // Resource creation events
    if (method === 'POST' && statusCode === 201) {
      const resourceId = data?.id || 'N/A';
      this.logger.log(
        `[RESOURCE CREATE] [${timestamp}] Resource created - Endpoint: ${url} - User ID: ${userId} - Role: ${userRole} - Resource ID: ${resourceId}`,
      );
    }

    // Resource update events
    if ((method === 'PATCH' || method === 'PUT') && statusCode === 200) {
      const resourceId = this.extractResourceId(url);
      const changedFields = this.extractChangedFields(body);
      this.logger.log(
        `[RESOURCE UPDATE] [${timestamp}] Resource updated - Endpoint: ${url} - User ID: ${userId} - Role: ${userRole} - Resource ID: ${resourceId} - Changed fields: ${changedFields}`,
      );
    }

    // Resource deletion events
    if (method === 'DELETE' && (statusCode === 200 || statusCode === 204)) {
      const resourceId = this.extractResourceId(url);
      this.logger.log(
        `[RESOURCE DELETE] [${timestamp}] Resource deleted - Endpoint: ${url} - User ID: ${userId} - Role: ${userRole} - Resource ID: ${resourceId}`,
      );
    }
  }

  /**
   * Log failed operations
   * Requirements: 24.5, 24.6
   */
  private logFailedOperation(
    method: string,
    url: string,
    userId: string,
    userRole: string,
    ip: string,
    timestamp: string,
    body: any,
    error: any,
  ): void {
    const statusCode = error?.status || 500;
    const errorMessage = error?.message || 'Unknown error';

    // Authentication failures
    if (url.includes('/auth/login') && statusCode === 401) {
      this.logger.warn(
        `[AUTH FAILURE] [${timestamp}] Login failed - Email: ${body.email} - IP: ${ip} - Reason: ${errorMessage}`,
      );
    }

    // Authorization failures (403 Forbidden)
    if (statusCode === 403) {
      this.logger.warn(
        `[AUTHORIZATION FAILURE] [${timestamp}] Access denied - Endpoint: ${url} - User ID: ${userId} - Role: ${userRole} - Reason: ${errorMessage}`,
      );
    }

    // Token validation failures (401 Unauthorized)
    if (statusCode === 401 && !url.includes('/auth/login')) {
      this.logger.warn(
        `[AUTH FAILURE] [${timestamp}] Token validation failed - Endpoint: ${url} - User ID: ${userId} - IP: ${ip} - Reason: ${errorMessage}`,
      );
    }

    // General error logging
    if (statusCode >= 400) {
      this.logger.error(
        `[ERROR] [${timestamp}] ${method} ${url} - User ID: ${userId} - Status: ${statusCode} - Error: ${errorMessage}`,
      );
    }
  }

  /**
   * Extract resource ID from URL
   */
  private extractResourceId(url: string): string {
    // Extract ID from URL patterns like /resource/:id or /resource/:id/action
    const segments = url.split('/').filter((s) => s);
    // Look for UUID-like or alphanumeric IDs (not common words like 'status', 'me', etc.)
    for (let i = segments.length - 1; i >= 0; i--) {
      const segment = segments[i];
      if (
        segment.length > 10 &&
        !['status', 'default', 'me', 'cvs', 'skills'].includes(segment)
      ) {
        return segment;
      }
    }
    return 'N/A';
  }

  /**
   * Extract changed fields from request body
   */
  private extractChangedFields(body: any): string {
    if (!body || typeof body !== 'object') {
      return 'N/A';
    }

    const fields = Object.keys(body).filter(
      (key) => !['password', 'password_hash', 'refresh_token'].includes(key),
    );

    return fields.length > 0 ? fields.join(', ') : 'N/A';
  }
}
