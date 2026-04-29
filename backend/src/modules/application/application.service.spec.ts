import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationService } from './application.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ApplicationStatus } from '@prisma/client';

describe('ApplicationService', () => {
  let service: ApplicationService;
  let prisma: PrismaService;

  const mockPrismaService = {
    candidates: {
      findUnique: jest.fn(),
    },
    jobs: {
      findUnique: jest.fn(),
    },
    cvs: {
      findUnique: jest.fn(),
    },
    applications: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    recruiters: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ApplicationService>(ApplicationService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createApplication', () => {
    const userId = 'user-123';
    const createDto = {
      job_id: 'job-123',
      cv_id: 'cv-123',
    };

    it('should create an application successfully', async () => {
      const mockCandidate = { id: 'candidate-123', user_id: userId };
      const mockJob = { id: 'job-123', status: 'ACTIVE' };
      const mockCv = { id: 'cv-123', candidate_id: 'candidate-123' };
      const mockApplication = {
        id: 'app-123',
        candidate_id: 'candidate-123',
        job_id: 'job-123',
        cv_id: 'cv-123',
        status: ApplicationStatus.APPLIED,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPrismaService.candidates.findUnique.mockResolvedValue(mockCandidate);
      mockPrismaService.jobs.findUnique.mockResolvedValue(mockJob);
      mockPrismaService.cvs.findUnique.mockResolvedValue(mockCv);
      mockPrismaService.applications.findUnique.mockResolvedValue(null);
      mockPrismaService.applications.create.mockResolvedValue(mockApplication);

      const result = await service.createApplication(userId, createDto);

      expect(result).toEqual(mockApplication);
      expect(mockPrismaService.applications.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if candidate not found', async () => {
      mockPrismaService.candidates.findUnique.mockResolvedValue(null);

      await expect(service.createApplication(userId, createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if job not found', async () => {
      const mockCandidate = { id: 'candidate-123', user_id: userId };
      mockPrismaService.candidates.findUnique.mockResolvedValue(mockCandidate);
      mockPrismaService.jobs.findUnique.mockResolvedValue(null);

      await expect(service.createApplication(userId, createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if job is not ACTIVE', async () => {
      const mockCandidate = { id: 'candidate-123', user_id: userId };
      const mockJob = { id: 'job-123', status: 'CLOSED' };

      mockPrismaService.candidates.findUnique.mockResolvedValue(mockCandidate);
      mockPrismaService.jobs.findUnique.mockResolvedValue(mockJob);

      await expect(service.createApplication(userId, createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException if duplicate application exists', async () => {
      const mockCandidate = { id: 'candidate-123', user_id: userId };
      const mockJob = { id: 'job-123', status: 'ACTIVE' };
      const mockCv = { id: 'cv-123', candidate_id: 'candidate-123' };
      const existingApplication = { id: 'app-existing' };

      mockPrismaService.candidates.findUnique.mockResolvedValue(mockCandidate);
      mockPrismaService.jobs.findUnique.mockResolvedValue(mockJob);
      mockPrismaService.cvs.findUnique.mockResolvedValue(mockCv);
      mockPrismaService.applications.findUnique.mockResolvedValue(
        existingApplication,
      );

      await expect(service.createApplication(userId, createDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ForbiddenException if CV does not belong to candidate', async () => {
      const mockCandidate = { id: 'candidate-123', user_id: userId };
      const mockJob = { id: 'job-123', status: 'ACTIVE' };
      const mockCv = { id: 'cv-123', candidate_id: 'other-candidate' };

      mockPrismaService.candidates.findUnique.mockResolvedValue(mockCandidate);
      mockPrismaService.jobs.findUnique.mockResolvedValue(mockJob);
      mockPrismaService.cvs.findUnique.mockResolvedValue(mockCv);

      await expect(service.createApplication(userId, createDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getApplications', () => {
    it('should return applications for candidate with pagination', async () => {
      const userId = 'user-123';
      const userRole = 'CANDIDATE';
      const mockCandidate = { id: 'candidate-123', user_id: userId };
      const mockApplications = [
        {
          id: 'app-123',
          candidate_id: 'candidate-123',
          status: 'APPLIED',
        },
      ];

      mockPrismaService.candidates.findUnique.mockResolvedValue(mockCandidate);
      mockPrismaService.applications.count = jest.fn().mockResolvedValue(1);
      mockPrismaService.applications.findMany.mockResolvedValue(
        mockApplications,
      );

      const result = await service.getApplications(userId, userRole);

      expect(result.data).toEqual(mockApplications);
      expect(result.pagination).toEqual({
        current_page: 1,
        per_page: 20,
        total_count: 1,
        total_pages: 1,
        has_next_page: false,
        has_previous_page: false,
      });
      expect(mockPrismaService.applications.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            candidate_id: 'candidate-123',
            deleted_at: null,
          }),
          skip: 0,
          take: 20,
        }),
      );
    });

    it('should return applications for recruiter with pagination', async () => {
      const userId = 'user-123';
      const userRole = 'RECRUITER';
      const mockRecruiter = {
        id: 'recruiter-123',
        user_id: userId,
        companies: { id: 'company-123' },
      };
      const mockApplications = [
        {
          id: 'app-123',
          status: 'APPLIED',
        },
      ];

      mockPrismaService.recruiters.findUnique.mockResolvedValue(mockRecruiter);
      mockPrismaService.applications.count = jest.fn().mockResolvedValue(1);
      mockPrismaService.applications.findMany.mockResolvedValue(
        mockApplications,
      );

      const result = await service.getApplications(userId, userRole);

      expect(result.data).toEqual(mockApplications);
      expect(result.pagination).toBeDefined();
    });

    it('should filter applications by status', async () => {
      const userId = 'user-123';
      const userRole = 'CANDIDATE';
      const status = 'REVIEWING';
      const mockCandidate = { id: 'candidate-123', user_id: userId };
      const mockApplications = [
        {
          id: 'app-123',
          status: 'REVIEWING',
        },
      ];

      mockPrismaService.candidates.findUnique.mockResolvedValue(mockCandidate);
      mockPrismaService.applications.count = jest.fn().mockResolvedValue(1);
      mockPrismaService.applications.findMany.mockResolvedValue(
        mockApplications,
      );

      const result = await service.getApplications(userId, userRole, status);

      expect(result.data).toEqual(mockApplications);
      expect(mockPrismaService.applications.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'REVIEWING',
          }),
        }),
      );
    });

    it('should filter recruiter applications by job_id', async () => {
      const userId = 'user-123';
      const userRole = 'RECRUITER';
      const jobId = 'job-123';
      const mockRecruiter = {
        id: 'recruiter-123',
        user_id: userId,
        companies: { id: 'company-123' },
      };
      const mockApplications = [
        {
          id: 'app-123',
          job_id: jobId,
          status: 'APPLIED',
        },
      ];

      mockPrismaService.recruiters.findUnique.mockResolvedValue(mockRecruiter);
      mockPrismaService.applications.count = jest.fn().mockResolvedValue(1);
      mockPrismaService.applications.findMany.mockResolvedValue(
        mockApplications,
      );

      const result = await service.getApplications(
        userId,
        userRole,
        undefined,
        jobId,
      );

      expect(result.data).toEqual(mockApplications);
      expect(mockPrismaService.applications.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            job_id: jobId,
          }),
        }),
      );
    });

    it('should support custom pagination parameters', async () => {
      const userId = 'user-123';
      const userRole = 'CANDIDATE';
      const page = 2;
      const perPage = 10;
      const mockCandidate = { id: 'candidate-123', user_id: userId };
      const mockApplications = [
        {
          id: 'app-123',
          candidate_id: 'candidate-123',
          status: 'APPLIED',
        },
      ];

      mockPrismaService.candidates.findUnique.mockResolvedValue(mockCandidate);
      mockPrismaService.applications.count = jest.fn().mockResolvedValue(25);
      mockPrismaService.applications.findMany.mockResolvedValue(
        mockApplications,
      );

      const result = await service.getApplications(
        userId,
        userRole,
        undefined,
        undefined,
        page,
        perPage,
      );

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
          skip: 10, // (page - 1) * perPage = (2 - 1) * 10
          take: 10,
        }),
      );
    });
  });

  describe('updateApplicationStatus', () => {
    const userId = 'user-123';
    const applicationId = 'app-123';

    it('should update application status from APPLIED to REVIEWING', async () => {
      const updateDto = { status: ApplicationStatus.REVIEWING };
      const mockApplication = {
        id: applicationId,
        status: ApplicationStatus.APPLIED,
        jobs: {
          companies: {
            recruiters: {
              user_id: userId,
            },
          },
        },
      };
      const updatedApplication = {
        ...mockApplication,
        status: ApplicationStatus.REVIEWING,
      };

      mockPrismaService.applications.findUnique.mockResolvedValue(
        mockApplication,
      );
      mockPrismaService.applications.update.mockResolvedValue(
        updatedApplication,
      );

      const result = await service.updateApplicationStatus(
        userId,
        applicationId,
        updateDto,
      );

      expect(result).toEqual(updatedApplication);
      expect(mockPrismaService.applications.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: applicationId },
          data: expect.objectContaining({
            status: ApplicationStatus.REVIEWING,
          }),
        }),
      );
    });

    it('should throw BadRequestException for invalid transition', async () => {
      const updateDto = { status: ApplicationStatus.REVIEWING };
      const mockApplication = {
        id: applicationId,
        status: ApplicationStatus.ACCEPTED, // Cannot transition from ACCEPTED
        jobs: {
          companies: {
            recruiters: {
              user_id: userId,
            },
          },
        },
      };

      mockPrismaService.applications.findUnique.mockResolvedValue(
        mockApplication,
      );

      await expect(
        service.updateApplicationStatus(userId, applicationId, updateDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if recruiter does not own the job', async () => {
      const updateDto = { status: ApplicationStatus.REVIEWING };
      const mockApplication = {
        id: applicationId,
        status: ApplicationStatus.APPLIED,
        jobs: {
          companies: {
            recruiters: {
              user_id: 'other-user',
            },
          },
        },
      };

      mockPrismaService.applications.findUnique.mockResolvedValue(
        mockApplication,
      );

      await expect(
        service.updateApplicationStatus(userId, applicationId, updateDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteApplication', () => {
    const userId = 'user-123';
    const applicationId = 'app-123';

    it('should soft delete an application', async () => {
      const mockCandidate = { id: 'candidate-123', user_id: userId };
      const mockApplication = {
        id: applicationId,
        candidate_id: 'candidate-123',
        candidates: mockCandidate,
      };

      mockPrismaService.applications.findUnique.mockResolvedValue(
        mockApplication,
      );
      mockPrismaService.candidates.findUnique.mockResolvedValue(mockCandidate);
      mockPrismaService.applications.update.mockResolvedValue({
        ...mockApplication,
        deleted_at: new Date(),
      });

      const result = await service.deleteApplication(userId, applicationId);

      expect(result).toEqual({ message: 'Application withdrawn successfully' });
      expect(mockPrismaService.applications.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: applicationId },
          data: expect.objectContaining({
            deleted_at: expect.any(Date),
          }),
        }),
      );
    });

    it('should throw ForbiddenException if candidate does not own the application', async () => {
      const mockCandidate = { id: 'candidate-123', user_id: userId };
      const mockApplication = {
        id: applicationId,
        candidate_id: 'other-candidate',
        candidates: { id: 'other-candidate' },
      };

      mockPrismaService.applications.findUnique.mockResolvedValue(
        mockApplication,
      );
      mockPrismaService.candidates.findUnique.mockResolvedValue(mockCandidate);

      await expect(
        service.deleteApplication(userId, applicationId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if application is already soft-deleted', async () => {
      const mockCandidate = { id: 'candidate-123', user_id: userId };
      const mockApplication = {
        id: applicationId,
        candidate_id: 'candidate-123',
        candidates: mockCandidate,
        deleted_at: new Date(),
      };

      mockPrismaService.applications.findUnique.mockResolvedValue(
        mockApplication,
      );
      mockPrismaService.candidates.findUnique.mockResolvedValue(mockCandidate);

      await expect(
        service.deleteApplication(userId, applicationId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('soft delete behavior', () => {
    const userId = 'user-123';
    const candidateId = 'candidate-123';
    const jobId = 'job-123';
    const cvId = 'cv-123';

    it('should allow reapplication after soft delete', async () => {
      const mockCandidate = { id: candidateId, user_id: userId };
      const mockJob = { id: jobId, status: 'ACTIVE' };
      const mockCv = { id: cvId, candidate_id: candidateId };
      const mockDeletedApplication = {
        id: 'old-app-123',
        candidate_id: candidateId,
        job_id: jobId,
        deleted_at: new Date(),
      };

      mockPrismaService.candidates.findUnique.mockResolvedValue(mockCandidate);
      mockPrismaService.jobs.findUnique.mockResolvedValue(mockJob);
      mockPrismaService.cvs.findUnique.mockResolvedValue(mockCv);
      mockPrismaService.applications.findUnique.mockResolvedValue(
        mockDeletedApplication,
      );
      mockPrismaService.applications.create.mockResolvedValue({
        id: 'new-app-123',
        candidate_id: candidateId,
        job_id: jobId,
        cv_id: cvId,
        status: 'APPLIED',
        deleted_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const result = await service.createApplication(userId, {
        job_id: jobId,
        cv_id: cvId,
      });

      expect(result).toBeDefined();
      expect(mockPrismaService.applications.create).toHaveBeenCalled();
    });

    it('should exclude soft-deleted applications from getApplicationById', async () => {
      const mockApplication = {
        id: 'app-123',
        candidate_id: candidateId,
        deleted_at: new Date(),
        candidates: {
          id: candidateId,
          users: { id: userId, email: 'test@test.com', full_name: 'Test User' },
        },
        jobs: {
          id: jobId,
          companies: {
            id: 'company-123',
            recruiters: { id: 'recruiter-123', user_id: 'recruiter-user-123' },
          },
        },
        cvs: { id: cvId },
      };

      mockPrismaService.applications.findUnique.mockResolvedValue(
        mockApplication,
      );

      await expect(
        service.getApplicationById(userId, 'CANDIDATE', 'app-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should exclude soft-deleted applications from updateApplicationStatus', async () => {
      const mockApplication = {
        id: 'app-123',
        candidate_id: candidateId,
        status: 'APPLIED',
        deleted_at: new Date(),
        jobs: {
          id: jobId,
          companies: {
            id: 'company-123',
            recruiters: { id: 'recruiter-123', user_id: userId },
          },
        },
      };

      mockPrismaService.applications.findUnique.mockResolvedValue(
        mockApplication,
      );

      await expect(
        service.updateApplicationStatus(userId, 'app-123', {
          status: 'REVIEWING' as any,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
