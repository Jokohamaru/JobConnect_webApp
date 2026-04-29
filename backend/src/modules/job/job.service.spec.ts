import { Test, TestingModule } from '@nestjs/testing';
import { JobService } from './job.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

describe('JobService', () => {
  let service: JobService;
  let prisma: PrismaService;

  const mockPrismaService = {
    jobs: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    recruiters: {
      findUnique: jest.fn(),
    },
    job_skills: {
      create: jest.fn(),
    },
    job_tags: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<JobService>(JobService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createJob', () => {
    it('should create a job with ACTIVE status', async () => {
      const userId = 'user-123';
      const createDto = {
        title: 'Software Engineer',
        description: 'We are looking for a software engineer',
        location: 'San Francisco',
        salary_min: 100000,
        salary_max: 150000,
        job_type: 'Full-time',
        skill_ids: ['skill-1', 'skill-2'],
        tag_ids: ['tag-1'],
      };

      const mockRecruiter = {
        id: 'recruiter-123',
        user_id: userId,
        companies: {
          id: 'company-123',
          name: 'Tech Corp',
        },
      };

      const mockJob = {
        id: 'job-123',
        company_id: 'company-123',
        title: createDto.title,
        description: createDto.description,
        location: createDto.location,
        salary_min: createDto.salary_min,
        salary_max: createDto.salary_max,
        job_type: createDto.job_type,
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPrismaService.recruiters.findUnique.mockResolvedValue(mockRecruiter);
      mockPrismaService.jobs.create.mockResolvedValue(mockJob);
      mockPrismaService.jobs.findUnique.mockResolvedValue({
        ...mockJob,
        companies: mockRecruiter.companies,
        job_skills: [],
        job_tags: [],
        applications: [],
      });

      const result = await service.createJob(userId, createDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.recruiters.findUnique).toHaveBeenCalledWith({
        where: { user_id: userId },
        include: { companies: true },
      });
      expect(mockPrismaService.jobs.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if salary_min > salary_max', async () => {
      const userId = 'user-123';
      const createDto = {
        title: 'Software Engineer',
        description: 'We are looking for a software engineer',
        location: 'San Francisco',
        salary_min: 150000,
        salary_max: 100000,
        job_type: 'Full-time',
        skill_ids: [],
      };

      await expect(service.createJob(userId, createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if recruiter not found', async () => {
      const userId = 'user-123';
      const createDto = {
        title: 'Software Engineer',
        description: 'We are looking for a software engineer',
        location: 'San Francisco',
        job_type: 'Full-time',
        skill_ids: [],
      };

      mockPrismaService.recruiters.findUnique.mockResolvedValue(null);

      await expect(service.createJob(userId, createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if recruiter has no company', async () => {
      const userId = 'user-123';
      const createDto = {
        title: 'Software Engineer',
        description: 'We are looking for a software engineer',
        location: 'San Francisco',
        job_type: 'Full-time',
        skill_ids: [],
      };

      mockPrismaService.recruiters.findUnique.mockResolvedValue({
        id: 'recruiter-123',
        user_id: userId,
        companies: null,
      });

      await expect(service.createJob(userId, createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getJobs', () => {
    it('should return paginated jobs with default pagination', async () => {
      const mockJobs = [
        {
          id: 'job-1',
          title: 'Software Engineer',
          status: 'ACTIVE',
          companies: {},
          job_skills: [],
          job_tags: [],
          applications: [],
        },
      ];

      mockPrismaService.jobs.count.mockResolvedValue(1);
      mockPrismaService.jobs.findMany.mockResolvedValue(mockJobs);

      const result = await service.getJobs();

      expect(result.data).toEqual(mockJobs);
      expect(result.pagination).toEqual({
        current_page: 1,
        per_page: 20,
        total_count: 1,
        total_pages: 1,
        has_next_page: false,
        has_previous_page: false,
      });
    });

    it('should filter jobs by city (case-insensitive)', async () => {
      const filters = { city: 'San Francisco' };
      mockPrismaService.jobs.count.mockResolvedValue(0);
      mockPrismaService.jobs.findMany.mockResolvedValue([]);

      await service.getJobs(filters);

      expect(mockPrismaService.jobs.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            location: {
              contains: 'San Francisco',
              mode: 'insensitive',
            },
          }),
        }),
      );
    });

    it('should filter jobs by keyword in title (case-insensitive)', async () => {
      const filters = { keyword: 'engineer' };
      mockPrismaService.jobs.count.mockResolvedValue(0);
      mockPrismaService.jobs.findMany.mockResolvedValue([]);

      await service.getJobs(filters);

      expect(mockPrismaService.jobs.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              {
                title: {
                  contains: 'engineer',
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  contains: 'engineer',
                  mode: 'insensitive',
                },
              },
            ],
          }),
        }),
      );
    });

    it('should filter jobs by single skill', async () => {
      const filters = { skill_ids: ['skill-1'] };
      mockPrismaService.jobs.count.mockResolvedValue(0);
      mockPrismaService.jobs.findMany.mockResolvedValue([]);

      await service.getJobs(filters);

      expect(mockPrismaService.jobs.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: [
              {
                job_skills: {
                  some: {
                    skill_id: 'skill-1',
                  },
                },
              },
            ],
          }),
        }),
      );
    });

    it('should filter jobs by multiple skills with AND logic', async () => {
      const filters = { skill_ids: ['skill-1', 'skill-2'] };
      mockPrismaService.jobs.count.mockResolvedValue(0);
      mockPrismaService.jobs.findMany.mockResolvedValue([]);

      await service.getJobs(filters);

      expect(mockPrismaService.jobs.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: [
              {
                job_skills: {
                  some: {
                    skill_id: 'skill-1',
                  },
                },
              },
              {
                job_skills: {
                  some: {
                    skill_id: 'skill-2',
                  },
                },
              },
            ],
          }),
        }),
      );
    });

    it('should filter jobs by single tag', async () => {
      const filters = { tag_ids: ['tag-1'] };
      mockPrismaService.jobs.count.mockResolvedValue(0);
      mockPrismaService.jobs.findMany.mockResolvedValue([]);

      await service.getJobs(filters);

      expect(mockPrismaService.jobs.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: [
              {
                job_tags: {
                  some: {
                    tag_id: 'tag-1',
                  },
                },
              },
            ],
          }),
        }),
      );
    });

    it('should filter jobs by multiple tags with AND logic', async () => {
      const filters = { tag_ids: ['tag-1', 'tag-2'] };
      mockPrismaService.jobs.count.mockResolvedValue(0);
      mockPrismaService.jobs.findMany.mockResolvedValue([]);

      await service.getJobs(filters);

      expect(mockPrismaService.jobs.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: [
              {
                job_tags: {
                  some: {
                    tag_id: 'tag-1',
                  },
                },
              },
              {
                job_tags: {
                  some: {
                    tag_id: 'tag-2',
                  },
                },
              },
            ],
          }),
        }),
      );
    });

    it('should combine city, skill, and tag filters with AND logic', async () => {
      const filters = {
        city: 'San Francisco',
        skill_ids: ['skill-1', 'skill-2'],
        tag_ids: ['tag-1'],
      };
      mockPrismaService.jobs.count.mockResolvedValue(0);
      mockPrismaService.jobs.findMany.mockResolvedValue([]);

      await service.getJobs(filters);

      expect(mockPrismaService.jobs.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            location: {
              contains: 'San Francisco',
              mode: 'insensitive',
            },
            AND: expect.arrayContaining([
              {
                job_skills: {
                  some: {
                    skill_id: 'skill-1',
                  },
                },
              },
              {
                job_skills: {
                  some: {
                    skill_id: 'skill-2',
                  },
                },
              },
              {
                job_tags: {
                  some: {
                    tag_id: 'tag-1',
                  },
                },
              },
            ]),
          }),
        }),
      );
    });

    it('should support custom pagination parameters', async () => {
      const filters = { page: 2, per_page: 10 };
      mockPrismaService.jobs.count.mockResolvedValue(25);
      mockPrismaService.jobs.findMany.mockResolvedValue([]);

      const result = await service.getJobs(filters);

      expect(mockPrismaService.jobs.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10, // (page 2 - 1) * 10
          take: 10,
        }),
      );
      expect(result.pagination).toEqual({
        current_page: 2,
        per_page: 10,
        total_count: 25,
        total_pages: 3,
        has_next_page: true,
        has_previous_page: true,
      });
    });

    it('should return correct pagination metadata for last page', async () => {
      const filters = { page: 3, per_page: 10 };
      mockPrismaService.jobs.count.mockResolvedValue(25);
      mockPrismaService.jobs.findMany.mockResolvedValue([]);

      const result = await service.getJobs(filters);

      expect(result.pagination).toEqual({
        current_page: 3,
        per_page: 10,
        total_count: 25,
        total_pages: 3,
        has_next_page: false,
        has_previous_page: true,
      });
    });

    it('should only return ACTIVE jobs', async () => {
      mockPrismaService.jobs.count.mockResolvedValue(0);
      mockPrismaService.jobs.findMany.mockResolvedValue([]);

      await service.getJobs();

      expect(mockPrismaService.jobs.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ACTIVE',
          }),
        }),
      );
    });
  });

  describe('updateJob', () => {
    it('should throw ForbiddenException if user does not own the job', async () => {
      const userId = 'user-123';
      const jobId = 'job-123';
      const updateDto = { title: 'Updated Title' };

      const mockJob = {
        id: jobId,
        companies: {
          recruiters: {
            user_id: 'different-user',
          },
        },
      };

      mockPrismaService.jobs.findUnique.mockResolvedValue(mockJob);

      await expect(service.updateJob(userId, jobId, updateDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('deleteJob', () => {
    it('should set job status to CLOSED', async () => {
      const userId = 'user-123';
      const jobId = 'job-123';

      const mockJob = {
        id: jobId,
        companies: {
          recruiters: {
            user_id: userId,
          },
        },
      };

      mockPrismaService.jobs.findUnique.mockResolvedValue(mockJob);
      mockPrismaService.jobs.update.mockResolvedValue({
        ...mockJob,
        status: 'CLOSED',
      });

      const result = await service.deleteJob(userId, jobId);

      expect(result.message).toBe('Job closed successfully');
      expect(mockPrismaService.jobs.update).toHaveBeenCalledWith({
        where: { id: jobId },
        data: {
          status: 'CLOSED',
          updated_at: expect.any(Date),
        },
      });
    });
  });

  describe('getJobById', () => {
    it('should return job without skill matching when no userId provided', async () => {
      const jobId = 'job-123';
      const mockJob = {
        id: jobId,
        title: 'Software Engineer',
        status: 'ACTIVE',
        companies: {},
        job_skills: [
          { skill_id: 'skill-1', skills: { id: 'skill-1', name: 'JavaScript' } },
          { skill_id: 'skill-2', skills: { id: 'skill-2', name: 'TypeScript' } },
        ],
        job_tags: [],
        applications: [],
      };

      mockPrismaService.jobs.findUnique.mockResolvedValue(mockJob);

      const result = await service.getJobById(jobId);

      expect(result).toEqual(mockJob);
      expect(result).not.toHaveProperty('skill_match_percentage');
      expect(result).not.toHaveProperty('has_applied');
    });

    it('should calculate skill match percentage for candidate', async () => {
      const jobId = 'job-123';
      const userId = 'user-123';
      const candidateId = 'candidate-123';

      const mockJob = {
        id: jobId,
        title: 'Software Engineer',
        status: 'ACTIVE',
        companies: {},
        job_skills: [
          { skill_id: 'skill-1', skills: { id: 'skill-1', name: 'JavaScript' } },
          { skill_id: 'skill-2', skills: { id: 'skill-2', name: 'TypeScript' } },
          { skill_id: 'skill-3', skills: { id: 'skill-3', name: 'React' } },
          { skill_id: 'skill-4', skills: { id: 'skill-4', name: 'Node.js' } },
        ],
        job_tags: [],
        applications: [],
      };

      const mockCandidate = {
        id: candidateId,
        user_id: userId,
        candidate_skills: [
          { skill_id: 'skill-1', skills: { id: 'skill-1', name: 'JavaScript' } },
          { skill_id: 'skill-2', skills: { id: 'skill-2', name: 'TypeScript' } },
          { skill_id: 'skill-5', skills: { id: 'skill-5', name: 'Python' } },
        ],
      };

      mockPrismaService.jobs.findUnique.mockResolvedValue(mockJob);
      mockPrismaService.candidates = {
        findUnique: jest.fn().mockResolvedValue(mockCandidate),
      };

      const result = await service.getJobById(jobId, userId);

      // 2 matched skills out of 4 required = 50%
      expect(result.skill_match_percentage).toBe(50);
      expect(result.has_applied).toBe(false);
    });

    it('should return 100% match when candidate has all required skills', async () => {
      const jobId = 'job-123';
      const userId = 'user-123';
      const candidateId = 'candidate-123';

      const mockJob = {
        id: jobId,
        title: 'Software Engineer',
        status: 'ACTIVE',
        companies: {},
        job_skills: [
          { skill_id: 'skill-1', skills: { id: 'skill-1', name: 'JavaScript' } },
          { skill_id: 'skill-2', skills: { id: 'skill-2', name: 'TypeScript' } },
        ],
        job_tags: [],
        applications: [],
      };

      const mockCandidate = {
        id: candidateId,
        user_id: userId,
        candidate_skills: [
          { skill_id: 'skill-1', skills: { id: 'skill-1', name: 'JavaScript' } },
          { skill_id: 'skill-2', skills: { id: 'skill-2', name: 'TypeScript' } },
          { skill_id: 'skill-3', skills: { id: 'skill-3', name: 'React' } },
        ],
      };

      mockPrismaService.jobs.findUnique.mockResolvedValue(mockJob);
      mockPrismaService.candidates = {
        findUnique: jest.fn().mockResolvedValue(mockCandidate),
      };

      const result = await service.getJobById(jobId, userId);

      expect(result.skill_match_percentage).toBe(100);
    });

    it('should return 0% match when candidate has no matching skills', async () => {
      const jobId = 'job-123';
      const userId = 'user-123';
      const candidateId = 'candidate-123';

      const mockJob = {
        id: jobId,
        title: 'Software Engineer',
        status: 'ACTIVE',
        companies: {},
        job_skills: [
          { skill_id: 'skill-1', skills: { id: 'skill-1', name: 'JavaScript' } },
          { skill_id: 'skill-2', skills: { id: 'skill-2', name: 'TypeScript' } },
        ],
        job_tags: [],
        applications: [],
      };

      const mockCandidate = {
        id: candidateId,
        user_id: userId,
        candidate_skills: [
          { skill_id: 'skill-3', skills: { id: 'skill-3', name: 'Python' } },
          { skill_id: 'skill-4', skills: { id: 'skill-4', name: 'Java' } },
        ],
      };

      mockPrismaService.jobs.findUnique.mockResolvedValue(mockJob);
      mockPrismaService.candidates = {
        findUnique: jest.fn().mockResolvedValue(mockCandidate),
      };

      const result = await service.getJobById(jobId, userId);

      expect(result.skill_match_percentage).toBe(0);
    });

    it('should return 0% match when job has no required skills', async () => {
      const jobId = 'job-123';
      const userId = 'user-123';
      const candidateId = 'candidate-123';

      const mockJob = {
        id: jobId,
        title: 'Software Engineer',
        status: 'ACTIVE',
        companies: {},
        job_skills: [],
        job_tags: [],
        applications: [],
      };

      const mockCandidate = {
        id: candidateId,
        user_id: userId,
        candidate_skills: [
          { skill_id: 'skill-1', skills: { id: 'skill-1', name: 'JavaScript' } },
        ],
      };

      mockPrismaService.jobs.findUnique.mockResolvedValue(mockJob);
      mockPrismaService.candidates = {
        findUnique: jest.fn().mockResolvedValue(mockCandidate),
      };

      const result = await service.getJobById(jobId, userId);

      expect(result.skill_match_percentage).toBe(0);
    });

    it('should indicate when candidate has already applied', async () => {
      const jobId = 'job-123';
      const userId = 'user-123';
      const candidateId = 'candidate-123';

      const mockJob = {
        id: jobId,
        title: 'Software Engineer',
        status: 'ACTIVE',
        companies: {},
        job_skills: [
          { skill_id: 'skill-1', skills: { id: 'skill-1', name: 'JavaScript' } },
        ],
        job_tags: [],
        applications: [
          {
            id: 'app-123',
            candidate_id: candidateId,
            job_id: jobId,
            deleted_at: null,
          },
        ],
      };

      const mockCandidate = {
        id: candidateId,
        user_id: userId,
        candidate_skills: [
          { skill_id: 'skill-1', skills: { id: 'skill-1', name: 'JavaScript' } },
        ],
      };

      mockPrismaService.jobs.findUnique.mockResolvedValue(mockJob);
      mockPrismaService.candidates = {
        findUnique: jest.fn().mockResolvedValue(mockCandidate),
      };

      const result = await service.getJobById(jobId, userId);

      expect(result.has_applied).toBe(true);
    });

    it('should not indicate applied when application is soft-deleted', async () => {
      const jobId = 'job-123';
      const userId = 'user-123';
      const candidateId = 'candidate-123';

      const mockJob = {
        id: jobId,
        title: 'Software Engineer',
        status: 'ACTIVE',
        companies: {},
        job_skills: [
          { skill_id: 'skill-1', skills: { id: 'skill-1', name: 'JavaScript' } },
        ],
        job_tags: [],
        applications: [
          {
            id: 'app-123',
            candidate_id: candidateId,
            job_id: jobId,
            deleted_at: new Date(),
          },
        ],
      };

      const mockCandidate = {
        id: candidateId,
        user_id: userId,
        candidate_skills: [
          { skill_id: 'skill-1', skills: { id: 'skill-1', name: 'JavaScript' } },
        ],
      };

      mockPrismaService.jobs.findUnique.mockResolvedValue(mockJob);
      mockPrismaService.candidates = {
        findUnique: jest.fn().mockResolvedValue(mockCandidate),
      };

      const result = await service.getJobById(jobId, userId);

      expect(result.has_applied).toBe(false);
    });

    it('should not add skill matching when user is not a candidate', async () => {
      const jobId = 'job-123';
      const userId = 'user-123';

      const mockJob = {
        id: jobId,
        title: 'Software Engineer',
        status: 'ACTIVE',
        companies: {},
        job_skills: [
          { skill_id: 'skill-1', skills: { id: 'skill-1', name: 'JavaScript' } },
        ],
        job_tags: [],
        applications: [],
      };

      mockPrismaService.jobs.findUnique.mockResolvedValue(mockJob);
      mockPrismaService.candidates = {
        findUnique: jest.fn().mockResolvedValue(null),
      };

      const result = await service.getJobById(jobId, userId);

      expect(result).toEqual(mockJob);
      expect(result).not.toHaveProperty('skill_match_percentage');
      expect(result).not.toHaveProperty('has_applied');
    });

    it('should throw NotFoundException when job does not exist', async () => {
      const jobId = 'non-existent-job';

      mockPrismaService.jobs.findUnique.mockResolvedValue(null);

      await expect(service.getJobById(jobId)).rejects.toThrow(NotFoundException);
    });
  });
});
