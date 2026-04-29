import { Test, TestingModule } from '@nestjs/testing';
import * as fc from 'fast-check';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

/**
 * Property-Based Tests for Admin Service
 * 
 * **Validates: Requirements 22.1, 22.2, 22.4, 22.5, 23.1, 23.2, 23.3**
 * 
 * These tests verify admin features using fast-check with minimum 100 iterations.
 */
describe('AdminService - Property-Based Tests', () => {
  let adminService: AdminService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: {
            users: {
              findMany: jest.fn(),
              count: jest.fn(),
            },
            jobs: {
              count: jest.fn(),
              findMany: jest.fn(),
            },
            applications: {
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    adminService = module.get<AdminService>(AdminService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 44: Admin User Listing Access Control
   * 
   * For any request to list all users, if the authenticated user is an Admin,
   * the request SHALL succeed; otherwise, it SHALL fail with 403 Forbidden.
   * 
   * Note: Access control is enforced at the controller level via @Roles('ADMIN') decorator
   * and RolesGuard. This property test verifies the service layer correctly returns user data
   * when called (assuming authorization has passed).
   * 
   * **Validates: Requirements 22.1, 22.4, 22.5**
   */
  describe('Property 44: Admin user listing access control', () => {
    it('should successfully return all users when service is called (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              id: fc.uuid(),
              email: fc.emailAddress(),
              full_name: fc.string({ minLength: 2, maxLength: 100 }),
              role: fc.constantFrom(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
              is_active: fc.boolean(),
              created_at: fc.date(),
              updated_at: fc.date(),
              last_login: fc.option(fc.date(), { nil: null }),
            }),
            { minLength: 0, maxLength: 50 },
          ),
          async (mockUsers) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            jest.spyOn(prismaService.users, 'findMany').mockResolvedValue(mockUsers);

            // Call the service method (authorization is handled at controller level)
            const result = await adminService.getAllUsers();

            // Verify the service returns the user list
            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(mockUsers.length);

            // Verify all users are included
            result.forEach((user, index) => {
              expect(user.id).toBe(mockUsers[index].id);
              expect(user.email).toBe(mockUsers[index].email);
              expect(user.role).toBe(mockUsers[index].role);
            });

            // Verify the correct query was made
            expect(prismaService.users.findMany).toHaveBeenCalledWith({
              where: {},
              select: {
                id: true,
                email: true,
                full_name: true,
                role: true,
                is_active: true,
                created_at: true,
                updated_at: true,
                last_login: true,
              },
              orderBy: {
                created_at: 'desc',
              },
            });
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 45: Admin User Filtering by Role
   * 
   * For any admin user listing filtered by role R, all returned users SHALL have role R.
   * 
   * **Validates: Requirements 22.2**
   */
  describe('Property 45: Admin user filtering by role', () => {
    it('should return only users with the specified role (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
          fc.array(
            fc.record({
              id: fc.uuid(),
              email: fc.emailAddress(),
              full_name: fc.string({ minLength: 2, maxLength: 100 }),
              role: fc.constantFrom(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
              is_active: fc.boolean(),
              created_at: fc.date(),
              updated_at: fc.date(),
              last_login: fc.option(fc.date(), { nil: null }),
            }),
            { minLength: 0, maxLength: 50 },
          ),
          async (filterRole, allUsers) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            // Filter users to only include those with the specified role
            const filteredUsers = allUsers.filter((user) => user.role === filterRole);

            jest.spyOn(prismaService.users, 'findMany').mockResolvedValue(filteredUsers);

            // Call the service method with role filter
            const result = await adminService.getAllUsers(filterRole);

            // Verify all returned users have the specified role
            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
            result.forEach((user) => {
              expect(user.role).toBe(filterRole);
            });

            // Verify the correct query was made with role filter
            expect(prismaService.users.findMany).toHaveBeenCalledWith({
              where: { role: filterRole },
              select: {
                id: true,
                email: true,
                full_name: true,
                role: true,
                is_active: true,
                created_at: true,
                updated_at: true,
                last_login: true,
              },
              orderBy: {
                created_at: 'desc',
              },
            });
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should handle empty results when no users match the role filter (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
          async (filterRole) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            // Mock empty result
            jest.spyOn(prismaService.users, 'findMany').mockResolvedValue([]);

            // Call the service method with role filter
            const result = await adminService.getAllUsers(filterRole);

            // Verify empty array is returned
            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(0);

            // Verify the correct query was made
            expect(prismaService.users.findMany).toHaveBeenCalledWith({
              where: { role: filterRole },
              select: {
                id: true,
                email: true,
                full_name: true,
                role: true,
                is_active: true,
                created_at: true,
                updated_at: true,
                last_login: true,
              },
              orderBy: {
                created_at: 'desc',
              },
            });
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 46: Admin Analytics Data Aggregation
   * 
   * For any admin analytics request, the response SHALL include total user counts by role,
   * total job postings, active job count, total application count, and application status distribution.
   * 
   * **Validates: Requirements 23.1, 23.2, 23.3**
   */
  describe('Property 46: Admin analytics data aggregation', () => {
    it('should return complete analytics with all required fields (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.nat({ max: 1000 }), // candidateCount
          fc.nat({ max: 1000 }), // recruiterCount
          fc.nat({ max: 1000 }), // adminCount
          fc.nat({ max: 1000 }), // totalJobs
          fc.nat({ max: 1000 }), // activeJobs
          fc.nat({ max: 1000 }), // totalApplications
          fc.nat({ max: 1000 }), // appliedCount
          fc.nat({ max: 1000 }), // reviewingCount
          fc.nat({ max: 1000 }), // acceptedCount
          fc.nat({ max: 1000 }), // rejectedCount
          fc.array(fc.date(), { minLength: 0, maxLength: 30 }), // recentUserDates
          fc.array(fc.date(), { minLength: 0, maxLength: 30 }), // recentJobDates
          async (
            candidateCount,
            recruiterCount,
            adminCount,
            totalJobs,
            activeJobs,
            totalApplications,
            appliedCount,
            reviewingCount,
            acceptedCount,
            rejectedCount,
            recentUserDates,
            recentJobDates,
          ) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            // Ensure activeJobs doesn't exceed totalJobs
            const actualActiveJobs = Math.min(activeJobs, totalJobs);

            // Mock user counts
            jest
              .spyOn(prismaService.users, 'count')
              .mockResolvedValueOnce(candidateCount)
              .mockResolvedValueOnce(recruiterCount)
              .mockResolvedValueOnce(adminCount);

            // Mock job counts
            jest
              .spyOn(prismaService.jobs, 'count')
              .mockResolvedValueOnce(totalJobs)
              .mockResolvedValueOnce(actualActiveJobs);

            // Mock application counts
            jest
              .spyOn(prismaService.applications, 'count')
              .mockResolvedValueOnce(totalApplications)
              .mockResolvedValueOnce(appliedCount)
              .mockResolvedValueOnce(reviewingCount)
              .mockResolvedValueOnce(acceptedCount)
              .mockResolvedValueOnce(rejectedCount);

            // Mock recent users
            const recentUsers = recentUserDates.map((date) => ({ created_at: date }));
            jest.spyOn(prismaService.users, 'findMany').mockResolvedValue(recentUsers);

            // Mock recent jobs
            const recentJobs = recentJobDates.map((date) => ({ created_at: date }));
            jest.spyOn(prismaService.jobs, 'findMany').mockResolvedValue(recentJobs);

            // Call the service method
            const result = await adminService.getPlatformAnalytics();

            // Verify the response structure and required fields
            expect(result).toBeDefined();

            // Verify user counts by role (Requirement 23.1)
            expect(result.users).toBeDefined();
            expect(result.users.total).toBe(candidateCount + recruiterCount + adminCount);
            expect(result.users.by_role).toBeDefined();
            expect(result.users.by_role.candidates).toBe(candidateCount);
            expect(result.users.by_role.recruiters).toBe(recruiterCount);
            expect(result.users.by_role.admins).toBe(adminCount);

            // Verify job counts (Requirement 23.2)
            expect(result.jobs).toBeDefined();
            expect(result.jobs.total).toBe(totalJobs);
            expect(result.jobs.active).toBe(actualActiveJobs);
            expect(result.jobs.closed).toBe(totalJobs - actualActiveJobs);

            // Verify application counts and status distribution (Requirement 23.3)
            expect(result.applications).toBeDefined();
            expect(result.applications.total).toBe(totalApplications);
            expect(result.applications.by_status).toBeDefined();
            expect(result.applications.by_status.applied).toBe(appliedCount);
            expect(result.applications.by_status.reviewing).toBe(reviewingCount);
            expect(result.applications.by_status.accepted).toBe(acceptedCount);
            expect(result.applications.by_status.rejected).toBe(rejectedCount);

            // Verify trends are included
            expect(result.trends).toBeDefined();
            expect(result.trends.user_registrations).toBeDefined();
            expect(result.trends.user_registrations.last_30_days).toBeDefined();
            expect(typeof result.trends.user_registrations.last_30_days).toBe('object');
            expect(result.trends.job_postings).toBeDefined();
            expect(result.trends.job_postings.last_30_days).toBeDefined();
            expect(typeof result.trends.job_postings.last_30_days).toBe('object');

            // Verify all application count calls included deleted_at: null filter
            const applicationCountCalls = (prismaService.applications.count as jest.Mock).mock.calls;
            applicationCountCalls.forEach((call) => {
              expect(call[0].where).toHaveProperty('deleted_at', null);
            });
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should handle zero counts gracefully (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(fc.constant(null), async () => {
          // Clear all mocks before each iteration
          jest.clearAllMocks();

          // Mock all counts as zero
          jest.spyOn(prismaService.users, 'count').mockResolvedValue(0);
          jest.spyOn(prismaService.jobs, 'count').mockResolvedValue(0);
          jest.spyOn(prismaService.applications, 'count').mockResolvedValue(0);
          jest.spyOn(prismaService.users, 'findMany').mockResolvedValue([]);
          jest.spyOn(prismaService.jobs, 'findMany').mockResolvedValue([]);

          // Call the service method
          const result = await adminService.getPlatformAnalytics();

          // Verify all counts are zero
          expect(result.users.total).toBe(0);
          expect(result.users.by_role.candidates).toBe(0);
          expect(result.users.by_role.recruiters).toBe(0);
          expect(result.users.by_role.admins).toBe(0);
          expect(result.jobs.total).toBe(0);
          expect(result.jobs.active).toBe(0);
          expect(result.jobs.closed).toBe(0);
          expect(result.applications.total).toBe(0);
          expect(result.applications.by_status.applied).toBe(0);
          expect(result.applications.by_status.reviewing).toBe(0);
          expect(result.applications.by_status.accepted).toBe(0);
          expect(result.applications.by_status.rejected).toBe(0);

          // Verify trends are still present (empty objects)
          expect(result.trends.user_registrations.last_30_days).toBeDefined();
          expect(result.trends.job_postings.last_30_days).toBeDefined();
        }),
        { numRuns: 100 },
      );
    });

    it('should correctly aggregate user registrations by day (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }), {
            minLength: 0,
            maxLength: 100,
          }),
          async (dates) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            // Mock counts
            jest.spyOn(prismaService.users, 'count').mockResolvedValue(0);
            jest.spyOn(prismaService.jobs, 'count').mockResolvedValue(0);
            jest.spyOn(prismaService.applications, 'count').mockResolvedValue(0);

            // Mock recent users with the generated dates
            const recentUsers = dates.map((date) => ({ created_at: date }));
            jest.spyOn(prismaService.users, 'findMany').mockResolvedValue(recentUsers);
            jest.spyOn(prismaService.jobs, 'findMany').mockResolvedValue([]);

            // Call the service method
            const result = await adminService.getPlatformAnalytics();

            // Manually calculate expected grouping (skip invalid dates)
            const expectedGrouping: Record<string, number> = {};
            dates.forEach((date) => {
              if (!date || isNaN(date.getTime())) {
                return;
              }
              const day = date.toISOString().split('T')[0];
              expectedGrouping[day] = (expectedGrouping[day] || 0) + 1;
            });

            // Verify the grouping matches
            const actualGrouping = result.trends.user_registrations.last_30_days;
            expect(actualGrouping).toEqual(expectedGrouping);

            // Verify total count matches (excluding invalid dates)
            const totalInTrends = Object.values(actualGrouping).reduce((sum, count) => sum + count, 0);
            const validDatesCount = dates.filter((date) => date && !isNaN(date.getTime())).length;
            expect(totalInTrends).toBe(validDatesCount);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should correctly aggregate job postings by day (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }), {
            minLength: 0,
            maxLength: 100,
          }),
          async (dates) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            // Mock counts
            jest.spyOn(prismaService.users, 'count').mockResolvedValue(0);
            jest.spyOn(prismaService.jobs, 'count').mockResolvedValue(0);
            jest.spyOn(prismaService.applications, 'count').mockResolvedValue(0);

            // Mock recent jobs with the generated dates
            jest.spyOn(prismaService.users, 'findMany').mockResolvedValue([]);
            const recentJobs = dates.map((date) => ({ created_at: date }));
            jest.spyOn(prismaService.jobs, 'findMany').mockResolvedValue(recentJobs);

            // Call the service method
            const result = await adminService.getPlatformAnalytics();

            // Manually calculate expected grouping (skip invalid dates)
            const expectedGrouping: Record<string, number> = {};
            dates.forEach((date) => {
              if (!date || isNaN(date.getTime())) {
                return;
              }
              const day = date.toISOString().split('T')[0];
              expectedGrouping[day] = (expectedGrouping[day] || 0) + 1;
            });

            // Verify the grouping matches
            const actualGrouping = result.trends.job_postings.last_30_days;
            expect(actualGrouping).toEqual(expectedGrouping);

            // Verify total count matches (excluding invalid dates)
            const totalInTrends = Object.values(actualGrouping).reduce((sum, count) => sum + count, 0);
            const validDatesCount = dates.filter((date) => date && !isNaN(date.getTime())).length;
            expect(totalInTrends).toBe(validDatesCount);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
