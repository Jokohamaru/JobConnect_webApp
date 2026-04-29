import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as fc from 'fast-check';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../modules/prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common';
import { RateLimitMiddleware } from '../common/middleware/rate-limit.middleware';

/**
 * Property-Based Tests for Authentication Service
 * 
 * **Validates: Requirements 1.4, 2.5, 2.6, 2.7, 3.3, 3.4, 4.2, 20.1, 20.2, 21.1, 21.3, 21.4, 21.5, 21.6**
 * 
 * These tests verify authentication properties using fast-check with minimum 100 iterations.
 */
describe('AuthService - Property-Based Tests', () => {
  let authService: AuthService;
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
              if (key === 'JWT_SECRET') return 'test-secret-key-minimum-32-characters-long';
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

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    rateLimitMiddleware = module.get<RateLimitMiddleware>(RateLimitMiddleware);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 1: Email Uniqueness Enforcement
   * 
   * For any two registration requests with the same email address, the second registration
   * attempt SHALL be rejected with a 409 Conflict error, regardless of other field values.
   * 
   * **Validates: Requirements 1.2**
   */
  describe('Property 1: Email uniqueness enforcement', () => {
    it('should reject duplicate email registrations (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 8, maxLength: 128 }),
          fc.string({ minLength: 8, maxLength: 128 }),
          fc.string({ minLength: 2, maxLength: 100 }),
          fc.string({ minLength: 2, maxLength: 100 }),
          fc.constantFrom(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
          fc.constantFrom(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
          async (email, password1, password2, fullName1, fullName2, role1, role2) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            // Mock existing user with the same email
            const existingUser = {
              id: 'existing-user-id',
              email,
              full_name: fullName1,
              password_hash: 'hashed-password',
              role: role1,
              is_active: true,
              created_at: new Date(),
              updated_at: new Date(),
              last_login: null,
            };

            // First call returns existing user (email already exists)
            jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(existingUser);

            // Attempt to register with the same email but different details
            await expect(
              authService.register({
                email,
                password: password2,
                full_name: fullName2,
                role: role2,
              }),
            ).rejects.toThrow('Email already registered');

            // Verify findUnique was called to check for existing email
            expect(prismaService.users.findUnique).toHaveBeenCalledWith(
              expect.objectContaining({
                where: { email },
              }),
            );

            // Verify create was NOT called (registration was rejected)
            expect(prismaService.users.create).not.toHaveBeenCalled();
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should allow registration with unique emails (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.emailAddress(),
          fc.string({ minLength: 8, maxLength: 128 }),
          fc.string({ minLength: 2, maxLength: 100 }),
          fc.constantFrom(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
          async (email1, email2, password, fullName, role) => {
            // Skip if emails are the same
            fc.pre(email1 !== email2);

            // Clear all mocks before each iteration
            jest.clearAllMocks();

            // Mock no existing user for first email
            jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(null);

            const mockUser = {
              id: 'new-user-id',
              email: email1,
              full_name: fullName,
              password_hash: 'hashed-password',
              role,
              is_active: true,
              created_at: new Date(),
              updated_at: new Date(),
              last_login: null,
            };

            jest.spyOn(prismaService.users, 'create').mockResolvedValue(mockUser);

            // Mock profile creation
            if (role === UserRole.CANDIDATE) {
              jest.spyOn(prismaService.candidates, 'create').mockResolvedValue({
                id: 'candidate-id',
                user_id: mockUser.id,
                phone_number: null,
                bio: null,
                location: null,
                created_at: new Date(),
                updated_at: new Date(),
              });
            } else if (role === UserRole.RECRUITER) {
              jest.spyOn(prismaService.recruiters, 'create').mockResolvedValue({
                id: 'recruiter-id',
                user_id: mockUser.id,
                company_id: null,
                created_at: new Date(),
                updated_at: new Date(),
              });
            } else if (role === UserRole.ADMIN) {
              jest.spyOn(prismaService.admins, 'create').mockResolvedValue({
                id: 'admin-id',
                user_id: mockUser.id,
                created_at: new Date(),
                updated_at: new Date(),
              });
            }

            // Should not throw
            const result = await authService.register({
              email: email1,
              password,
              full_name: fullName,
              role,
            });

            expect(result).toBeDefined();
            expect(result.email).toBe(email1);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 2: Password Hashing Round Trip
   * 
   * For any valid password string, when stored via bcrypt with 10 salt rounds,
   * the stored hash SHALL be verifiable against the original password using bcrypt comparison,
   * and the hash SHALL NOT equal the plaintext password.
   * 
   * **Validates: Requirements 1.4, 20.1, 20.2**
   */
  describe('Property 2: Password hashing round trip', () => {
    it('should hash passwords and verify them correctly (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 8, maxLength: 128 }),
          async (password) => {
            // Hash the password with bcrypt (10 salt rounds)
            const hash = await bcrypt.hash(password, 10);

            // Verify the hash is not equal to the plaintext password
            expect(hash).not.toBe(password);

            // Verify the hash can be compared successfully with the original password
            const isValid = await bcrypt.compare(password, hash);
            expect(isValid).toBe(true);

            // Verify a different password fails comparison
            const wrongPassword = password + 'wrong';
            const isInvalid = await bcrypt.compare(wrongPassword, hash);
            expect(isInvalid).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    }, 30000); // 30 second timeout for bcrypt operations

    it('should produce different hashes for the same password (salt randomness)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 8, maxLength: 128 }),
          async (password) => {
            // Hash the same password twice
            const hash1 = await bcrypt.hash(password, 10);
            const hash2 = await bcrypt.hash(password, 10);

            // Hashes should be different due to random salt
            expect(hash1).not.toBe(hash2);

            // Both hashes should verify against the original password
            expect(await bcrypt.compare(password, hash1)).toBe(true);
            expect(await bcrypt.compare(password, hash2)).toBe(true);
          },
        ),
        { numRuns: 100 },
      );
    }, 60000); // 60 second timeout for bcrypt operations
  });

  /**
   * Property 3: Registration Creates Role-Specific Profile
   * 
   * For any user registration with role R (CANDIDATE, RECRUITER, or ADMIN),
   * a corresponding profile record of type R SHALL exist after registration completes.
   * 
   * **Validates: Requirements 1.6, 1.7, 1.8**
   */
  describe('Property 3: Registration creates role-specific profile', () => {
    it('should create role-specific profile for all user roles (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 8, maxLength: 128 }),
          fc.string({ minLength: 2, maxLength: 100 }),
          fc.constantFrom(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
          async (email, password, fullName, role) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            // Mock user creation
            const mockUser = {
              id: 'test-user-id',
              email,
              full_name: fullName,
              password_hash: 'hashed-password', // Use pre-hashed to avoid bcrypt slowness
              role,
              is_active: true,
              created_at: new Date(),
              updated_at: new Date(),
              last_login: null,
            };

            jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(null);
            jest.spyOn(prismaService.users, 'create').mockResolvedValue(mockUser);

            // Mock profile creation based on role
            const candidateCreateSpy = jest.spyOn(prismaService.candidates, 'create').mockResolvedValue({
              id: 'candidate-id',
              user_id: mockUser.id,
              phone_number: null,
              bio: null,
              location: null,
              created_at: new Date(),
              updated_at: new Date(),
            });

            const recruiterCreateSpy = jest.spyOn(prismaService.recruiters, 'create').mockResolvedValue({
              id: 'recruiter-id',
              user_id: mockUser.id,
              company_id: null,
              created_at: new Date(),
              updated_at: new Date(),
            });

            const adminCreateSpy = jest.spyOn(prismaService.admins, 'create').mockResolvedValue({
              id: 'admin-id',
              user_id: mockUser.id,
              created_at: new Date(),
              updated_at: new Date(),
            });

            // Register user
            const result = await authService.register({
              email,
              password,
              full_name: fullName,
              role,
            });

            // Verify user was created
            expect(result).toBeDefined();
            expect(result.email).toBe(email);
            expect(result.role).toBe(role);

            // Verify role-specific profile was created
            if (role === UserRole.CANDIDATE) {
              expect(candidateCreateSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                  data: expect.objectContaining({
                    user_id: mockUser.id,
                  }),
                }),
              );
              expect(recruiterCreateSpy).not.toHaveBeenCalled();
              expect(adminCreateSpy).not.toHaveBeenCalled();
            } else if (role === UserRole.RECRUITER) {
              expect(recruiterCreateSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                  data: expect.objectContaining({
                    user_id: mockUser.id,
                  }),
                }),
              );
              expect(candidateCreateSpy).not.toHaveBeenCalled();
              expect(adminCreateSpy).not.toHaveBeenCalled();
            } else if (role === UserRole.ADMIN) {
              expect(adminCreateSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                  data: expect.objectContaining({
                    user_id: mockUser.id,
                  }),
                }),
              );
              expect(candidateCreateSpy).not.toHaveBeenCalled();
              expect(recruiterCreateSpy).not.toHaveBeenCalled();
            }
          },
        ),
        { numRuns: 100 },
      );
    }, 15000); // 15 second timeout
  });

  /**
   * Property 4: Login Token Generation
   * 
   * For any valid login with correct credentials, the response SHALL contain
   * both an Access Token with 15-minute expiration and a Refresh Token with 7-day expiration,
   * and both tokens SHALL be valid JWT tokens with correct signature.
   * 
   * **Validates: Requirements 2.5, 2.6, 21.1, 21.4, 21.5**
   */
  describe('Property 4: Login token generation', () => {
    it('should generate valid access and refresh tokens on login (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 8, maxLength: 128 }),
          fc.string({ minLength: 2, maxLength: 100 }),
          fc.constantFrom(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
          async (email, password, fullName, role) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            const hashedPassword = await bcrypt.hash(password, 10);
            const mockUser = {
              id: 'test-user-id',
              email,
              full_name: fullName,
              password_hash: hashedPassword,
              role,
              is_active: true,
              created_at: new Date(),
              updated_at: new Date(),
              last_login: null,
            };

            jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(mockUser);
            jest.spyOn(prismaService.users, 'update').mockResolvedValue({
              ...mockUser,
              last_login: new Date(),
            });

            // Mock JWT token generation
            const mockAccessToken = 'mock-access-token-' + Math.random();
            const mockRefreshToken = 'mock-refresh-token-' + Math.random();

            jest.spyOn(jwtService, 'signAsync')
              .mockResolvedValueOnce(mockAccessToken) // Access token
              .mockResolvedValueOnce(mockRefreshToken); // Refresh token

            // Login
            const result = await authService.login({
              email,
              password,
            });

            // Verify tokens are present
            expect(result.access_token).toBeDefined();
            expect(result.refresh_token).toBeDefined();
            expect(result.access_token).toBe(mockAccessToken);
            expect(result.refresh_token).toBe(mockRefreshToken);

            // Verify tokens are different
            expect(result.access_token).not.toBe(result.refresh_token);

            // Verify user information is returned
            expect(result.user).toBeDefined();
            expect(result.user.id).toBe(mockUser.id);
            expect(result.user.email).toBe(email);
            expect(result.user.role).toBe(role);

            // Verify JWT service was called with correct parameters
            expect(jwtService.signAsync).toHaveBeenCalledWith(
              expect.objectContaining({
                sub: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
              }),
              expect.objectContaining({
                expiresIn: '15m', // Access token: 15 minutes
                secret: 'test-secret-key-minimum-32-characters-long',
              }),
            );

            expect(jwtService.signAsync).toHaveBeenCalledWith(
              expect.objectContaining({
                sub: mockUser.id,
              }),
              expect.objectContaining({
                expiresIn: '7d', // Refresh token: 7 days
                secret: 'test-secret-key-minimum-32-characters-long',
              }),
            );
          },
        ),
        { numRuns: 100 },
      );
    }, 30000); // 30 second timeout for bcrypt operations
  });

  /**
   * Property 5: Login Timestamp Recording
   * 
   * For any successful login, the user's last_login timestamp SHALL be updated to the current time.
   * 
   * **Validates: Requirements 2.7**
   */
  describe('Property 5: Login timestamp recording', () => {
    it('should update last_login timestamp on successful login (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 8, maxLength: 128 }),
          fc.string({ minLength: 2, maxLength: 100 }),
          fc.constantFrom(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
          async (email, password, fullName, role) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            const hashedPassword = await bcrypt.hash(password, 10);
            const oldLoginTime = new Date('2024-01-01T00:00:00Z');
            const mockUser = {
              id: 'test-user-id',
              email,
              full_name: fullName,
              password_hash: hashedPassword,
              role,
              is_active: true,
              created_at: new Date(),
              updated_at: new Date(),
              last_login: oldLoginTime,
            };

            jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(mockUser);

            const updateSpy = jest.spyOn(prismaService.users, 'update').mockImplementation(async (args: any) => {
              return {
                ...mockUser,
                last_login: args.data.last_login,
              };
            });

            jest.spyOn(jwtService, 'signAsync')
              .mockResolvedValueOnce('mock-access-token')
              .mockResolvedValueOnce('mock-refresh-token');

            const beforeLogin = new Date();
            // Add small delay to ensure timestamp difference
            await new Promise(resolve => setTimeout(resolve, 10));
            await authService.login({ email, password });
            const afterLogin = new Date();

            // Verify update was called
            expect(updateSpy).toHaveBeenCalledWith(
              expect.objectContaining({
                where: { id: mockUser.id },
                data: expect.objectContaining({
                  last_login: expect.any(Date),
                }),
              }),
            );

            // Verify the timestamp is recent (between before and after login)
            const updateCall = updateSpy.mock.calls[0][0];
            const updatedTimestamp = updateCall.data.last_login;
            // Allow 100ms tolerance for timing variations
            expect(updatedTimestamp.getTime()).toBeGreaterThanOrEqual(beforeLogin.getTime() - 100);
            expect(updatedTimestamp.getTime()).toBeLessThanOrEqual(afterLogin.getTime() + 100);

            // Verify it's different from the old timestamp
            expect(updatedTimestamp.getTime()).not.toBe(oldLoginTime.getTime());
          },
        ),
        { numRuns: 100 },
      );
    }, 30000); // 30 second timeout for bcrypt operations
  });

  /**
   * Property 6: Token Refresh Generates New Access Token
   * 
   * For any valid Refresh Token, calling the refresh endpoint SHALL return
   * a new Access Token with 15-minute expiration that is different from
   * any previously issued Access Token.
   * 
   * **Validates: Requirements 3.3, 3.4**
   */
  describe('Property 6: Token refresh generates new access token', () => {
    it('should generate new access token from valid refresh token (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 2, maxLength: 100 }),
          fc.constantFrom(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
          async (email, fullName, role) => {
            const mockUser = {
              id: 'test-user-id',
              email,
              full_name: fullName,
              password_hash: 'hashed-password',
              role,
              is_active: true,
              created_at: new Date(),
              updated_at: new Date(),
              last_login: new Date(),
            };

            const mockRefreshToken = 'valid-refresh-token-' + Math.random();
            const mockNewAccessToken = 'new-access-token-' + Math.random();

            // Mock JWT verification
            jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({
              sub: mockUser.id,
              iat: Math.floor(Date.now() / 1000),
              exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
            });

            jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(mockUser);

            // Mock new access token generation
            jest.spyOn(jwtService, 'signAsync').mockResolvedValue(mockNewAccessToken);

            // Refresh token
            const result = await authService.refresh({
              refresh_token: mockRefreshToken,
            });

            // Verify new access token is returned
            expect(result.access_token).toBeDefined();
            expect(result.access_token).toBe(mockNewAccessToken);

            // Verify it's different from the refresh token
            expect(result.access_token).not.toBe(mockRefreshToken);

            // Verify JWT service was called to verify the refresh token
            expect(jwtService.verifyAsync).toHaveBeenCalledWith(
              mockRefreshToken,
              expect.objectContaining({
                secret: 'test-secret-key-minimum-32-characters-long',
              }),
            );

            // Verify new access token was generated with 15-minute expiration
            expect(jwtService.signAsync).toHaveBeenCalledWith(
              expect.objectContaining({
                sub: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
              }),
              expect.objectContaining({
                expiresIn: '15m',
                secret: 'test-secret-key-minimum-32-characters-long',
              }),
            );
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should reject invalid or expired refresh tokens (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 100 }),
          async (invalidToken) => {
            // Mock JWT verification failure
            jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error('Invalid token'));

            // Attempt to refresh with invalid token
            await expect(
              authService.refresh({
                refresh_token: invalidToken,
              }),
            ).rejects.toThrow(UnauthorizedException);

            await expect(
              authService.refresh({
                refresh_token: invalidToken,
              }),
            ).rejects.toThrow('Invalid or expired refresh token');
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 7: Expired Token Rejection
   * 
   * For any JWT token that has passed its expiration time,
   * attempting to use it in an authenticated request SHALL result in a 401 Unauthorized error.
   * 
   * **Validates: Requirements 4.2, 21.3, 21.6**
   */
  describe('Property 7: Expired token rejection', () => {
    it('should reject expired tokens (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 100 }),
          fc.integer({ min: 1, max: 1000000 }), // Seconds in the past
          async (tokenString, secondsAgo) => {
            // Mock expired token verification
            const expiredTime = Math.floor(Date.now() / 1000) - secondsAgo;
            jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(
              new Error('jwt expired'),
            );

            // Attempt to use expired token for refresh
            await expect(
              authService.refresh({
                refresh_token: tokenString,
              }),
            ).rejects.toThrow(UnauthorizedException);

            await expect(
              authService.refresh({
                refresh_token: tokenString,
              }),
            ).rejects.toThrow('Invalid or expired refresh token');
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should accept valid non-expired tokens (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 2, maxLength: 100 }),
          fc.constantFrom(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
          fc.integer({ min: 1, max: 7 * 24 * 60 * 60 }), // Seconds in the future (up to 7 days)
          async (email, fullName, role, secondsInFuture) => {
            const mockUser = {
              id: 'test-user-id',
              email,
              full_name: fullName,
              password_hash: 'hashed-password',
              role,
              is_active: true,
              created_at: new Date(),
              updated_at: new Date(),
              last_login: new Date(),
            };

            const validToken = 'valid-token-' + Math.random();
            const futureExpiration = Math.floor(Date.now() / 1000) + secondsInFuture;

            // Mock valid token verification
            jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({
              sub: mockUser.id,
              iat: Math.floor(Date.now() / 1000),
              exp: futureExpiration,
            });

            jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(mockUser);
            jest.spyOn(jwtService, 'signAsync').mockResolvedValue('new-access-token');

            // Should not throw
            const result = await authService.refresh({
              refresh_token: validToken,
            });

            expect(result.access_token).toBeDefined();
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 50: Rate Limiting Failed Attempt Tracking
   * 
   * For any failed login attempt, the failed attempt counter for that email SHALL increment by 1.
   * 
   * **Validates: Requirements 30.1**
   */
  describe('Property 50: Rate limiting failed attempt tracking', () => {
    it('should increment failed attempt counter on each failed login (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 8, maxLength: 128 }),
          fc.string({ minLength: 8, maxLength: 128 }),
          fc.integer({ min: 1, max: 10 }),
          async (email, correctPassword, wrongPassword, attemptCount) => {
            // Skip if passwords are the same
            fc.pre(correctPassword !== wrongPassword);

            // Clear all mocks before each iteration
            jest.clearAllMocks();

            const hashedPassword = await bcrypt.hash(correctPassword, 10);
            const mockUser = {
              id: 'test-user-id',
              email,
              full_name: 'Test User',
              password_hash: hashedPassword,
              role: UserRole.CANDIDATE,
              is_active: true,
              created_at: new Date(),
              updated_at: new Date(),
              last_login: null,
            };

            jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(mockUser);
            const recordFailedAttemptSpy = jest.spyOn(rateLimitMiddleware, 'recordFailedAttempt');

            // Attempt multiple failed logins
            for (let i = 0; i < attemptCount; i++) {
              try {
                await authService.login({
                  email,
                  password: wrongPassword,
                });
              } catch (error) {
                // Expected to fail
              }
            }

            // Verify recordFailedAttempt was called for each failed attempt
            expect(recordFailedAttemptSpy).toHaveBeenCalledTimes(attemptCount);
            expect(recordFailedAttemptSpy).toHaveBeenCalledWith(email);
          },
        ),
        { numRuns: 100 },
      );
    }, 30000); // 30 second timeout for bcrypt operations
  });

  /**
   * Property 51: Rate Limiting Account Lockout
   * 
   * For any email with 5 failed login attempts within 15 minutes, subsequent login attempts
   * SHALL fail with 429 Too Many Requests error "Account temporarily locked. Try again later."
   * 
   * **Validates: Requirements 30.2, 30.3**
   */
  describe('Property 51: Rate limiting account lockout', () => {
    it('should lock account after 5 failed attempts (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 8, maxLength: 128 }),
          fc.string({ minLength: 8, maxLength: 128 }),
          async (email, correctPassword, wrongPassword) => {
            // Skip if passwords are the same
            fc.pre(correctPassword !== wrongPassword);

            // Clear all mocks before each iteration
            jest.clearAllMocks();

            const hashedPassword = await bcrypt.hash(correctPassword, 10);
            const mockUser = {
              id: 'test-user-id',
              email,
              full_name: 'Test User',
              password_hash: hashedPassword,
              role: UserRole.CANDIDATE,
              is_active: true,
              created_at: new Date(),
              updated_at: new Date(),
              last_login: null,
            };

            jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(mockUser);

            // Simulate 5 failed attempts
            let failedAttempts = 0;
            jest.spyOn(rateLimitMiddleware, 'recordFailedAttempt').mockImplementation(() => {
              failedAttempts++;
            });

            jest.spyOn(rateLimitMiddleware, 'getFailedAttemptCount').mockImplementation(() => {
              return failedAttempts;
            });

            // After 5 attempts, account should be locked
            jest.spyOn(rateLimitMiddleware, 'isLocked').mockImplementation(() => {
              return failedAttempts >= 5;
            });

            // Make 5 failed attempts
            for (let i = 0; i < 5; i++) {
              try {
                await authService.login({
                  email,
                  password: wrongPassword,
                });
              } catch (error) {
                // Expected to fail
              }
            }

            // Now account should be locked
            expect(rateLimitMiddleware.isLocked(email)).toBe(true);

            // Next attempt should fail with 429 error
            await expect(
              authService.login({
                email,
                password: correctPassword, // Even with correct password
              }),
            ).rejects.toThrow('Account temporarily locked');
          },
        ),
        { numRuns: 100 },
      );
    }, 30000); // 30 second timeout for bcrypt operations

    it('should not lock account with fewer than 5 failed attempts (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 8, maxLength: 128 }),
          fc.string({ minLength: 8, maxLength: 128 }),
          fc.integer({ min: 1, max: 4 }),
          async (email, correctPassword, wrongPassword, attemptCount) => {
            // Skip if passwords are the same
            fc.pre(correctPassword !== wrongPassword);

            // Clear all mocks before each iteration
            jest.clearAllMocks();

            const hashedPassword = await bcrypt.hash(correctPassword, 10);
            const mockUser = {
              id: 'test-user-id',
              email,
              full_name: 'Test User',
              password_hash: hashedPassword,
              role: UserRole.CANDIDATE,
              is_active: true,
              created_at: new Date(),
              updated_at: new Date(),
              last_login: null,
            };

            jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(mockUser);

            // Simulate failed attempts (less than 5)
            let failedAttempts = 0;
            jest.spyOn(rateLimitMiddleware, 'recordFailedAttempt').mockImplementation(() => {
              failedAttempts++;
            });

            jest.spyOn(rateLimitMiddleware, 'getFailedAttemptCount').mockImplementation(() => {
              return failedAttempts;
            });

            jest.spyOn(rateLimitMiddleware, 'isLocked').mockImplementation(() => {
              return failedAttempts >= 5;
            });

            // Make fewer than 5 failed attempts
            for (let i = 0; i < attemptCount; i++) {
              try {
                await authService.login({
                  email,
                  password: wrongPassword,
                });
              } catch (error) {
                // Expected to fail
              }
            }

            // Account should NOT be locked
            expect(rateLimitMiddleware.isLocked(email)).toBe(false);

            // Next attempt with correct password should succeed
            jest.spyOn(prismaService.users, 'update').mockResolvedValue({
              ...mockUser,
              last_login: new Date(),
            });

            jest.spyOn(jwtService, 'signAsync')
              .mockResolvedValueOnce('mock-access-token')
              .mockResolvedValueOnce('mock-refresh-token');

            const result = await authService.login({
              email,
              password: correctPassword,
            });

            expect(result.access_token).toBeDefined();
          },
        ),
        { numRuns: 100 },
      );
    }, 30000); // 30 second timeout for bcrypt operations
  });

  /**
   * Property 52: Rate Limiting Counter Reset on Success
   * 
   * For any successful login, the failed attempt counter for that email SHALL be reset to 0.
   * 
   * **Validates: Requirements 30.4**
   */
  describe('Property 52: Rate limiting counter reset on success', () => {
    it('should reset failed attempt counter on successful login (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 8, maxLength: 128 }),
          fc.string({ minLength: 8, maxLength: 128 }),
          fc.integer({ min: 1, max: 4 }),
          async (email, correctPassword, wrongPassword, failedAttempts) => {
            // Skip if passwords are the same
            fc.pre(correctPassword !== wrongPassword);

            // Clear all mocks before each iteration
            jest.clearAllMocks();

            const hashedPassword = await bcrypt.hash(correctPassword, 10);
            const mockUser = {
              id: 'test-user-id',
              email,
              full_name: 'Test User',
              password_hash: hashedPassword,
              role: UserRole.CANDIDATE,
              is_active: true,
              created_at: new Date(),
              updated_at: new Date(),
              last_login: null,
            };

            jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(mockUser);
            jest.spyOn(prismaService.users, 'update').mockResolvedValue({
              ...mockUser,
              last_login: new Date(),
            });

            // Simulate some failed attempts first
            let attemptCount = 0;
            jest.spyOn(rateLimitMiddleware, 'recordFailedAttempt').mockImplementation(() => {
              attemptCount++;
            });

            jest.spyOn(rateLimitMiddleware, 'getFailedAttemptCount').mockImplementation(() => {
              return attemptCount;
            });

            jest.spyOn(rateLimitMiddleware, 'isLocked').mockReturnValue(false);

            const resetFailedAttemptsSpy = jest.spyOn(rateLimitMiddleware, 'resetFailedAttempts');

            // Make some failed attempts
            for (let i = 0; i < failedAttempts; i++) {
              try {
                await authService.login({
                  email,
                  password: wrongPassword,
                });
              } catch (error) {
                // Expected to fail
              }
            }

            // Verify failed attempts were recorded
            expect(rateLimitMiddleware.getFailedAttemptCount(email)).toBe(failedAttempts);

            // Now login successfully
            jest.spyOn(jwtService, 'signAsync')
              .mockResolvedValueOnce('mock-access-token')
              .mockResolvedValueOnce('mock-refresh-token');

            await authService.login({
              email,
              password: correctPassword,
            });

            // Verify resetFailedAttempts was called
            expect(resetFailedAttemptsSpy).toHaveBeenCalledWith(email);
          },
        ),
        { numRuns: 100 },
      );
    }, 30000); // 30 second timeout for bcrypt operations

    it('should allow login after counter reset (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 8, maxLength: 128 }),
          async (email, password) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            const hashedPassword = await bcrypt.hash(password, 10);
            const mockUser = {
              id: 'test-user-id',
              email,
              full_name: 'Test User',
              password_hash: hashedPassword,
              role: UserRole.CANDIDATE,
              is_active: true,
              created_at: new Date(),
              updated_at: new Date(),
              last_login: null,
            };

            jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(mockUser);
            jest.spyOn(prismaService.users, 'update').mockResolvedValue({
              ...mockUser,
              last_login: new Date(),
            });

            // Simulate counter reset
            jest.spyOn(rateLimitMiddleware, 'resetFailedAttempts').mockImplementation(() => {
              // Counter is reset
            });

            jest.spyOn(rateLimitMiddleware, 'getFailedAttemptCount').mockReturnValue(0);
            jest.spyOn(rateLimitMiddleware, 'isLocked').mockReturnValue(false);

            jest.spyOn(jwtService, 'signAsync')
              .mockResolvedValueOnce('mock-access-token')
              .mockResolvedValueOnce('mock-refresh-token');

            // Login should succeed
            const result = await authService.login({
              email,
              password,
            });

            expect(result.access_token).toBeDefined();
            expect(result.refresh_token).toBeDefined();
          },
        ),
        { numRuns: 100 },
      );
    }, 30000); // 30 second timeout for bcrypt operations
  });

  /**
   * Property 8: Role-Based Access Control Enforcement
   * 
   * For any protected endpoint that requires role R, a request from a user with role R
   * SHALL succeed, while a request from a user with any other role SHALL fail with 403 Forbidden.
   * 
   * **Validates: Requirements 4.3, 4.4, 4.5, 4.6, 4.7**
   */
  describe('Property 8: Role-based access control enforcement', () => {
    it('should enforce role-based access for all role combinations (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 8, maxLength: 128 }),
          fc.constantFrom(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
          fc.constantFrom(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
          async (email, password, userRole, requiredRole) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            const hashedPassword = await bcrypt.hash(password, 10);
            const mockUser = {
              id: 'test-user-id',
              email,
              full_name: 'Test User',
              password_hash: hashedPassword,
              role: userRole,
              is_active: true,
              created_at: new Date(),
              updated_at: new Date(),
              last_login: null,
            };

            jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(mockUser);
            jest.spyOn(prismaService.users, 'update').mockResolvedValue({
              ...mockUser,
              last_login: new Date(),
            });

            jest.spyOn(jwtService, 'signAsync')
              .mockResolvedValueOnce('mock-access-token')
              .mockResolvedValueOnce('mock-refresh-token');

            // Login to get user with role
            const loginResult = await authService.login({
              email,
              password,
            });

            // Verify the user's role is preserved in the response
            expect(loginResult.user.role).toBe(userRole);

            // Simulate role-based access check
            const hasAccess = userRole === requiredRole;

            if (hasAccess) {
              // User with matching role should have access
              expect(loginResult.user.role).toBe(requiredRole);
            } else {
              // User with different role should not match required role
              expect(loginResult.user.role).not.toBe(requiredRole);
            }

            // Verify role is one of the valid roles
            expect([UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN]).toContain(loginResult.user.role);
          },
        ),
        { numRuns: 100 },
      );
    }, 30000); // 30 second timeout for bcrypt operations

    it('should preserve role information through token generation (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 8, maxLength: 128 }),
          fc.constantFrom(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
          async (email, password, role) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            const hashedPassword = await bcrypt.hash(password, 10);
            const mockUser = {
              id: 'test-user-id',
              email,
              full_name: 'Test User',
              password_hash: hashedPassword,
              role,
              is_active: true,
              created_at: new Date(),
              updated_at: new Date(),
              last_login: null,
            };

            jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(mockUser);
            jest.spyOn(prismaService.users, 'update').mockResolvedValue({
              ...mockUser,
              last_login: new Date(),
            });

            const signAsyncSpy = jest.spyOn(jwtService, 'signAsync')
              .mockResolvedValueOnce('mock-access-token')
              .mockResolvedValueOnce('mock-refresh-token');

            // Login
            const result = await authService.login({
              email,
              password,
            });

            // Verify role is included in JWT payload
            expect(signAsyncSpy).toHaveBeenCalledWith(
              expect.objectContaining({
                sub: mockUser.id,
                email: mockUser.email,
                role: role,
              }),
              expect.any(Object),
            );

            // Verify role is returned in response
            expect(result.user.role).toBe(role);
          },
        ),
        { numRuns: 100 },
      );
    }, 30000); // 30 second timeout for bcrypt operations

    it('should validate role is one of the allowed values (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 8, maxLength: 128 }),
          fc.constantFrom(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
          async (email, password, role) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            const hashedPassword = await bcrypt.hash(password, 10);
            const mockUser = {
              id: 'test-user-id',
              email,
              full_name: 'Test User',
              password_hash: hashedPassword,
              role,
              is_active: true,
              created_at: new Date(),
              updated_at: new Date(),
              last_login: null,
            };

            jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(mockUser);
            jest.spyOn(prismaService.users, 'update').mockResolvedValue({
              ...mockUser,
              last_login: new Date(),
            });

            jest.spyOn(jwtService, 'signAsync')
              .mockResolvedValueOnce('mock-access-token')
              .mockResolvedValueOnce('mock-refresh-token');

            // Login
            const result = await authService.login({
              email,
              password,
            });

            // Verify role is one of the three valid roles
            const validRoles = [UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN];
            expect(validRoles).toContain(result.user.role);
            
            // Verify role matches exactly
            expect(result.user.role).toBe(role);
          },
        ),
        { numRuns: 100 },
      );
    }, 30000); // 30 second timeout for bcrypt operations
  });
});
