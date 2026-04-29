import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module';
import { CustomExceptionFilter } from './custom-exception.filter';

/**
 * Integration tests for error response format and HTTP status code mapping
 * Validates Requirements 25.1-25.6
 */
describe('Error Response Format (Requirements 25.1-25.6)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply global validation pipe (as in main.ts)
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    
    // Apply global exception filter
    app.useGlobalFilters(new CustomExceptionFilter());
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Error Response Format Consistency (Requirement 25.4)', () => {
    it('should return consistent error format with statusCode, timestamp, path, message', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/non-existent-endpoint')
        .expect(404);

      // Verify all required fields are present
      expect(response.body).toHaveProperty('statusCode');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('path');
      expect(response.body).toHaveProperty('message');

      // Verify field types
      expect(typeof response.body.statusCode).toBe('number');
      expect(typeof response.body.timestamp).toBe('string');
      expect(typeof response.body.path).toBe('string');
      expect(
        typeof response.body.message === 'string' ||
          Array.isArray(response.body.message),
      ).toBe(true);
    });

    it('should use ISO 8601 timestamp format (Requirement 25.6)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/non-existent-endpoint')
        .expect(404);

      const timestamp = response.body.timestamp;

      // Validate ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ
      expect(timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );

      // Verify it's a valid date
      const date = new Date(timestamp);
      expect(date.toISOString()).toBe(timestamp);

      // Verify timestamp is recent (within last 5 seconds)
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      expect(diff).toBeLessThan(5000);
    });

    it('should include the request path in error response', async () => {
      const testPath = '/api/test-error-path';
      const response = await request(app.getHttpServer())
        .get(testPath)
        .expect(404);

      expect(response.body.path).toBe(testPath);
    });
  });

  describe('HTTP Status Code Mapping', () => {
    describe('400 Bad Request - Invalid Input', () => {
      it('should return 400 for validation errors with field-specific messages', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: 'invalid-email', // Invalid email format
            password: 'short', // Too short
            full_name: 'Test User',
            role: 'CANDIDATE',
          })
          .expect(400);

        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBeDefined();
        expect(Array.isArray(response.body.message)).toBe(true);
      });

      it('should return 400 for missing required fields', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: 'test@example.com',
            // Missing password, full_name, role
          })
          .expect(400);

        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBeDefined();
      });
    });

    describe('401 Unauthorized - Authentication Errors', () => {
      it('should return 401 for missing authentication token', async () => {
        const response = await request(app.getHttpServer())
          .get('/users/me')
          .expect(401);

        expect(response.body.statusCode).toBe(401);
        expect(response.body.message).toBeDefined();
      });

      it('should return 401 for invalid authentication token', async () => {
        const response = await request(app.getHttpServer())
          .get('/users/me')
          .set('Authorization', 'Bearer invalid-token')
          .expect(401);

        expect(response.body.statusCode).toBe(401);
        expect(response.body.message).toBeDefined();
      });
    });

    describe('404 Not Found - Resource Not Found', () => {
      it('should return 404 for non-existent endpoints', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/non-existent-resource')
          .expect(404);

        expect(response.body.statusCode).toBe(404);
        expect(response.body.message).toBeDefined();
      });
    });

    describe('409 Conflict - Constraint Violations', () => {
      it('should return 409 for duplicate email registration', async () => {
        const userData = {
          email: `test-${Date.now()}@example.com`,
          password: 'Password123',
          full_name: 'Test User',
          role: 'CANDIDATE',
        };

        // First registration should succeed
        await request(app.getHttpServer())
          .post('/auth/register')
          .send(userData)
          .expect(201);

        // Second registration with same email should fail with 409
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send(userData)
          .expect(409);

        expect(response.body.statusCode).toBe(409);
        expect(response.body.message).toContain('already registered');
      });
    });
  });

  describe('Successful Response Format (Requirements 25.1-25.3)', () => {
    it('should return 201 Created for successful resource creation (Requirement 25.2)', async () => {
      const userData = {
        email: `success-test-${Date.now()}@example.com`,
        password: 'Password123',
        full_name: 'Success Test User',
        role: 'CANDIDATE',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(201);

      // Verify response follows consistent format with data wrapper
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('timestamp');
      
      // Verify response contains created resource data
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data.email).toBe(userData.email);
    });

    it('should return 200 OK for successful GET requests (Requirement 25.1)', async () => {
      // Register and login to get a valid token
      const userData = {
        email: `get-test-${Date.now()}@example.com`,
        password: 'Password123',
        full_name: 'Get Test User',
        role: 'CANDIDATE',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(201);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(200);

      const token = loginResponse.body.data.access_token;

      // Test GET request with authentication
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Verify response follows consistent format with data wrapper
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('timestamp');
      
      // Verify response contains requested data
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data.email).toBe(userData.email);
    });
  });

  describe('Error Message Consistency', () => {
    it('should return string message for single errors', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/non-existent-endpoint')
        .expect(404);

      expect(typeof response.body.message).toBe('string');
    });

    it('should return array of messages for validation errors', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid',
          password: 'short',
          full_name: 'T',
          role: 'INVALID_ROLE',
        })
        .expect(400);

      expect(Array.isArray(response.body.message)).toBe(true);
      expect(response.body.message.length).toBeGreaterThan(0);
    });
  });

  describe('Error Response Does Not Expose Sensitive Information', () => {
    it('should not expose stack traces in error responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/non-existent-endpoint')
        .expect(404);

      expect(response.body).not.toHaveProperty('stack');
      expect(response.body).not.toHaveProperty('stackTrace');
    });

    it('should not expose internal error details', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'short',
          full_name: 'Test',
          role: 'CANDIDATE',
        })
        .expect(400);

      // Should not contain database error details, file paths, etc.
      const responseStr = JSON.stringify(response.body);
      expect(responseStr).not.toContain('prisma');
      expect(responseStr).not.toContain('database');
      expect(responseStr).not.toContain('/src/');
      expect(responseStr).not.toContain('node_modules');
    });
  });
});
