import { Test, TestingModule } from '@nestjs/testing';
import * as fc from 'fast-check';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { ConflictException } from '@nestjs/common';

/**
 * Property-Based Tests for User Management Service
 * 
 * **Validates: Requirements 15.1-15.4, 16.2, 16.3, 16.5, 20.3, 20.4**
 * 
 * These tests verify user management properties using fast-check with minimum 100 iterations.
 */
describe('UserService - Property-Based Tests', () => {
  let userService: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            users: {
              findUnique: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 36: User Profile Retrieval Includes Role-Specific Data
   * 
   * For any authenticated user requesting their profile, the response SHALL include
   * role-specific data: Candidates receive skills/CVs/applications, Recruiters receive
   * Company/jobs, Admins receive access level.
   * 
   * **Validates: Requirements 15.1, 15.2, 15.3, 15.4**
   */
  describe('Property 36: User profile retrieval includes role-specific data', () => {
    it('should include role-specific data for all user roles (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 2, maxLength: 100 }),
          fc.constantFrom(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
          async (email, fullName, role) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            const userId = 'user-' + Math.random();
            const baseUser = {
              id: userId,
              email,
              full_name: fullName,
              password_hash: 'hashed-password',
              role,
              is_active: true,
              created_at: new Date(),
              updated_at: new Date(),
              last_login: new Date(),
            };

            // Create role-specific mock data
            let mockUser: any;
            if (role === UserRole.CANDIDATE) {
              mockUser = {
                ...baseUser,
                candidates: {
                  id: 'candidate-' + Math.random(),
                  user_id: userId,
                  phone_number: '123-456-7890',
                  bio: 'Test bio',
                  location: 'Test City',
                  created_at: new Date(),
                  updated_at: new Date(),
                  candidate_skills: [
                    {
                      id: 'cs-1',
                      candidate_id: 'candidate-1',
                      skill_id: 'skill-1',
                      skills: { id: 'skill-1', name: 'JavaScript', created_at: new Date() },
                    },
                  ],
                  cvs: [
                    {
                      id: 'cv-1',
                      candidate_id: 'candidate-1',
                      file_name: 'resume.pdf',
                      file_path: '/uploads/resume.pdf',
                      is_default: true,
                      created_at: new Date(),
                      updated_at: new Date(),
                    },
                  ],
                  applications: [
                    {
                      id: 'app-1',
                      candidate_id: 'candidate-1',
                      job_id: 'job-1',
                      cv_id: 'cv-1',
                      status: 'APPLIED',
                      created_at: new Date(),
                      updated_at: new Date(),
                      deleted_at: null,
                      jobs: {
                        id: 'job-1',
                        title: 'Software Engineer',
                        description: 'Test job',
                        location: 'Test City',
                        salary_min: 50000,
                        salary_max: 100000,
                        job_type: 'FULL_TIME',
                        status: 'ACTIVE',
                        company_id: 'company-1',
                        created_at: new Date(),
                        updated_at: new Date(),
                      },
                    },
                  ],
                },
                recruiters: null,
                admins: null,
              };
            } else if (role === UserRole.RECRUITER) {
              mockUser = {
                ...baseUser,
                candidates: null,
                recruiters: {
                  id: 'recruiter-' + Math.random(),
                  user_id: userId,
                  company_id: 'company-1',
                  created_at: new Date(),
                  updated_at: new Date(),
                  companies: {
                    id: 'company-1',
                    name: 'Test Company',
                    description: 'Test Description',
                    website: 'https://test.com',
                    industry: 'Tech',
                    company_type: 'STARTUP',
                    location: 'Test City',
                    recruiter_id: 'recruiter-1',
                    created_at: new Date(),
                    updated_at: new Date(),
                    jobs: [
                      {
                        id: 'job-1',
                        title: 'Software Engineer',
                        description: 'Test job',
                        location: 'Test City',
                        salary_min: 50000,
                        salary_max: 100000,
                        job_type: 'FULL_TIME',
                        status: 'ACTIVE',
                        company_id: 'company-1',
                        created_at: new Date(),
                        updated_at: new Date(),
                      },
                    ],
                  },
                },
                admins: null,
              };
            } else {
              // ADMIN
              mockUser = {
                ...baseUser,
                candidates: null,
                recruiters: null,
                admins: {
                  id: 'admin-' + Math.random(),
                  user_id: userId,
                  created_at: new Date(),
                  updated_at: new Date(),
                },
              };
            }

            jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(mockUser);

            // Get user profile
            const result = await userService.getUserProfile(userId);

            // Verify password is excluded
            expect(result.password_hash).toBeUndefined();

            // Verify role-specific data is included
            if (role === UserRole.CANDIDATE) {
              expect(result.candidates).toBeDefined();
              expect(result.candidates.candidate_skills).toBeDefined();
              expect(result.candidates.cvs).toBeDefined();
              expect(result.candidates.applications).toBeDefined();
              expect(Array.isArray(result.candidates.candidate_skills)).toBe(true);
              expect(Array.isArray(result.candidates.cvs)).toBe(true);
              expect(Array.isArray(result.candidates.applications)).toBe(true);
            } else if (role === UserRole.RECRUITER) {
              expect(result.recruiters).toBeDefined();
              expect(result.recruiters.companies).toBeDefined();
              expect(result.recruiters.companies.jobs).toBeDefined();
              expect(Array.isArray(result.recruiters.companies.jobs)).toBe(true);
            } else if (role === UserRole.ADMIN) {
              expect(result.admins).toBeDefined();
              expect(result.admins.id).toBeDefined();
            }

            // Verify the correct include was used in the query
            expect(prismaService.users.findUnique).toHaveBeenCalledWith({
              where: { id: userId },
              include: {
                candidates: {
                  include: {
                    candidate_skills: {
                      include: {
                        skills: true,
                      },
                    },
                    cvs: true,
                    applications: {
                      include: {
                        jobs: true,
                      },
                    },
                  },
                },
                recruiters: {
                  include: {
                    companies: {
                      include: {
                        jobs: true,
                      },
                    },
                  },
                },
                admins: true,
              },
            });
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 37: Email Update Uniqueness Check
   * 
   * For any user profile update with a new email, if the email is already registered
   * to another user, the update SHALL fail with 409 Conflict.
   * 
   * **Validates: Requirements 16.2**
   */
  describe('Property 37: Email update uniqueness check', () => {
    it('should reject email updates when email is already taken by another user (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.emailAddress(),
          fc.string({ minLength: 2, maxLength: 100 }),
          async (existingEmail, newEmail, fullName) => {
            // Skip if emails are the same (not testing this case)
            fc.pre(existingEmail !== newEmail);

            // Clear all mocks before each iteration
            jest.clearAllMocks();

            const userId = 'user-1';
            const otherUserId = 'user-2';

            // Mock that the new email is already taken by another user
            const existingUser = {
              id: otherUserId,
              email: newEmail,
              full_name: 'Other User',
              password_hash: 'hashed',
              role: UserRole.CANDIDATE,
              is_active: true,
              created_at: new Date(),
              updated_at: new Date(),
              last_login: new Date(),
            };

            jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(existingUser);

            // Attempt to update email
            await expect(
              userService.updateUserProfile(userId, { email: newEmail }),
            ).rejects.toThrow(ConflictException);

            await expect(
              userService.updateUserProfile(userId, { email: newEmail }),
            ).rejects.toThrow('Email already registered');

            // Verify the email uniqueness check was performed
            expect(prismaService.users.findUnique).toHaveBeenCalledWith({
              where: { email: newEmail },
            });

            // Verify update was NOT called
            expect(prismaService.users.update).not.toHaveBeenCalled();
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should allow email updates when email is not taken or belongs to same user (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 2, maxLength: 100 }),
          fc.boolean(),
          async (newEmail, fullName, isSameUser) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            const userId = 'user-1';

            if (isSameUser) {
              // Email belongs to the same user - should allow
              const sameUser = {
                id: userId,
                email: newEmail,
                full_name: fullName,
                password_hash: 'hashed',
                role: UserRole.CANDIDATE,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
                last_login: new Date(),
              };

              jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(sameUser);
              jest.spyOn(prismaService.users, 'update').mockResolvedValue(sameUser);
            } else {
              // Email is not taken - should allow
              jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(null);
              jest.spyOn(prismaService.users, 'update').mockResolvedValue({
                id: userId,
                email: newEmail,
                full_name: fullName,
                password_hash: 'hashed',
                role: UserRole.CANDIDATE,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
                last_login: new Date(),
              });
            }

            // Should not throw
            const result = await userService.updateUserProfile(userId, { email: newEmail });

            expect(result).toBeDefined();
            expect(result.email).toBe(newEmail);
            expect(result.password_hash).toBeUndefined();

            // Verify update was called
            expect(prismaService.users.update).toHaveBeenCalledWith({
              where: { id: userId },
              data: expect.objectContaining({
                email: newEmail,
                updated_at: expect.any(Date),
              }),
            });
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 38: Password Update Hashing
   * 
   * For any user profile update with a new password, the password SHALL be hashed
   * with bcrypt before storage and SHALL NOT be returned in the response.
   * 
   * **Validates: Requirements 16.3, 16.5, 20.3, 20.4**
   */
  describe('Property 38: Password update hashing', () => {
    it('should hash passwords before storage and exclude from response (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 8, maxLength: 128 }),
          fc.emailAddress(),
          fc.string({ minLength: 2, maxLength: 100 }),
          async (newPassword, email, fullName) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            const userId = 'user-1';

            // Hash the password with bcrypt
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            const updatedUser = {
              id: userId,
              email,
              full_name: fullName,
              password_hash: hashedPassword,
              role: UserRole.CANDIDATE,
              is_active: true,
              created_at: new Date(),
              updated_at: new Date(),
              last_login: new Date(),
            };

            jest.spyOn(prismaService.users, 'update').mockResolvedValue(updatedUser);

            // Update password
            const result = await userService.updateUserProfile(userId, { password: newPassword });

            // Verify password_hash is NOT in the response
            expect(result.password_hash).toBeUndefined();
            expect(result).not.toHaveProperty('password_hash');

            // Verify update was called with hashed password
            expect(prismaService.users.update).toHaveBeenCalledWith({
              where: { id: userId },
              data: expect.objectContaining({
                password_hash: expect.any(String),
                updated_at: expect.any(Date),
              }),
            });

            // Get the actual hashed password that was stored
            const updateCall = (prismaService.users.update as jest.Mock).mock.calls[0][0];
            const storedHash = updateCall.data.password_hash;

            // Verify the stored value is NOT the plaintext password
            expect(storedHash).not.toBe(newPassword);

            // Verify the stored hash can be verified against the original password
            const isValid = await bcrypt.compare(newPassword, storedHash);
            expect(isValid).toBe(true);

            // Verify a different password fails verification
            const wrongPassword = newPassword + 'wrong';
            const isInvalid = await bcrypt.compare(wrongPassword, storedHash);
            expect(isInvalid).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    }, 60000); // 60 second timeout for bcrypt operations

    it('should verify password hash is different from plaintext and verifiable (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 8, maxLength: 128 }),
          async (newPassword) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            const userId = 'user-1';

            // Hash the password once
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Verify hash is different from plaintext
            expect(hashedPassword).not.toBe(newPassword);

            // Verify hash can be verified against the original password
            expect(await bcrypt.compare(newPassword, hashedPassword)).toBe(true);

            // Mock the update with the hash
            const updatedUser = {
              id: userId,
              email: 'test@test.com',
              full_name: 'Test User',
              password_hash: hashedPassword,
              role: UserRole.CANDIDATE,
              is_active: true,
              created_at: new Date(),
              updated_at: new Date(),
              last_login: new Date(),
            };

            jest.spyOn(prismaService.users, 'update').mockResolvedValue(updatedUser);

            // Update password
            const result = await userService.updateUserProfile(userId, { password: newPassword });

            // Verify password_hash is NOT in the response
            expect(result.password_hash).toBeUndefined();
          },
        ),
        { numRuns: 100 },
      );
    }, 60000); // 60 second timeout for bcrypt operations
  });
});
