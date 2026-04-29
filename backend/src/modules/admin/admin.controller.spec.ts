import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

describe('AdminController', () => {
  let controller: AdminController;
  let service: AdminService;

  const mockAdminService = {
    getAllUsers: jest.fn(),
    getPlatformAnalytics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    service = module.get<AdminService>(AdminService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUsers', () => {
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

      mockAdminService.getAllUsers.mockResolvedValue(mockUsers);

      const result = await controller.getUsers();

      expect(result).toEqual(mockUsers);
      expect(service.getAllUsers).toHaveBeenCalledWith(undefined);
    });

    it('should return filtered users when role is provided', async () => {
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

      mockAdminService.getAllUsers.mockResolvedValue(mockUsers);

      const result = await controller.getUsers('CANDIDATE');

      expect(result).toEqual(mockUsers);
      expect(service.getAllUsers).toHaveBeenCalledWith('CANDIDATE');
    });

    it('should handle RECRUITER role filter', async () => {
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

      mockAdminService.getAllUsers.mockResolvedValue(mockUsers);

      const result = await controller.getUsers('RECRUITER');

      expect(result).toEqual(mockUsers);
      expect(service.getAllUsers).toHaveBeenCalledWith('RECRUITER');
    });

    it('should handle ADMIN role filter', async () => {
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

      mockAdminService.getAllUsers.mockResolvedValue(mockUsers);

      const result = await controller.getUsers('ADMIN');

      expect(result).toEqual(mockUsers);
      expect(service.getAllUsers).toHaveBeenCalledWith('ADMIN');
    });

    it('should return empty array when no users match filter', async () => {
      mockAdminService.getAllUsers.mockResolvedValue([]);

      const result = await controller.getUsers('ADMIN');

      expect(result).toEqual([]);
    });
  });

  describe('getAnalytics', () => {
    it('should return platform analytics', async () => {
      const mockAnalytics = {
        users: {
          total: 17,
          by_role: {
            candidates: 10,
            recruiters: 5,
            admins: 2,
          },
        },
        jobs: {
          total: 20,
          active: 15,
          closed: 5,
        },
        applications: {
          total: 50,
          by_status: {
            applied: 20,
            reviewing: 15,
            accepted: 10,
            rejected: 5,
          },
        },
        trends: {
          user_registrations: {
            last_30_days: {
              '2024-01-01': 2,
              '2024-01-02': 1,
            },
          },
          job_postings: {
            last_30_days: {
              '2024-01-01': 1,
              '2024-01-02': 2,
            },
          },
        },
      };

      mockAdminService.getPlatformAnalytics.mockResolvedValue(mockAnalytics);

      const result = await controller.getAnalytics();

      expect(result).toEqual(mockAnalytics);
      expect(service.getPlatformAnalytics).toHaveBeenCalled();
    });

    it('should handle empty analytics data', async () => {
      const mockAnalytics = {
        users: {
          total: 0,
          by_role: {
            candidates: 0,
            recruiters: 0,
            admins: 0,
          },
        },
        jobs: {
          total: 0,
          active: 0,
          closed: 0,
        },
        applications: {
          total: 0,
          by_status: {
            applied: 0,
            reviewing: 0,
            accepted: 0,
            rejected: 0,
          },
        },
        trends: {
          user_registrations: {
            last_30_days: {},
          },
          job_postings: {
            last_30_days: {},
          },
        },
      };

      mockAdminService.getPlatformAnalytics.mockResolvedValue(mockAnalytics);

      const result = await controller.getAnalytics();

      expect(result).toEqual(mockAnalytics);
      expect(result.users.total).toBe(0);
      expect(result.jobs.total).toBe(0);
      expect(result.applications.total).toBe(0);
    });
  });
});
