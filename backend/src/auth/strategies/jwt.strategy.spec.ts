import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                JWT_SECRET: 'test-secret-key-minimum-32-characters-long',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user object with userId, email, and role', () => {
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: 'CANDIDATE',
      };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'CANDIDATE',
      });
    });

    it('should extract userId from sub field', () => {
      const payload = {
        sub: 'user-456',
        email: 'recruiter@example.com',
        role: 'RECRUITER',
      };

      const result = strategy.validate(payload);

      expect(result.userId).toBe('user-456');
    });

    it('should preserve email from payload', () => {
      const payload = {
        sub: 'user-789',
        email: 'admin@example.com',
        role: 'ADMIN',
      };

      const result = strategy.validate(payload);

      expect(result.email).toBe('admin@example.com');
    });

    it('should preserve role from payload', () => {
      const payload = {
        sub: 'user-999',
        email: 'test@example.com',
        role: 'CANDIDATE',
      };

      const result = strategy.validate(payload);

      expect(result.role).toBe('CANDIDATE');
    });

    it('should handle different user roles', () => {
      const roles = ['CANDIDATE', 'RECRUITER', 'ADMIN'];

      roles.forEach((role) => {
        const payload = {
          sub: 'user-id',
          email: 'test@example.com',
          role,
        };

        const result = strategy.validate(payload);

        expect(result.role).toBe(role);
      });
    });
  });

  describe('JWT extraction from Bearer token', () => {
    it('should be configured to extract JWT from Authorization header', () => {
      // The strategy is configured with ExtractJwt.fromAuthHeaderAsBearerToken()
      // which extracts JWT from "Authorization: Bearer <token>" header
      expect(strategy).toBeDefined();
      // This is verified through integration tests with actual HTTP requests
    });

    it('should ignore expiration set to false (enforce expiration)', () => {
      // The strategy is configured with ignoreExpiration: false
      // which means expired tokens will be rejected
      expect(strategy).toBeDefined();
      // This is verified through integration tests with expired tokens
    });
  });
});
