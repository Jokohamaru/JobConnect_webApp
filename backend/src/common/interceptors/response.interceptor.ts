import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Response Interceptor for API consistency
 * Requirements: 25.1-25.6
 * 
 * Ensures:
 * - All successful responses follow consistent format (25.1, 25.2)
 * - Pagination metadata included for list endpoints (25.5)
 * - Timestamps use ISO 8601 format (25.6)
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((data) => {
        // Handle 204 No Content responses (e.g., DELETE operations)
        // Requirement 25.3: Successful deletes return 204 No Content
        if (response.statusCode === 204 || data === null || data === undefined) {
          return;
        }

        // If data already has pagination metadata, it's a list endpoint
        // Requirement 25.5: Include pagination metadata for list endpoints
        if (data && typeof data === 'object' && 'pagination' in data) {
          return {
            success: true,
            data: this.convertTimestamps(data.data),
            pagination: data.pagination,
            timestamp: new Date().toISOString(),
          };
        }

        // For single resource responses
        // Requirements 25.1, 25.2: Consistent format for successful responses
        return {
          success: true,
          data: this.convertTimestamps(data),
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }

  /**
   * Convert all Date objects to ISO 8601 format strings
   * Requirement 25.6: Use ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ) for timestamps
   */
  private convertTimestamps(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    // Handle Date objects
    if (data instanceof Date) {
      return data.toISOString();
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map((item) => this.convertTimestamps(item));
    }

    // Handle objects
    if (typeof data === 'object') {
      const converted: any = {};
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          converted[key] = this.convertTimestamps(data[key]);
        }
      }
      return converted;
    }

    // Return primitive values as-is
    return data;
  }
}
