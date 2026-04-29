import { Test, TestingModule } from '@nestjs/testing';
import { JobController } from './job.controller';
import { JobService } from './job.service';

describe('JobController', () => {
  let controller: JobController;
  let service: JobService;

  const mockJobService = {
    createJob: jest.fn(),
    getJobs: jest.fn(),
    getJobById: jest.fn(),
    updateJob: jest.fn(),
    deleteJob: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobController],
      providers: [
        {
          provide: JobService,
          useValue: mockJobService,
        },
      ],
    }).compile();

    controller = module.get<JobController>(JobController);
    service = module.get<JobService>(JobService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createJob', () => {
    it('should create a job', async () => {
      const user = { userId: 'user-123', role: 'RECRUITER' };
      const createDto = {
        title: 'Software Engineer',
        description: 'We are looking for a software engineer',
        location: 'San Francisco',
        job_type: 'Full-time',
        skill_ids: ['skill-1'],
      };

      const mockJob = {
        id: 'job-123',
        ...createDto,
        status: 'ACTIVE',
      };

      mockJobService.createJob.mockResolvedValue(mockJob);

      const result = await controller.createJob(user, createDto);

      expect(result).toEqual(mockJob);
      expect(mockJobService.createJob).toHaveBeenCalledWith(
        user.userId,
        createDto,
      );
    });
  });

  describe('getJobs', () => {
    it('should return paginated jobs', async () => {
      const filters = { page: 1, per_page: 20 };
      const mockResponse = {
        data: [],
        pagination: {
          current_page: 1,
          per_page: 20,
          total_count: 0,
          total_pages: 0,
          has_next_page: false,
          has_previous_page: false,
        },
      };

      mockJobService.getJobs.mockResolvedValue(mockResponse);

      const result = await controller.getJobs(filters);

      expect(result).toEqual(mockResponse);
      expect(mockJobService.getJobs).toHaveBeenCalledWith(filters);
    });
  });

  describe('getJob', () => {
    it('should return a job by id without user', async () => {
      const jobId = 'job-123';
      const mockJob = {
        id: jobId,
        title: 'Software Engineer',
        status: 'ACTIVE',
      };

      mockJobService.getJobById.mockResolvedValue(mockJob);

      const result = await controller.getJob(jobId);

      expect(result).toEqual(mockJob);
      expect(mockJobService.getJobById).toHaveBeenCalledWith(jobId, undefined);
    });

    it('should return a job by id with user for skill matching', async () => {
      const jobId = 'job-123';
      const user = { userId: 'user-123', role: 'CANDIDATE' };
      const mockJob = {
        id: jobId,
        title: 'Software Engineer',
        status: 'ACTIVE',
        skill_match_percentage: 75,
        has_applied: false,
      };

      mockJobService.getJobById.mockResolvedValue(mockJob);

      const result = await controller.getJob(jobId, user);

      expect(result).toEqual(mockJob);
      expect(mockJobService.getJobById).toHaveBeenCalledWith(jobId, user.userId);
    });
  });

  describe('updateJob', () => {
    it('should update a job', async () => {
      const user = { userId: 'user-123', role: 'RECRUITER' };
      const jobId = 'job-123';
      const updateDto = { title: 'Updated Title' };
      const mockJob = {
        id: jobId,
        title: 'Updated Title',
        status: 'ACTIVE',
      };

      mockJobService.updateJob.mockResolvedValue(mockJob);

      const result = await controller.updateJob(user, jobId, updateDto);

      expect(result).toEqual(mockJob);
      expect(mockJobService.updateJob).toHaveBeenCalledWith(
        user.userId,
        jobId,
        updateDto,
      );
    });
  });

  describe('deleteJob', () => {
    it('should delete a job', async () => {
      const user = { userId: 'user-123', role: 'RECRUITER' };
      const jobId = 'job-123';
      const mockResponse = { message: 'Job closed successfully' };

      mockJobService.deleteJob.mockResolvedValue(mockResponse);

      const result = await controller.deleteJob(user, jobId);

      expect(result).toEqual(mockResponse);
      expect(mockJobService.deleteJob).toHaveBeenCalledWith(user.userId, jobId);
    });
  });
});
