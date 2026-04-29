import { Test, TestingModule } from '@nestjs/testing';
import { RecruiterService } from './recruiter.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

/**
 * Unit Tests for Recruiter Profile Management
 * 
 * **Validates: Requirements 7.1-7.6**
 * 
 * These tests verify specific examples and edge cases for recruiter profile management.
 */
describe('RecruiterService', () => {
  let service: RecruiterService;
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

    service = module.get<RecruiterService>(RecruiterService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRecruiterProfile', () => {
    it('should return recruiter profile with user, company, and jobs', async () => {
      const mockRecruiter = {
        id: 'recruiter-1',
        user_id: 'user-1',
        created_at: new Date(),
        updated_at: new Date(),
        users: {
          id: 'user-1',
          email: 'recruiter@test.com',
          full_name: 'Test Recruiter',
          role: 'RECRUITER' as const,
          created_at: new Date(),
          updated_at: new Date(),
        },
        companies: {
          id: 'company-1',
          name: 'Test Company',
          description: 'A test company',
          website: 'https://test.com',
          industry: 'Technology',
          company_type: 'STARTUP' as const,
          location: 'San Francisco',
          recruiter_id: 'recruiter-1',
          created_at: new Date(),
          updated_at: new Date(),
          jobs: [
            {
              id: 'job-1',
              company_id: 'company-1',
              title: 'Software Engineer',
              description: 'A great job',
              location: 'San Francisco',
              salary_min: 100000,
              salary_max: 150000,
              job_type: 'Full-time',
              status: 'ACTIVE' as const,
              created_at: new Date(),
              updated_at: new Date(),
              applications: [],
            },
          ],
        },
      } as any;

      jest.spyOn(prismaService.recruiters, 'findUnique').mockResolvedValue(mockRecruiter);

      const result = await service.getRecruiterProfile('user-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('recruiter-1');
      expect(result.users).toBeDefined();
      expect(result.users.email).toBe('recruiter@test.com');
      expect(result.companies).toBeDefined();
      if (result.companies) {
        expect(result.companies.name).toBe('Test Company');
        expect(result.companies.jobs).toHaveLength(1);
      }

      expect(prismaService.recruiters.findUnique).toHaveBeenCalledWith({
        where: { user_id: 'user-1' },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              full_name: true,
              role: true,
              created_at: true,
              updated_at: true,
            },
          },
          companies: {
            include: {
              jobs: {
                include: {
                  applications: true,
                },
              },
            },
          },
        },
      });
    });

    it('should throw NotFoundException when recruiter profile does not exist', async () => {
      jest.spyOn(prismaService.recruiters, 'findUnique').mockResolvedValue(null);

      await expect(service.getRecruiterProfile('non-existent-user')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getRecruiterProfile('non-existent-user')).rejects.toThrow(
        'Recruiter profile not found',
      );
    });

    it('should return recruiter profile without company if not linked', async () => {
      const mockRecruiter = {
        id: 'recruiter-1',
        user_id: 'user-1',
        created_at: new Date(),
        updated_at: new Date(),
        users: {
          id: 'user-1',
          email: 'recruiter@test.com',
          full_name: 'Test Recruiter',
          role: 'RECRUITER' as const,
          created_at: new Date(),
          updated_at: new Date(),
        },
        companies: null,
      } as any;

      jest.spyOn(prismaService.recruiters, 'findUnique').mockResolvedValue(mockRecruiter);

      const result = await service.getRecruiterProfile('user-1');

      expect(result).toBeDefined();
      expect(result.companies).toBeNull();
    });
  });

  describe('getRecruiterById', () => {
    it('should return recruiter profile by recruiter ID', async () => {
      const mockRecruiter = {
        id: 'recruiter-1',
        user_id: 'user-1',
        created_at: new Date(),
        updated_at: new Date(),
        users: {
          id: 'user-1',
          email: 'recruiter@test.com',
          full_name: 'Test Recruiter',
          role: 'RECRUITER' as const,
          created_at: new Date(),
          updated_at: new Date(),
        },
        companies: {
          id: 'company-1',
          name: 'Test Company',
          description: 'A test company',
          website: 'https://test.com',
          industry: 'Technology',
          company_type: 'STARTUP' as const,
          location: 'San Francisco',
          recruiter_id: 'recruiter-1',
          created_at: new Date(),
          updated_at: new Date(),
          jobs: [],
        },
      } as any;

      jest.spyOn(prismaService.recruiters, 'findUnique').mockResolvedValue(mockRecruiter);

      const result = await service.getRecruiterById('recruiter-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('recruiter-1');
      expect(result.users).toBeDefined();
      expect(result.companies).toBeDefined();

      expect(prismaService.recruiters.findUnique).toHaveBeenCalledWith({
        where: { id: 'recruiter-1' },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              full_name: true,
              role: true,
              created_at: true,
              updated_at: true,
            },
          },
          companies: {
            include: {
              jobs: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException when recruiter does not exist', async () => {
      jest.spyOn(prismaService.recruiters, 'findUnique').mockResolvedValue(null);

      await expect(service.getRecruiterById('non-existent-recruiter')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getRecruiterById('non-existent-recruiter')).rejects.toThrow(
        'Recruiter not found',
      );
    });
  });

  describe('updateRecruiterProfile', () => {
    it('should update recruiter profile successfully', async () => {
      const mockRecruiter = {
        id: 'recruiter-1',
        user_id: 'user-1',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const updatedRecruiter = {
        id: 'recruiter-1',
        user_id: 'user-1',
        company_id: 'company-1',
        created_at: mockRecruiter.created_at,
        updated_at: new Date(),
        users: {
          id: 'user-1',
          email: 'recruiter@test.com',
          full_name: 'Test Recruiter',
          role: 'RECRUITER' as const,
          created_at: new Date(),
          updated_at: new Date(),
        },
        companies: {
          id: 'company-1',
          name: 'Test Company',
          description: 'A test company',
          website: 'https://test.com',
          industry: 'Technology',
          company_type: 'STARTUP' as const,
          location: 'San Francisco',
          recruiter_id: 'recruiter-1',
          created_at: new Date(),
          updated_at: new Date(),
          jobs: [],
        },
      } as any;

      jest.spyOn(prismaService.recruiters, 'findUnique').mockResolvedValue(mockRecruiter);
      jest.spyOn(prismaService.recruiters, 'update').mockResolvedValue(updatedRecruiter);

      const result = await service.updateRecruiterProfile('user-1', 'recruiter-1', {
        company_id: 'company-1',
      });

      expect(result).toBeDefined();
      expect((result as any).company_id).toBe('company-1');
      expect(result.companies).toBeDefined();
      if (result.companies) {
        expect(result.companies.name).toBe('Test Company');
      }

      expect(prismaService.recruiters.update).toHaveBeenCalledWith({
        where: { id: 'recruiter-1' },
        data: {
          company_id: 'company-1',
          updated_at: expect.any(Date),
        },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              full_name: true,
              role: true,
              created_at: true,
              updated_at: true,
            },
          },
          companies: {
            include: {
              jobs: {
                include: {
                  applications: true,
                },
              },
            },
          },
        },
      });
    });

    it('should throw NotFoundException when recruiter profile does not exist', async () => {
      jest.spyOn(prismaService.recruiters, 'findUnique').mockResolvedValue(null);

      await expect(
        service.updateRecruiterProfile('user-1', 'non-existent-recruiter', {
          company_id: 'company-1',
        }),
      ).rejects.toThrow(NotFoundException);

      await expect(
        service.updateRecruiterProfile('user-1', 'non-existent-recruiter', {
          company_id: 'company-1',
        }),
      ).rejects.toThrow('Recruiter profile not found');
    });

    it('should throw ForbiddenException when user does not own the profile', async () => {
      const mockRecruiter = {
        id: 'recruiter-1',
        user_id: 'user-2', // Different user
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(prismaService.recruiters, 'findUnique').mockResolvedValue(mockRecruiter);

      await expect(
        service.updateRecruiterProfile('user-1', 'recruiter-1', {
          company_id: 'company-1',
        }),
      ).rejects.toThrow(ForbiddenException);

      await expect(
        service.updateRecruiterProfile('user-1', 'recruiter-1', {
          company_id: 'company-1',
        }),
      ).rejects.toThrow('You do not have permission to update this profile');

      expect(prismaService.recruiters.update).not.toHaveBeenCalled();
    });

    it('should update recruiter profile with empty update DTO', async () => {
      const mockRecruiter = {
        id: 'recruiter-1',
        user_id: 'user-1',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const updatedRecruiter = {
        ...mockRecruiter,
        updated_at: new Date(),
        users: {
          id: 'user-1',
          email: 'recruiter@test.com',
          full_name: 'Test Recruiter',
          role: 'RECRUITER' as const,
          created_at: new Date(),
          updated_at: new Date(),
        },
        companies: null,
      } as any;

      jest.spyOn(prismaService.recruiters, 'findUnique').mockResolvedValue(mockRecruiter);
      jest.spyOn(prismaService.recruiters, 'update').mockResolvedValue(updatedRecruiter);

      const result = await service.updateRecruiterProfile('user-1', 'recruiter-1', {});

      expect(result).toBeDefined();
      expect(result.id).toBe('recruiter-1');

      expect(prismaService.recruiters.update).toHaveBeenCalledWith({
        where: { id: 'recruiter-1' },
        data: {
          updated_at: expect.any(Date),
        },
        include: expect.any(Object),
      });
    });
  });
});
