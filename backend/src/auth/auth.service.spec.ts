import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../modules/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RateLimitMiddleware } from '../common/middleware/rate-limit.middleware';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let rateLimitMiddleware: RateLimitMiddleware;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            users: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            candidates: {
              create: jest.fn(),
            },
            recruiters: {
              create: jest.fn(),
            },
            admins: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') return 'test-secret-key-min-32-characters-long';
              return null;
            }),
          },
        },
        {
          provide: RateLimitMiddleware,
          useValue: {
            recordFailedAttempt: jest.fn(),
            resetFailedAttempts: jest.fn(),
            isLocked: jest.fn().mockReturnValue(false),
            getFailedAttemptCount: jest.fn().mockReturnValue(0),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    rateLimitMiddleware = module.get<RateLimitMiddleware>(RateLimitMiddleware);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Rate Limiting', () => {
    it('should reject login when account is locked', async () => {
      // Mock isLocked to return true
      jest.spyOn(rateLimitMiddleware, 'isLocked').mockReturnValue(true);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow('Account temporarily locked. Try again later.');
    });

    it('should allow login when account is not locked', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        password_hash: '$2b$10$abcdefghijklmnopqrstuvwxyz', // Mock hash
        role: 'CANDIDATE' as any,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        last_login: null,
      };

      jest.spyOn(rateLimitMiddleware, 'isLocked').mockReturnValue(false);
      jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prismaService.users, 'update').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('mock-token');

      // Mock bcrypt.compare to return true
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(rateLimitMiddleware.resetFailedAttempts).toHaveBeenCalledWith('test@example.com');
    });
  });
});
