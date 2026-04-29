import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AdminService', () => {
  let service: AdminService;
  let prismaService: PrismaService;

  const mockPrismaService = {
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
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllUsers', () => {
    it('should return all users when no role filter is provided', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'candidate@test.com',
          full_name: 'Test Candidate',
          role: 'CANDIDATE',
          is_active: true,
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
          last_login: new Date('2024-01-02'),
        },
        {
          id: 'user-2',
          email: 'recruiter@test.com',
          full_name: 'Test Recruiter',
          role: 'RECRUITER',
          is_active: true,
          created_at: new Date('2024-01-03'),
          updated_at: new Date('2024-01-03'),
          last_login: new Date('2024-01-04'),
        },
      ];

      mockPrismaService.users.findMany.mockResolvedValue(mockUsers);

      const result = await service.getAllUsers();

      expect(result).toHaveLength(2);
      expect(result[0].email).toBe('candidate@test.com');
      expect(result[1].email).toBe('recruiter@test.com');
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
    });

    it('should filter users by CANDIDATE role', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'candidate@test.com',
          full_name: 'Test Candidate',
          role: 'CANDIDATE',
          is_active: true,
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
          last_login: new Date('2024-01-02'),
        },
      ];

      mockPrismaService.users.findMany.mockResolvedValue(mockUsers);

      const result = await service.getAllUsers('CANDIDATE');

      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('CANDIDATE');
      expect(prismaService.users.findMany).toHaveBeenCalledWith({
        where: { role: 'CANDIDATE' },
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
    });

    it('should filter users by RECRUITER role', async () => {
      const mockUsers = [
        {
          id: 'user-2',
          email: 'recruiter@test.com',
          full_name: 'Test Recruiter',
          role: 'RECRUITER',
          is_active: true,
          created_at: new Date('2024-01-03'),
          updated_at: new Date('2024-01-03'),
          last_login: new Date('2024-01-04'),
        },
      ];

      mockPrismaService.users.findMany.mockResolvedValue(mockUsers);

      const result = await service.getAllUsers('RECRUITER');

      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('RECRUITER');
    });

    it('should filter users by ADMIN role', async () => {
      const mockUsers = [
        {
          id: 'user-3',
          email: 'admin@test.com',
          full_name: 'Test Admin',
          role: 'ADMIN',
          is_active: true,
          created_at: new Date('2024-01-05'),
          updated_at: new Date('2024-01-05'),
          last_login: new Date('2024-01-06'),
        },
      ];

      mockPrismaService.users.findMany.mockResolvedValue(mockUsers);

      const result = await service.getAllUsers('ADMIN');

      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('ADMIN');
    });

    it('should return empty array when no users match filter', async () => {
      mockPrismaService.users.findMany.mockResolvedValue([]);

      const result = await service.getAllUsers('ADMIN');

      expect(result).toEqual([]);
    });
  });

  describe('getPlatformAnalytics', () => {
    it('should return complete platform analytics', async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Mock user counts
      mockPrismaService.users.count
        .mockResolvedValueOnce(10) // candidates
        .mockResolvedValueOnce(5) // recruiters
        .mockResolvedValueOnce(2); // admins

      // Mock job counts
      mockPrismaService.jobs.count
        .mockResolvedValueOnce(20) // total jobs
        .mockResolvedValueOnce(15); // active jobs

      // Mock application counts
      mockPrismaService.applications.count
        .mockResolvedValueOnce(50) // total applications
        .mockResolvedValueOnce(20) // applied
        .mockResolvedValueOnce(15) // reviewing
        .mockResolvedValueOnce(10) // accepted
        .mockResolvedValueOnce(5); // rejected

      // Mock recent users
      mockPrismaService.users.findMany.mockResolvedValue([
        { created_at: new Date('2024-01-01') },
        { created_at: new Date('2024-01-01') },
        { created_at: new Date('2024-01-02') },
      ]);

      // Mock recent jobs
      mockPrismaService.jobs.findMany.mockResolvedValue([
        { created_at: new Date('2024-01-01') },
        { created_at: new Date('2024-01-03') },
      ]);

      const result = await service.getPlatformAnalytics();

      expect(result).toBeDefined();
      expect(result.users.total).toBe(17);
      expect(result.users.by_role.candidates).toBe(10);
      expect(result.users.by_role.recruiters).toBe(5);
      expect(result.users.by_role.admins).toBe(2);

      expect(result.jobs.total).toBe(20);
      expect(result.jobs.active).toBe(15);
      expect(result.jobs.closed).toBe(5);

      expect(result.applications.total).toBe(50);
      expect(result.applications.by_status.applied).toBe(20);
      expect(result.applications.by_status.reviewing).toBe(15);
      expect(result.applications.by_status.accepted).toBe(10);
      expect(result.applications.by_status.rejected).toBe(5);

      expect(result.trends.user_registrations.last_30_days).toBeDefined();
      expect(result.trends.job_postings.last_30_days).toBeDefined();
    });

    it('should handle zero counts gracefully', async () => {
      // Mock all counts as zero
      mockPrismaService.users.count.mockResolvedValue(0);
      mockPrismaService.jobs.count.mockResolvedValue(0);
      mockPrismaService.applications.count.mockResolvedValue(0);
      mockPrismaService.users.findMany.mockResolvedValue([]);
      mockPrismaService.jobs.findMany.mockResolvedValue([]);

      const result = await service.getPlatformAnalytics();

      expect(result.users.total).toBe(0);
      expect(result.jobs.total).toBe(0);
      expect(result.applications.total).toBe(0);
    });

    it('should group user registrations by day correctly', async () => {
      mockPrismaService.users.count.mockResolvedValue(0);
      mockPrismaService.jobs.count.mockResolvedValue(0);
      mockPrismaService.applications.count.mockResolvedValue(0);

      const date1 = new Date('2024-01-01T10:00:00Z');
      const date2 = new Date('2024-01-01T15:00:00Z');
      const date3 = new Date('2024-01-02T10:00:00Z');

      mockPrismaService.users.findMany.mockResolvedValue([
        { created_at: date1 },
        { created_at: date2 },
        { created_at: date3 },
      ]);

      mockPrismaService.jobs.findMany.mockResolvedValue([]);

      const result = await service.getPlatformAnalytics();

      const userTrends = result.trends.user_registrations.last_30_days;
      expect(userTrends['2024-01-01']).toBe(2);
      expect(userTrends['2024-01-02']).toBe(1);
    });

    it('should group job postings by day correctly', async () => {
      mockPrismaService.users.count.mockResolvedValue(0);
      mockPrismaService.jobs.count.mockResolvedValue(0);
      mockPrismaService.applications.count.mockResolvedValue(0);
      mockPrismaService.users.findMany.mockResolvedValue([]);

      const date1 = new Date('2024-01-01T10:00:00Z');
      const date2 = new Date('2024-01-02T15:00:00Z');
      const date3 = new Date('2024-01-02T20:00:00Z');

      mockPrismaService.jobs.findMany.mockResolvedValue([
        { created_at: date1 },
        { created_at: date2 },
        { created_at: date3 },
      ]);

      const result = await service.getPlatformAnalytics();

      const jobTrends = result.trends.job_postings.last_30_days;
      expect(jobTrends['2024-01-01']).toBe(1);
      expect(jobTrends['2024-01-02']).toBe(2);
    });

    it('should exclude soft-deleted applications from counts', async () => {
      mockPrismaService.users.count.mockResolvedValue(0);
      mockPrismaService.jobs.count.mockResolvedValue(0);
      mockPrismaService.users.findMany.mockResolvedValue([]);
      mockPrismaService.jobs.findMany.mockResolvedValue([]);

      // All application count calls should include deleted_at: null filter
      mockPrismaService.applications.count.mockResolvedValue(10);

      const result = await service.getPlatformAnalytics();

      // Verify that all application count calls included the deleted_at filter
      expect(prismaService.applications.count).toHaveBeenCalledWith({
        where: { deleted_at: null },
      });
      expect(prismaService.applications.count).toHaveBeenCalledWith({
        where: { status: 'APPLIED', deleted_at: null },
      });
      expect(prismaService.applications.count).toHaveBeenCalledWith({
        where: { status: 'REVIEWING', deleted_at: null },
      });
      expect(prismaService.applications.count).toHaveBeenCalledWith({
        where: { status: 'ACCEPTED', deleted_at: null },
      });
      expect(prismaService.applications.count).toHaveBeenCalledWith({
        where: { status: 'REJECTED', deleted_at: null },
      });
    });
  });

  describe('getAllApplications', () => {
    it('should return all applications excluding soft-deleted by default', async () => {
      const mockApplications = [
        {
          id: 'app-1',
          candidate_id: 'candidate-1',
          job_id: 'job-1',
          cv_id: 'cv-1',
          status: 'APPLIED',
          deleted_at: null,
          created_at: new Date(),
          updated_at: new Date(),
          candidates: {
            id: 'candidate-1',
            users: { id: 'user-1', email: 'test@test.com', full_name: 'Test User' },
          },
          jobs: { id: 'job-1', companies: { id: 'company-1' } },
          cvs: { id: 'cv-1' },
        },
      ];

      mockPrismaService.applications.count.mockResolvedValue(1);
      mockPrismaService.applications.findMany.mockResolvedValue(mockApplications);

      const result = await service.getAllApplications(false, 1, 20);

      expect(result.data).toEqual(mockApplications);
      expect(result.pagination.total_count).toBe(1);
      expect(mockPrismaService.applications.count).toHaveBeenCalledWith({
        where: { deleted_at: null },
      });
      expect(mockPrismaService.applications.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deleted_at: null },
        }),
      );
    });

    it('should include soft-deleted applications when includeDeleted is true', async () => {
      const mockApplications = [
        {
          id: 'app-1',
          candidate_id: 'candidate-1',
          job_id: 'job-1',
          cv_id: 'cv-1',
          status: 'APPLIED',
          deleted_at: null,
          created_at: new Date(),
          updated_at: new Date(),
          candidates: {
            id: 'candidate-1',
            users: { id: 'user-1', email: 'test@test.com', full_name: 'Test User' },
          },
          jobs: { id: 'job-1', companies: { id: 'company-1' } },
          cvs: { id: 'cv-1' },
        },
        {
          id: 'app-2',
          candidate_id: 'candidate-2',
          job_id: 'job-2',
          cv_id: 'cv-2',
          status: 'APPLIED',
          deleted_at: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
          candidates: {
            id: 'candidate-2',
            users: { id: 'user-2', email: 'test2@test.com', full_name: 'Test User 2' },
          },
          jobs: { id: 'job-2', companies: { id: 'company-2' } },
          cvs: { id: 'cv-2' },
        },
      ];

      mockPrismaService.applications.count.mockResolvedValue(2);
      mockPrismaService.applications.findMany.mockResolvedValue(mockApplications);

      const result = await service.getAllApplications(true, 1, 20);

      expect(result.data).toEqual(mockApplications);
      expect(result.pagination.total_count).toBe(2);
      expect(mockPrismaService.applications.count).toHaveBeenCalledWith({
        where: {},
      });
      expect(mockPrismaService.applications.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        }),
      );
    });

    it('should support pagination', async () => {
      mockPrismaService.applications.count.mockResolvedValue(25);
      mockPrismaService.applications.findMany.mockResolvedValue([]);

      const result = await service.getAllApplications(false, 2, 10);

      expect(result.pagination).toEqual({
        current_page: 2,
        per_page: 10,
        total_count: 25,
        total_pages: 3,
        has_next_page: true,
        has_previous_page: true,
      });
      expect(mockPrismaService.applications.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });
  });
});
