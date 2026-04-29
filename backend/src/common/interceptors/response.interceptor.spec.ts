import { ResponseInterceptor } from './response.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;
  let mockResponse: any;
  let mockRequest: any;

  beforeEach(() => {
    interceptor = new ResponseInterceptor();

    mockResponse = {
      statusCode: 200,
    };

    mockRequest = {
      url: '/test',
      method: 'GET',
    };

    mockExecutionContext = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    mockCallHandler = {
      handle: jest.fn(),
    } as CallHandler;
  });

  describe('intercept', () => {
    it('should wrap single resource response with success and timestamp', (done) => {
      const testData = { id: '1', name: 'Test' };
      mockCallHandler.handle = jest.fn(() => of(testData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toHaveProperty('success', true);
          expect(result).toHaveProperty('data', testData);
          expect(result).toHaveProperty('timestamp');
          expect(result.timestamp).toMatch(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
          );
          done();
        },
      });
    });

    it('should preserve pagination metadata for list endpoints', (done) => {
      const testData = {
        data: [{ id: '1' }, { id: '2' }],
        pagination: {
          current_page: 1,
          per_page: 20,
          total_count: 2,
          total_pages: 1,
          has_next_page: false,
          has_previous_page: false,
        },
      };
      mockCallHandler.handle = jest.fn(() => of(testData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toHaveProperty('success', true);
          expect(result).toHaveProperty('data');
          expect(result).toHaveProperty('pagination');
          expect(result.pagination).toEqual(testData.pagination);
          expect(result).toHaveProperty('timestamp');
          done();
        },
      });
    });

    it('should convert Date objects to ISO 8601 format', (done) => {
      const testDate = new Date('2024-01-15T10:30:00.000Z');
      const testData = {
        id: '1',
        created_at: testDate,
        updated_at: testDate,
      };
      mockCallHandler.handle = jest.fn(() => of(testData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result.data.created_at).toBe('2024-01-15T10:30:00.000Z');
          expect(result.data.updated_at).toBe('2024-01-15T10:30:00.000Z');
          done();
        },
      });
    });

    it('should convert nested Date objects to ISO 8601 format', (done) => {
      const testDate = new Date('2024-01-15T10:30:00.000Z');
      const testData = {
        id: '1',
        user: {
          id: '2',
          created_at: testDate,
        },
        items: [
          { id: '3', created_at: testDate },
          { id: '4', created_at: testDate },
        ],
      };
      mockCallHandler.handle = jest.fn(() => of(testData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result.data.user.created_at).toBe('2024-01-15T10:30:00.000Z');
          expect(result.data.items[0].created_at).toBe(
            '2024-01-15T10:30:00.000Z',
          );
          expect(result.data.items[1].created_at).toBe(
            '2024-01-15T10:30:00.000Z',
          );
          done();
        },
      });
    });

    it('should handle 204 No Content responses', (done) => {
      mockResponse.statusCode = 204;
      mockCallHandler.handle = jest.fn(() => of(null));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toBeUndefined();
          done();
        },
      });
    });

    it('should handle null data', (done) => {
      mockCallHandler.handle = jest.fn(() => of(null));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toBeUndefined();
          done();
        },
      });
    });

    it('should handle undefined data', (done) => {
      mockCallHandler.handle = jest.fn(() => of(undefined));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toBeUndefined();
          done();
        },
      });
    });

    it('should handle arrays of data', (done) => {
      const testData = [
        { id: '1', name: 'Test 1' },
        { id: '2', name: 'Test 2' },
      ];
      mockCallHandler.handle = jest.fn(() => of(testData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toHaveProperty('success', true);
          expect(result).toHaveProperty('data');
          expect(Array.isArray(result.data)).toBe(true);
          expect(result.data).toEqual(testData);
          done();
        },
      });
    });

    it('should handle primitive values', (done) => {
      const testData = 'success';
      mockCallHandler.handle = jest.fn(() => of(testData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toHaveProperty('success', true);
          expect(result).toHaveProperty('data', testData);
          done();
        },
      });
    });

    it('should convert timestamps in paginated list responses', (done) => {
      const testDate = new Date('2024-01-15T10:30:00.000Z');
      const testData = {
        data: [
          { id: '1', created_at: testDate },
          { id: '2', created_at: testDate },
        ],
        pagination: {
          current_page: 1,
          per_page: 20,
          total_count: 2,
          total_pages: 1,
          has_next_page: false,
          has_previous_page: false,
        },
      };
      mockCallHandler.handle = jest.fn(() => of(testData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result.data[0].created_at).toBe('2024-01-15T10:30:00.000Z');
          expect(result.data[1].created_at).toBe('2024-01-15T10:30:00.000Z');
          done();
        },
      });
    });

    it('should handle empty objects', (done) => {
      const testData = {};
      mockCallHandler.handle = jest.fn(() => of(testData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toHaveProperty('success', true);
          expect(result).toHaveProperty('data', testData);
          expect(result).toHaveProperty('timestamp');
          done();
        },
      });
    });

    it('should handle empty arrays', (done) => {
      const testData: any[] = [];
      mockCallHandler.handle = jest.fn(() => of(testData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toHaveProperty('success', true);
          expect(result).toHaveProperty('data');
          expect(Array.isArray(result.data)).toBe(true);
          expect(result.data.length).toBe(0);
          done();
        },
      });
    });

    it('should handle boolean values', (done) => {
      const testData = true;
      mockCallHandler.handle = jest.fn(() => of(testData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toHaveProperty('success', true);
          expect(result).toHaveProperty('data', true);
          done();
        },
      });
    });

    it('should handle number values', (done) => {
      const testData = 42;
      mockCallHandler.handle = jest.fn(() => of(testData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toHaveProperty('success', true);
          expect(result).toHaveProperty('data', 42);
          done();
        },
      });
    });

    it('should preserve null values within objects', (done) => {
      const testData = {
        id: '1',
        optional_field: null,
        name: 'Test',
      };
      mockCallHandler.handle = jest.fn(() => of(testData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result.data.optional_field).toBeNull();
          expect(result.data.name).toBe('Test');
          done();
        },
      });
    });
  });
});
