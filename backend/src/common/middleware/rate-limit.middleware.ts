import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface FailedAttempt {
  count: number;
  timestamps: number[];
  lockedUntil?: number;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private failedAttempts: Map<string, FailedAttempt> = new Map();
  private readonly MAX_ATTEMPTS = 5;
  private readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes in milliseconds
  private readonly LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout

  use(req: Request, res: Response, next: NextFunction) {
    // Only apply rate limiting to login endpoint
    if (req.path === '/auth/login' && req.method === 'POST') {
      const email = req.body?.email;

      if (!email) {
        return next();
      }

      const now = Date.now();
      const attempt = this.failedAttempts.get(email);

      // Check if account is locked
      if (attempt?.lockedUntil && now < attempt.lockedUntil) {
        return res.status(HttpStatus.TOO_MANY_REQUESTS).json({
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Account temporarily locked. Try again later.',
        });
      }

      // Clean up expired lockout
      if (attempt?.lockedUntil && now >= attempt.lockedUntil) {
        this.failedAttempts.delete(email);
      }

      // Store email in request for later use
      (req as any).rateLimitEmail = email;
    }

    next();
  }

  /**
   * Record a failed login attempt
   * Requirements: 30.1, 30.2
   */
  recordFailedAttempt(email: string): void {
    const now = Date.now();
    const attempt = this.failedAttempts.get(email);

    if (!attempt) {
      this.failedAttempts.set(email, {
        count: 1,
        timestamps: [now],
      });
      return;
    }

    // Filter timestamps within the 15-minute window
    const recentTimestamps = attempt.timestamps.filter(
      (timestamp) => now - timestamp < this.WINDOW_MS,
    );

    recentTimestamps.push(now);

    const newCount = recentTimestamps.length;

    // Lock account if 5 or more failed attempts within window
    if (newCount >= this.MAX_ATTEMPTS) {
      this.failedAttempts.set(email, {
        count: newCount,
        timestamps: recentTimestamps,
        lockedUntil: now + this.LOCKOUT_MS,
      });
    } else {
      this.failedAttempts.set(email, {
        count: newCount,
        timestamps: recentTimestamps,
      });
    }
  }

  /**
   * Reset failed attempt counter on successful login
   * Requirements: 30.4
   */
  resetFailedAttempts(email: string): void {
    this.failedAttempts.delete(email);
  }

  /**
   * Check if an email is currently locked
   */
  isLocked(email: string): boolean {
    const attempt = this.failedAttempts.get(email);
    if (!attempt?.lockedUntil) {
      return false;
    }

    const now = Date.now();
    return now < attempt.lockedUntil;
  }

  /**
   * Get failed attempt count for an email
   */
  getFailedAttemptCount(email: string): number {
    const attempt = this.failedAttempts.get(email);
    if (!attempt) {
      return 0;
    }

    const now = Date.now();
    const recentTimestamps = attempt.timestamps.filter(
      (timestamp) => now - timestamp < this.WINDOW_MS,
    );

    return recentTimestamps.length;
  }

  /**
   * Clear all failed attempts (for testing)
   */
  clearAll(): void {
    this.failedAttempts.clear();
  }
}
