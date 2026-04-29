import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';

describe('ApplicationController', () => {
  let controller: ApplicationController;
  let service: ApplicationService;

  const mockApplicationService = {
    createApplication: jest.fn(),
    getApplications: jest.fn(),
    getApplicationById: jest.fn(),
    updateApplicationStatus: jest.fn(),
    deleteApplication: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationController],
      providers: [
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
      ],
    }).compile();

    controller = module.get<ApplicationController>(ApplicationController);
    service = module.get<ApplicationService>(ApplicationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createApplication', () => {
    it('should create an application', async () => {
      const user = { userId: 'user-123', role: 'CANDIDATE' };
      const createDto = {
        job_id: 'job-123',
        cv_id: 'cv-123',
      };

      const mockApplication = {
        id: 'app-123',
        candidate_id: 'candidate-123',
        job_id: createDto.job_id,
        cv_id: createDto.cv_id,
        status: 'APPLIED',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockApplicationService.createApplication.mockResolvedValue(
        mockApplication,
      );

      const result = await controller.createApplication(user, createDto);

      expect(result).toEqual(mockApplication);
      expect(mockApplicationService.createApplication).toHaveBeenCalledWith(
        user.userId,
        createDto,
      );
    });
  });

  describe('getApplications', () => {
    it('should return applications for candidate', async () => {
      const user = { userId: 'user-123', role: 'CANDIDATE' };
      const mockApplications = [
        {
          id: 'app-123',
          status: 'APPLIED',
          jobs: { title: 'Software Engineer' },
        },
      ];

      mockApplicationService.getApplications.mockResolvedValue(
        mockApplications,
      );

      const result = await controller.getApplications(user);

      expect(result).toEqual(mockApplications);
      expect(mockApplicationService.getApplications).toHaveBeenCalledWith(
        user.userId,
        user.role,
        undefined,
        undefined,
        1,
        20,
      );
    });

    it('should return applications filtered by status', async () => {
      const user = { userId: 'user-123', role: 'CANDIDATE' };
      const status = 'REVIEWING';
      const mockApplications = [
        {
          id: 'app-123',
          status: 'REVIEWING',
          jobs: { title: 'Software Engineer' },
        },
      ];

      mockApplicationService.getApplications.mockResolvedValue(
        mockApplications,
      );

      const result = await controller.getApplications(user, status);

      expect(result).toEqual(mockApplications);
      expect(mockApplicationService.getApplications).toHaveBeenCalledWith(
        user.userId,
        user.role,
        status,
        undefined,
        1,
        20,
      );
    });

    it('should support pagination parameters', async () => {
      const user = { userId: 'user-123', role: 'CANDIDATE' };
      const mockApplications = [
        {
          id: 'app-123',
          status: 'APPLIED',
          jobs: { title: 'Software Engineer' },
        },
      ];

      mockApplicationService.getApplications.mockResolvedValue(
        mockApplications,
      );

      const result = await controller.getApplications(
        user,
        undefined,
        undefined,
        '2',
        '10',
      );

      expect(result).toEqual(mockApplications);
      expect(mockApplicationService.getApplications).toHaveBeenCalledWith(
        user.userId,
        user.role,
        undefined,
        undefined,
        2,
        10,
      );
    });

    it('should support job_id filter for recruiters', async () => {
      const user = { userId: 'user-123', role: 'RECRUITER' };
      const jobId = 'job-123';
      const mockApplications = [
        {
          id: 'app-123',
          job_id: jobId,
          status: 'APPLIED',
        },
      ];

      mockApplicationService.getApplications.mockResolvedValue(
        mockApplications,
      );

      const result = await controller.getApplications(
        user,
        undefined,
        jobId,
      );

      expect(result).toEqual(mockApplications);
      expect(mockApplicationService.getApplications).toHaveBeenCalledWith(
        user.userId,
        user.role,
        undefined,
        jobId,
        1,
        20,
      );
    });
  });

  describe('getApplication', () => {
    it('should return an application by id', async () => {
      const user = { userId: 'user-123', role: 'CANDIDATE' };
      const applicationId = 'app-123';
      const mockApplication = {
        id: applicationId,
        status: 'APPLIED',
        jobs: { title: 'Software Engineer' },
      };

      mockApplicationService.getApplicationById.mockResolvedValue(
        mockApplication,
      );

      const result = await controller.getApplication(user, applicationId);

      expect(result).toEqual(mockApplication);
      expect(mockApplicationService.getApplicationById).toHaveBeenCalledWith(
        user.userId,
        user.role,
        applicationId,
      );
    });
  });

  describe('updateApplicationStatus', () => {
    it('should update application status', async () => {
      const user = { userId: 'user-123', role: 'RECRUITER' };
      const applicationId = 'app-123';
      const updateDto = { status: 'REVIEWING' as any };
      const mockApplication = {
        id: applicationId,
        status: 'REVIEWING',
        updated_at: new Date(),
      };

      mockApplicationService.updateApplicationStatus.mockResolvedValue(
        mockApplication,
      );

      const result = await controller.updateApplicationStatus(
        user,
        applicationId,
        updateDto,
      );

      expect(result).toEqual(mockApplication);
      expect(
        mockApplicationService.updateApplicationStatus,
      ).toHaveBeenCalledWith(user.userId, applicationId, updateDto);
    });
  });

  describe('deleteApplication', () => {
    it('should delete an application', async () => {
      const user = { userId: 'user-123', role: 'CANDIDATE' };
      const applicationId = 'app-123';
      const mockResponse = { message: 'Application withdrawn successfully' };

      mockApplicationService.deleteApplication.mockResolvedValue(mockResponse);

      const result = await controller.deleteApplication(user, applicationId);

      expect(result).toEqual(mockResponse);
      expect(mockApplicationService.deleteApplication).toHaveBeenCalledWith(
        user.userId,
        applicationId,
      );
    });
  });
});
