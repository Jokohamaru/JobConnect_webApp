import { Test, TestingModule } from '@nestjs/testing';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { CompanyType } from '@prisma/client';

/**
 * Unit Tests for Company Controller
 *
 * **Validates: Requirements 7.1-7.6**
 *
 * These tests verify the controller endpoints for company management.
 */
describe('CompanyController', () => {
  let controller: CompanyController;
  let service: CompanyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyController],
      providers: [
        {
          provide: CompanyService,
          useValue: {
            createCompany: jest.fn(),
            getCompanyById: jest.fn(),
            updateCompany: jest.fn(),
            getCompanyJobs: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CompanyController>(CompanyController);
    service = module.get<CompanyService>(CompanyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCompany', () => {
    it('should create a company', async () => {
      const user = { userId: 'user-1', email: 'recruiter@test.com', role: 'RECRUITER' };
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

      jest.spyOn(service, 'createCompany').mockResolvedValue(mockCompany as any);

      const result = await controller.createCompany(user, createDto);

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Company');
      expect(service.createCompany).toHaveBeenCalledWith('user-1', createDto);
    });
  });

  describe('getCompany', () => {
    it('should return company details', async () => {
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
        applicationCounts: 0,
      };

      jest.spyOn(service, 'getCompanyById').mockResolvedValue(mockCompany as any);

      const result = await controller.getCompany('company-1');

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Company');
      expect(service.getCompanyById).toHaveBeenCalledWith('company-1');
    });
  });

  describe('updateCompany', () => {
    it('should update company', async () => {
      const user = { userId: 'user-1', email: 'recruiter@test.com', role: 'RECRUITER' };
      const updateDto = {
        name: 'Updated Company',
        description: 'Updated description',
      };

      const mockCompany = {
        id: 'company-1',
        name: 'Updated Company',
        description: 'Updated description',
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

      jest.spyOn(service, 'updateCompany').mockResolvedValue(mockCompany as any);

      const result = await controller.updateCompany(user, 'company-1', updateDto);

      expect(result).toBeDefined();
      expect(result.name).toBe('Updated Company');
      expect(service.updateCompany).toHaveBeenCalledWith('user-1', 'company-1', updateDto);
    });
  });

  describe('getCompanyJobs', () => {
    it('should return company jobs', async () => {
      const mockJobs = [
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
          job_skills: [],
          job_tags: [],
          applications: [],
        },
      ];

      jest.spyOn(service, 'getCompanyJobs').mockResolvedValue(mockJobs as any);

      const result = await controller.getCompanyJobs('company-1');

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Software Engineer');
      expect(service.getCompanyJobs).toHaveBeenCalledWith('company-1');
    });
  });
});
