import { Test, TestingModule } from '@nestjs/testing';
import { CompanyService } from './company.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { CompanyType } from '@prisma/client';

/**
 * Unit Tests for Company Management
 *
 * **Validates: Requirements 7.1-7.6**
 *
 * These tests verify specific examples and edge cases for company management.
 */
describe('CompanyService', () => {
  let service: CompanyService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        {
          provide: PrismaService,
          useValue: {
            recruiters: {
              findUnique: jest.fn(),
            },
            companies: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            jobs: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CompanyService>(CompanyService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCompany', () => {
    it('should create a company linked to recruiter', async () => {
      const mockRecruiter = {
        id: 'recruiter-1',
        user_id: 'user-1',
        created_at: new Date(),
        updated_at: new Date(),
        companies: null,
      };

      const createDto = {
        name: 'Test Company',
        description: 'A test company',
        website: 'https://test.com',
        industry: 'Technology',
        company_type: CompanyType.STARTUP,
        location: 'San Francisco',
      };

      const mockCompany = {
        id: 'company-1',
        ...createDto,
        recruiter_id: 'recruiter-1',
        created_at: new Date(),
        updated_at: new Date(),
        recruiters: {
          id: 'recruiter-1',
          user_id: 'user-1',
          created_at: new Date(),
          updated_at: new Date(),
          users: {
            id: 'user-1',
            email: 'recruiter@test.com',
            full_name: 'Test Recruiter',
            role: 'RECRUITER' as const,
          },
        },
      };

      jest
        .spyOn(prismaService.recruiters, 'findUnique')
        .mockResolvedValue(mockRecruiter as any);
      jest
        .spyOn(prismaService.companies, 'create')
        .mockResolvedValue(mockCompany as any);

      const result = await service.createCompany('user-1', createDto);

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Company');
      expect(result.recruiter_id).toBe('recruiter-1');
      expect(result.recruiters).toBeDefined();

      expect(prismaService.companies.create).toHaveBeenCalledWith({
        data: {
          id: expect.any(String),
          name: createDto.name,
          description: createDto.description,
          website: createDto.website,
          industry: createDto.industry,
          company_type: createDto.company_type,
          location: createDto.location,
          recruiter_id: 'recruiter-1',
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
        },
        include: {
          recruiters: {
            include: {
              users: {
                select: {
                  id: true,
                  email: true,
                  full_name: true,
                  role: true,
                },
              },
            },
          },
        },
      });
    });

    it('should throw NotFoundException when recruiter profile does not exist', async () => {
      jest.spyOn(prismaService.recruiters, 'findUnique').mockResolvedValue(null);

      const createDto = {
        name: 'Test Company',
        industry: 'Technology',
        company_type: CompanyType.STARTUP,
        location: 'San Francisco',
      };

      await expect(
        service.createCompany('non-existent-user', createDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.createCompany('non-existent-user', createDto),
      ).rejects.toThrow('Recruiter profile not found');
    });

    it('should throw ConflictException when recruiter already has a company', async () => {
      const mockRecruiter = {
        id: 'recruiter-1',
        user_id: 'user-1',
        created_at: new Date(),
        updated_at: new Date(),
        companies: {
          id: 'existing-company',
          name: 'Existing Company',
        },
      };

      jest
        .spyOn(prismaService.recruiters, 'findUnique')
        .mockResolvedValue(mockRecruiter as any);

      const createDto = {
        name: 'Test Company',
        industry: 'Technology',
        company_type: CompanyType.STARTUP,
        location: 'San Francisco',
      };

      await expect(service.createCompany('user-1', createDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.createCompany('user-1', createDto)).rejects.toThrow(
        'Recruiter already has a company',
      );

      expect(prismaService.companies.create).not.toHaveBeenCalled();
    });
  });

  describe('getCompanyById', () => {
    it('should return company details with jobs and application counts', async () => {
      const mockCompany = {
        id: 'company-1',
        name: 'Test Company',
        description: 'A test company',
        website: 'https://test.com',
        industry: 'Technology',
        company_type: CompanyType.STARTUP,
        location: 'San Francisco',
        recruiter_id: 'recruiter-1',
        created_at: new Date(),
        updated_at: new Date(),
        recruiters: {
          id: 'recruiter-1',
          user_id: 'user-1',
          created_at: new Date(),
          updated_at: new Date(),
          users: {
            id: 'user-1',
            email: 'recruiter@test.com',
            full_name: 'Test Recruiter',
            role: 'RECRUITER' as const,
          },
        },
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
            applications: [{ id: 'app-1' }, { id: 'app-2' }],
          },
          {
            id: 'job-2',
            company_id: 'company-1',
            title: 'Product Manager',
            description: 'Another great job',
            location: 'San Francisco',
            salary_min: 120000,
            salary_max: 180000,
            job_type: 'Full-time',
            status: 'ACTIVE' as const,
            created_at: new Date(),
            updated_at: new Date(),
            applications: [{ id: 'app-3' }],
          },
        ],
      };

      jest
        .spyOn(prismaService.companies, 'findUnique')
        .mockResolvedValue(mockCompany as any);

      const result = await service.getCompanyById('company-1');

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Company');
      expect(result.jobs).toHaveLength(2);
      expect(result.applicationCounts).toBe(3); // 2 + 1 applications

      expect(prismaService.companies.findUnique).toHaveBeenCalledWith({
        where: { id: 'company-1' },
        include: {
          recruiters: {
            include: {
              users: {
                select: {
                  id: true,
                  email: true,
                  full_name: true,
                  role: true,
                },
              },
            },
          },
          jobs: {
            include: {
              applications: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException when company does not exist', async () => {
      jest.spyOn(prismaService.companies, 'findUnique').mockResolvedValue(null);

      await expect(service.getCompanyById('non-existent-company')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getCompanyById('non-existent-company')).rejects.toThrow(
        'Company not found',
      );
    });

    it('should return company with zero application counts when no jobs', async () => {
      const mockCompany = {
        id: 'company-1',
        name: 'Test Company',
        description: 'A test company',
        website: 'https://test.com',
        industry: 'Technology',
        company_type: CompanyType.STARTUP,
        location: 'San Francisco',
        recruiter_id: 'recruiter-1',
        created_at: new Date(),
        updated_at: new Date(),
        recruiters: {
          id: 'recruiter-1',
          user_id: 'user-1',
          created_at: new Date(),
          updated_at: new Date(),
          users: {
            id: 'user-1',
            email: 'recruiter@test.com',
            full_name: 'Test Recruiter',
            role: 'RECRUITER' as const,
          },
        },
        jobs: [],
      };

      jest
        .spyOn(prismaService.companies, 'findUnique')
        .mockResolvedValue(mockCompany as any);

      const result = await service.getCompanyById('company-1');

      expect(result).toBeDefined();
      expect(result.jobs).toHaveLength(0);
      expect(result.applicationCounts).toBe(0);
    });
  });

  describe('updateCompany', () => {
    it('should update company successfully', async () => {
      const mockCompany = {
        id: 'company-1',
        name: 'Test Company',
        description: 'A test company',
        website: 'https://test.com',
        industry: 'Technology',
        company_type: CompanyType.STARTUP,
        location: 'San Francisco',
        recruiter_id: 'recruiter-1',
        created_at: new Date(),
        updated_at: new Date(),
        recruiters: {
          id: 'recruiter-1',
          user_id: 'user-1',
          created_at: new Date(),
          updated_at: new Date(),
        },
      };

      const updatedCompany = {
        ...mockCompany,
        name: 'Updated Company',
        description: 'Updated description',
        updated_at: new Date(),
        recruiters: {
          ...mockCompany.recruiters,
          users: {
            id: 'user-1',
            email: 'recruiter@test.com',
            full_name: 'Test Recruiter',
            role: 'RECRUITER' as const,
          },
        },
        jobs: [],
      };

      jest
        .spyOn(prismaService.companies, 'findUnique')
        .mockResolvedValue(mockCompany as any);
      jest
        .spyOn(prismaService.companies, 'update')
        .mockResolvedValue(updatedCompany as any);

      const updateDto = {
        name: 'Updated Company',
        description: 'Updated description',
      };

      const result = await service.updateCompany('user-1', 'company-1', updateDto);

      expect(result).toBeDefined();
      expect(result.name).toBe('Updated Company');
      expect(result.description).toBe('Updated description');

      expect(prismaService.companies.update).toHaveBeenCalledWith({
        where: { id: 'company-1' },
        data: {
          ...updateDto,
          updated_at: expect.any(Date),
        },
        include: {
          recruiters: {
            include: {
              users: {
                select: {
                  id: true,
                  email: true,
                  full_name: true,
                  role: true,
                },
              },
            },
          },
          jobs: {
            include: {
              applications: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException when company does not exist', async () => {
      jest.spyOn(prismaService.companies, 'findUnique').mockResolvedValue(null);

      const updateDto = {
        name: 'Updated Company',
      };

      await expect(
        service.updateCompany('user-1', 'non-existent-company', updateDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updateCompany('user-1', 'non-existent-company', updateDto),
      ).rejects.toThrow('Company not found');
    });

    it('should throw ForbiddenException when user does not own the company', async () => {
      const mockCompany = {
        id: 'company-1',
        name: 'Test Company',
        description: 'A test company',
        website: 'https://test.com',
        industry: 'Technology',
        company_type: CompanyType.STARTUP,
        location: 'San Francisco',
        recruiter_id: 'recruiter-1',
        created_at: new Date(),
        updated_at: new Date(),
        recruiters: {
          id: 'recruiter-1',
          user_id: 'user-2', // Different user
          created_at: new Date(),
          updated_at: new Date(),
        },
      };

      jest
        .spyOn(prismaService.companies, 'findUnique')
        .mockResolvedValue(mockCompany as any);

      const updateDto = {
        name: 'Updated Company',
      };

      await expect(
        service.updateCompany('user-1', 'company-1', updateDto),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.updateCompany('user-1', 'company-1', updateDto),
      ).rejects.toThrow('You do not have permission to update this company');

      expect(prismaService.companies.update).not.toHaveBeenCalled();
    });
  });

  describe('getCompanyJobs', () => {
    it('should return all jobs for a company', async () => {
      const mockCompany = {
        id: 'company-1',
        name: 'Test Company',
      };

      const mockJobs = [
        {
          id: 'job-2',
          company_id: 'company-1',
          title: 'Product Manager',
          description: 'Another great job',
          location: 'San Francisco',
          salary_min: 120000,
          salary_max: 180000,
          job_type: 'Full-time',
          status: 'ACTIVE' as const,
          created_at: new Date('2024-01-02'),
          updated_at: new Date('2024-01-02'),
          job_skills: [],
          job_tags: [],
          applications: [{ id: 'app-3' }],
        },
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
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
          job_skills: [
            {
              id: 'js-1',
              job_id: 'job-1',
              skill_id: 'skill-1',
              skills: { id: 'skill-1', name: 'JavaScript', created_at: new Date() },
            },
          ],
          job_tags: [
            {
              id: 'jt-1',
              job_id: 'job-1',
              tag_id: 'tag-1',
              tags: { id: 'tag-1', name: 'Remote', created_at: new Date() },
            },
          ],
          applications: [{ id: 'app-1' }, { id: 'app-2' }],
        },
      ];

      jest
        .spyOn(prismaService.companies, 'findUnique')
        .mockResolvedValue(mockCompany as any);
      jest.spyOn(prismaService.jobs, 'findMany').mockResolvedValue(mockJobs as any);

      const result = await service.getCompanyJobs('company-1');

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Product Manager'); // Most recent first
      expect(result[1].title).toBe('Software Engineer');

      expect(prismaService.jobs.findMany).toHaveBeenCalledWith({
        where: { company_id: 'company-1' },
        include: {
          job_skills: {
            include: {
              skills: true,
            },
          },
          job_tags: {
            include: {
              tags: true,
            },
          },
          applications: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    });

    it('should throw NotFoundException when company does not exist', async () => {
      jest.spyOn(prismaService.companies, 'findUnique').mockResolvedValue(null);

      await expect(service.getCompanyJobs('non-existent-company')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getCompanyJobs('non-existent-company')).rejects.toThrow(
        'Company not found',
      );
    });

    it('should return empty array when company has no jobs', async () => {
      const mockCompany = {
        id: 'company-1',
        name: 'Test Company',
      };

      jest
        .spyOn(prismaService.companies, 'findUnique')
        .mockResolvedValue(mockCompany as any);
      jest.spyOn(prismaService.jobs, 'findMany').mockResolvedValue([]);

      const result = await service.getCompanyJobs('company-1');

      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
    });
  });
});
