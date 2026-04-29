import { Test, TestingModule } from '@nestjs/testing';
import { RateLimitMiddleware } from './rate-limit.middleware';
import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '@nestjs/common';

describe('RateLimitMiddleware', () => {
  let middleware: RateLimitMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RateLimitMiddleware],
    }).compile();

    middleware = module.get<RateLimitMiddleware>(RateLimitMiddleware);
    
    mockRequest = {
      path: '/auth/login',
      method: 'POST',
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();

    // Clear all failed attempts before each test
    middleware.clearAll();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Failed Attempt Tracking', () => {
    it('should track first failed login attempt', () => {
      // Requirements: 30.1
      const email = 'test@example.com';
      
      middleware.recordFailedAttempt(email);
      
      expect(middleware.getFailedAttemptCount(email)).toBe(1);
    });

    it('should track multiple failed login attempts', () => {
      // Requirements: 30.1
      const email = 'test@example.com';
      
      middleware.recordFailedAttempt(email);
      middleware.recordFailedAttempt(email);
      middleware.recordFailedAttempt(email);
      
      expect(middleware.getFailedAttemptCount(email)).toBe(3);
    });

    it('should track failed attempts per email independently', () => {
      // Requirements: 30.1
      const email1 = 'user1@example.com';
      const email2 = 'user2@example.com';
      
      middleware.recordFailedAttempt(email1);
      middleware.recordFailedAttempt(email1);
      middleware.recordFailedAttempt(email2);
      
      expect(middleware.getFailedAttemptCount(email1)).toBe(2);
      expect(middleware.getFailedAttemptCount(email2)).toBe(1);
    });

    it('should return 0 for email with no failed attempts', () => {
      // Requirements: 30.1
      const email = 'new@example.com';
      
      expect(middleware.getFailedAttemptCount(email)).toBe(0);
    });

    it('should only count attempts within 15-minute window', () => {
      // Requirements: 30.2, 30.5
      const email = 'test@example.com';
      
      // Mock Date.now to simulate time passing
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValueOnce(now - 16 * 60 * 1000); // 16 minutes ago
      middleware.recordFailedAttempt(email);
      
      jest.spyOn(Date, 'now').mockReturnValueOnce(now);
      middleware.recordFailedAttempt(email);
      
      // Should only count the recent attempt
      expect(middleware.getFailedAttemptCount(email)).toBe(1);
    });
  });

  describe('Account Lockout After 5 Attempts', () => {
    it('should lock account after 5 failed attempts', () => {
      // Requirements: 30.2
      const email = 'test@example.com';
      
      for (let i = 0; i < 5; i++) {
        middleware.recordFailedAttempt(email);
      }
      
      expect(middleware.isLocked(email)).toBe(true);
    });

    it('should not lock account with fewer than 5 attempts', () => {
      // Requirements: 30.2
      const email = 'test@example.com';
      
      for (let i = 0; i < 4; i++) {
        middleware.recordFailedAttempt(email);
      }
      
      expect(middleware.isLocked(email)).toBe(false);
    });

    it('should return 429 Too Many Requests when account is locked', () => {
      // Requirements: 30.3
      const email = 'test@example.com';
      mockRequest.body = { email };
      
      // Lock the account
      for (let i = 0; i < 5; i++) {
        middleware.recordFailedAttempt(email);
      }
      
      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );
      
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.TOO_MANY_REQUESTS);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Account temporarily locked. Try again later.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should lock account for 15 minutes', () => {
      // Requirements: 30.2
      const email = 'test@example.com';
      const now = Date.now();
      
      jest.spyOn(Date, 'now').mockReturnValue(now);
      
      // Lock the account
      for (let i = 0; i < 5; i++) {
        middleware.recordFailedAttempt(email);
      }
      
      expect(middleware.isLocked(email)).toBe(true);
      
      // Simulate 14 minutes passing (still locked)
      jest.spyOn(Date, 'now').mockReturnValue(now + 14 * 60 * 1000);
      expect(middleware.isLocked(email)).toBe(true);
      
      // Simulate 15 minutes passing (unlocked)
      jest.spyOn(Date, 'now').mockReturnValue(now + 15 * 60 * 1000);
      expect(middleware.isLocked(email)).toBe(false);
    });

    it('should allow request after lockout period expires', () => {
      // Requirements: 30.2
      const email = 'test@example.com';
      const now = Date.now();
      mockRequest.body = { email };
      
      jest.spyOn(Date, 'now').mockReturnValue(now);
      
      // Lock the account
      for (let i = 0; i < 5; i++) {
        middleware.recordFailedAttempt(email);
      }
      
      // Simulate 15 minutes passing
      jest.spyOn(Date, 'now').mockReturnValue(now + 15 * 60 * 1000);
      
      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('Counter Reset on Success', () => {
    it('should reset counter on successful login', () => {
      // Requirements: 30.4
      const email = 'test@example.com';
      
      middleware.recordFailedAttempt(email);
      middleware.recordFailedAttempt(email);
      middleware.recordFailedAttempt(email);
      
      expect(middleware.getFailedAttemptCount(email)).toBe(3);
      
      middleware.resetFailedAttempts(email);
      
      expect(middleware.getFailedAttemptCount(email)).toBe(0);
    });

    it('should unlock account when counter is reset', () => {
      // Requirements: 30.4
      const email = 'test@example.com';
      
      // Lock the account
      for (let i = 0; i < 5; i++) {
        middleware.recordFailedAttempt(email);
      }
      
      expect(middleware.isLocked(email)).toBe(true);
      
      middleware.resetFailedAttempts(email);
      
      expect(middleware.isLocked(email)).toBe(false);
      expect(middleware.getFailedAttemptCount(email)).toBe(0);
    });

    it('should allow new failed attempts after reset', () => {
      // Requirements: 30.4
      const email = 'test@example.com';
      
      middleware.recordFailedAttempt(email);
      middleware.recordFailedAttempt(email);
      middleware.resetFailedAttempts(email);
      middleware.recordFailedAttempt(email);
      
      expect(middleware.getFailedAttemptCount(email)).toBe(1);
    });
  });

  describe('Middleware Integration', () => {
    it('should call next() for non-login endpoints', () => {
      const customRequest = {
        ...mockRequest,
        path: '/auth/register',
        body: { email: 'test@example.com' },
      };
      
      middleware.use(
        customRequest as Request,
        mockResponse as Response,
        mockNext,
      );
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should call next() for non-POST requests', () => {
      const customRequest = {
        ...mockRequest,
        method: 'GET',
        body: { email: 'test@example.com' },
      };
      
      middleware.use(
        customRequest as Request,
        mockResponse as Response,
        mockNext,
      );
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should call next() when email is not provided', () => {
      mockRequest.body = {};
      
      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should call next() for unlocked accounts', () => {
      const email = 'test@example.com';
      mockRequest.body = { email };
      
      middleware.recordFailedAttempt(email);
      
      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should store email in request for later use', () => {
      const email = 'test@example.com';
      mockRequest.body = { email };
      
      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );
      
      expect((mockRequest as any).rateLimitEmail).toBe(email);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should clean up expired lockout on next request', () => {
      const email = 'test@example.com';
      const now = Date.now();
      mockRequest.body = { email };
      
      jest.spyOn(Date, 'now').mockReturnValue(now);
      
      // Lock the account
      for (let i = 0; i < 5; i++) {
        middleware.recordFailedAttempt(email);
      }
      
      // Simulate 15 minutes passing
      jest.spyOn(Date, 'now').mockReturnValue(now + 15 * 60 * 1000);
      
      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );
      
      // Should clean up and allow request
      expect(mockNext).toHaveBeenCalled();
      expect(middleware.getFailedAttemptCount(email)).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid successive failed attempts', () => {
      // Requirements: 30.1, 30.2
      const email = 'test@example.com';
      
      // Simulate 10 rapid failed attempts
      for (let i = 0; i < 10; i++) {
        middleware.recordFailedAttempt(email);
      }
      
      expect(middleware.isLocked(email)).toBe(true);
      expect(middleware.getFailedAttemptCount(email)).toBe(10);
    });

    it('should handle exactly 5 attempts at window boundary', () => {
      // Requirements: 30.2
      const email = 'test@example.com';
      const now = Date.now();
      
      // 4 attempts at the start of the window
      jest.spyOn(Date, 'now').mockReturnValue(now);
      for (let i = 0; i < 4; i++) {
        middleware.recordFailedAttempt(email);
      }
      
      // 5th attempt just before window expires
      jest.spyOn(Date, 'now').mockReturnValue(now + 14 * 60 * 1000 + 59 * 1000);
      middleware.recordFailedAttempt(email);
      
      expect(middleware.isLocked(email)).toBe(true);
    });

    it('should not count attempts outside 15-minute window', () => {
      // Requirements: 30.5
      const email = 'test@example.com';
      const now = Date.now();
      
      // 3 attempts 16 minutes ago (outside window)
      jest.spyOn(Date, 'now').mockReturnValue(now - 16 * 60 * 1000);
      for (let i = 0; i < 3; i++) {
        middleware.recordFailedAttempt(email);
      }
      
      // 2 attempts now (inside window)
      jest.spyOn(Date, 'now').mockReturnValue(now);
      for (let i = 0; i < 2; i++) {
        middleware.recordFailedAttempt(email);
      }
      
      // Should only count the 2 recent attempts
      expect(middleware.getFailedAttemptCount(email)).toBe(2);
      expect(middleware.isLocked(email)).toBe(false);
    });

    it('should handle clearAll method', () => {
      const email1 = 'user1@example.com';
      const email2 = 'user2@example.com';
      
      middleware.recordFailedAttempt(email1);
      middleware.recordFailedAttempt(email2);
      
      middleware.clearAll();
      
      expect(middleware.getFailedAttemptCount(email1)).toBe(0);
      expect(middleware.getFailedAttemptCount(email2)).toBe(0);
    });
  });
});
