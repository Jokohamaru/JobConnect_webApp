import { Test, TestingModule } from '@nestjs/testing';
import { RecruiterController } from './recruiter.controller';
import { RecruiterService } from './recruiter.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';

/**
 * Unit Tests for Recruiter Controller
 * 
 * **Validates: Requirements 7.1-7.6**
 * 
 * These tests verify the recruiter controller endpoints work correctly.
 */
describe('RecruiterController', () => {
  let controller: RecruiterController;
  let service: RecruiterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecruiterController],
      providers: [
        {
          provide: RecruiterService,
          useValue: {
            getRecruiterProfile: jest.fn(),
            updateRecruiterProfile: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<RecruiterController>(RecruiterController);
    service = module.get<RecruiterService>(RecruiterService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /recruiters/me', () => {
    it('should return authenticated recruiter profile', async () => {
      const mockUser = {
        userId: 'user-1',
        email: 'recruiter@test.com',
        role: 'RECRUITER',
      };

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

      jest.spyOn(service, 'getRecruiterProfile').mockResolvedValue(mockRecruiter);

      const result = await controller.getMyProfile(mockUser);

      expect(result).toBeDefined();
      expect(result.id).toBe('recruiter-1');
      expect(result.users.email).toBe('recruiter@test.com');
      expect(result.companies).toBeDefined();

      expect(service.getRecruiterProfile).toHaveBeenCalledWith('user-1');
    });

    it('should return recruiter profile without company if not linked', async () => {
      const mockUser = {
        userId: 'user-1',
        email: 'recruiter@test.com',
        role: 'RECRUITER',
      };

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

      jest.spyOn(service, 'getRecruiterProfile').mockResolvedValue(mockRecruiter);

      const result = await controller.getMyProfile(mockUser);

      expect(result).toBeDefined();
      expect(result.companies).toBeNull();
    });
  });

  describe('PATCH /recruiters/me', () => {
    it('should update authenticated recruiter profile', async () => {
      const mockUser = {
        userId: 'user-1',
        email: 'recruiter@test.com',
        role: 'RECRUITER',
      };

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

      const updatedRecruiter = {
        ...mockRecruiter,
        company_id: 'company-1',
        updated_at: new Date(),
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

      jest.spyOn(service, 'getRecruiterProfile').mockResolvedValue(mockRecruiter);
      jest.spyOn(service, 'updateRecruiterProfile').mockResolvedValue(updatedRecruiter);

      const updateDto = { company_id: 'company-1' };
      const result = await controller.updateMyProfile(mockUser, updateDto);

      expect(result).toBeDefined();
      expect((result as any).company_id).toBe('company-1');
      expect(result.companies).toBeDefined();

      expect(service.getRecruiterProfile).toHaveBeenCalledWith('user-1');
      expect(service.updateRecruiterProfile).toHaveBeenCalledWith(
        'user-1',
        'recruiter-1',
        updateDto,
      );
    });

    it('should update recruiter profile with empty DTO', async () => {
      const mockUser = {
        userId: 'user-1',
        email: 'recruiter@test.com',
        role: 'RECRUITER',
      };

      const mockRecruiter = {
        id: 'recruiter-1',
        user_id: 'user-1',
        created_at: new Date(),
        updated_at: new Date(),
        users: {
          id: 'user-1',
          email: 'recruiter@test.com',
          full_name: 'Test Recruiter',
          role: 'RECRUITER',
          created_at: new Date(),
          updated_at: new Date(),
        },
        companies: null,
      };

      jest.spyOn(service, 'getRecruiterProfile').mockResolvedValue(mockRecruiter as any);
      jest.spyOn(service, 'updateRecruiterProfile').mockResolvedValue(mockRecruiter as any);

      const updateDto = {};
      const result = await controller.updateMyProfile(mockUser, updateDto);

      expect(result).toBeDefined();
      expect(result.id).toBe('recruiter-1');

      expect(service.updateRecruiterProfile).toHaveBeenCalledWith(
        'user-1',
        'recruiter-1',
        updateDto,
      );
    });
  });
});
