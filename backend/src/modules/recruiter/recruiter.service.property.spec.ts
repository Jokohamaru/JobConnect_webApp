import { Test, TestingModule } from '@nestjs/testing';
import * as fc from 'fast-check';
import { RecruiterService } from './recruiter.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException } from '@nestjs/common';

/**
 * Property-Based Tests for Recruiter Profile Management
 * 
 * **Validates: Requirements 7.1, 7.2, 7.3, 7.6**
 * 
 * These tests verify recruiter profile management properties using fast-check with minimum 100 iterations.
 */
describe('RecruiterService - Property-Based Tests', () => {
  let recruiterService: RecruiterService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecruiterService,
        {
          provide: PrismaService,
          useValue: {
            recruiters: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    recruiterService = module.get<RecruiterService>(RecruiterService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 16: Company Update Authorization
   * 
   * For any Company update request, if the authenticated Recruiter owns the Company,
   * the update SHALL succeed; otherwise, it SHALL fail with 403 Forbidden.
   * 
   * This property applies to recruiter profile updates as well - a recruiter can only
   * update their own profile.
   * 
   * **Validates: Requirements 7.3, 7.6**
   */
  describe('Property 16: Recruiter profile update authorization', () => {
    it('should allow updates when authenticated user owns the profile (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
          async (userId, companyId) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            const recruiterId = 'recruiter-' + Math.random();

            // Mock recruiter that belongs to the authenticated user
            const mockRecruiter = {
              id: recruiterId,
              user_id: userId,
              created_at: new Date(),
              updated_at: new Date(),
            };

            const updatedRecruiter = {
              ...mockRecruiter,
              company_id: companyId,
              updated_at: new Date(),
              users: {
                id: userId,
                email: 'test@example.com',
                full_name: 'Test Recruiter',
                role: 'RECRUITER',
                created_at: new Date(),
                updated_at: new Date(),
              },
              companies: companyId ? {
                id: companyId,
                name: 'Test Company',
                description: 'Test Description',
                website: 'https://test.com',
                industry: 'Tech',
                company_type: 'STARTUP',
                location: 'Test City',
                recruiter_id: recruiterId,
                created_at: new Date(),
                updated_at: new Date(),
                jobs: [],
              } : null,
            };

            jest.spyOn(prismaService.recruiters, 'findUnique')
              .mockResolvedValueOnce(mockRecruiter);
            jest.spyOn(prismaService.recruiters, 'update').mockResolvedValue(updatedRecruiter);

            // Update should succeed
            const result = await recruiterService.updateRecruiterProfile(
              userId,
              recruiterId,
              { company_id: companyId },
            );

            expect(result).toBeDefined();
            expect(result.user_id).toBe(userId);

            // Verify findUnique was called to check ownership
            expect(prismaService.recruiters.findUnique).toHaveBeenCalledWith({
              where: { id: recruiterId },
            });

            // Verify update was called
            expect(prismaService.recruiters.update).toHaveBeenCalledWith({
              where: { id: recruiterId },
              data: expect.objectContaining({
                updated_at: expect.any(Date),
              }),
              include: expect.any(Object),
            });
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should reject updates when authenticated user does not own the profile (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
          async (authenticatedUserId, profileOwnerId, companyId) => {
            // Ensure the user IDs are different
            fc.pre(authenticatedUserId !== profileOwnerId);

            // Clear all mocks before each iteration
            jest.clearAllMocks();

            const recruiterId = 'recruiter-' + Math.random();

            // Mock recruiter that belongs to a different user
            const mockRecruiter = {
              id: recruiterId,
              user_id: profileOwnerId,
              created_at: new Date(),
              updated_at: new Date(),
            };

            jest.spyOn(prismaService.recruiters, 'findUnique').mockResolvedValue(mockRecruiter);

            // Update should fail with 403 Forbidden
            await expect(
              recruiterService.updateRecruiterProfile(
                authenticatedUserId,
                recruiterId,
                { company_id: companyId },
              ),
            ).rejects.toThrow(ForbiddenException);

            await expect(
              recruiterService.updateRecruiterProfile(
                authenticatedUserId,
                recruiterId,
                { company_id: companyId },
              ),
            ).rejects.toThrow('You do not have permission to update this profile');

            // Verify findUnique was called to check ownership
            expect(prismaService.recruiters.findUnique).toHaveBeenCalledWith({
              where: { id: recruiterId },
            });

            // Verify update was NOT called
            expect(prismaService.recruiters.update).not.toHaveBeenCalled();
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Recruiter Profile Persistence
   * 
   * For any Recruiter profile update with company_id field,
   * the updated value SHALL be persisted and retrievable in subsequent profile queries.
   * 
   * **Validates: Requirements 7.1, 7.2**
   */
  describe('Recruiter profile persistence', () => {
    it('should persist company_id and make it retrievable (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
          async (userId, companyId) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            const recruiterId = 'recruiter-' + Math.random();

            // Mock recruiter before update
            const mockRecruiterBefore = {
              id: recruiterId,
              user_id: userId,
              created_at: new Date(),
              updated_at: new Date(),
            };

            // Mock recruiter after update with new company_id
            const mockRecruiterAfter = {
              id: recruiterId,
              user_id: userId,
              company_id: companyId,
              created_at: mockRecruiterBefore.created_at,
              updated_at: new Date(),
              users: {
                id: userId,
                email: 'test@example.com',
                full_name: 'Test Recruiter',
                role: 'RECRUITER',
                created_at: new Date(),
                updated_at: new Date(),
              },
              companies: companyId ? {
                id: companyId,
                name: 'Test Company',
                description: 'Test Description',
                website: 'https://test.com',
                industry: 'Tech',
                company_type: 'STARTUP',
                location: 'Test City',
                recruiter_id: recruiterId,
                created_at: new Date(),
                updated_at: new Date(),
                jobs: [],
              } : null,
            };

            // First call returns the recruiter for ownership check
            jest.spyOn(prismaService.recruiters, 'findUnique')
              .mockResolvedValueOnce(mockRecruiterBefore);

            jest.spyOn(prismaService.recruiters, 'update').mockResolvedValue(mockRecruiterAfter);

            // Perform update
            const updateDto: any = {};
            if (companyId !== undefined) updateDto.company_id = companyId;

            const result = await recruiterService.updateRecruiterProfile(
              userId,
              recruiterId,
              updateDto,
            );

            // Verify the result contains the updated values
            expect(result).toBeDefined();
            expect(result.id).toBe(recruiterId);
            expect(result.user_id).toBe(userId);

            // Verify company_id was persisted correctly
            if (companyId !== undefined) {
              expect(result.company_id).toBe(companyId);
            }

            // Verify update was called with the correct data
            expect(prismaService.recruiters.update).toHaveBeenCalledWith({
              where: { id: recruiterId },
              data: expect.objectContaining({
                ...updateDto,
                updated_at: expect.any(Date),
              }),
              include: expect.any(Object),
            });

            // Verify the updated_at timestamp was updated
            expect(result.updated_at).toBeDefined();
            expect(result.updated_at.getTime()).toBeGreaterThanOrEqual(mockRecruiterBefore.updated_at.getTime());
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
