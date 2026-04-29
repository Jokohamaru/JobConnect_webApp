import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { FilterJobDto } from './dto/filter-job.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class JobService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new job posting
   * Requirements: 8.1, 8.2, 8.3, 8.4
   */
  async createJob(userId: string, createDto: CreateJobDto) {
    // Validate salary range
    if (
      createDto.salary_min !== undefined &&
      createDto.salary_max !== undefined &&
      createDto.salary_min > createDto.salary_max
    ) {
      throw new BadRequestException(
        'salary_min must be less than or equal to salary_max',
      );
    }

    // Get recruiter and their company
    const recruiter = await this.prisma.recruiters.findUnique({
      where: { user_id: userId },
      include: { companies: true },
    });

    if (!recruiter) {
      throw new NotFoundException('Recruiter profile not found');
    }

    if (!recruiter.companies) {
      throw new BadRequestException(
        'You must create a company before posting jobs',
      );
    }

    // Create job with ACTIVE status
    const job = await this.prisma.jobs.create({
      data: {
        id: randomBytes(12).toString('hex'),
        company_id: recruiter.companies.id,
        title: createDto.title,
        description: createDto.description,
        location: createDto.location,
        salary_min: createDto.salary_min,
        salary_max: createDto.salary_max,
        job_type: createDto.job_type,
        status: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Associate skills with job
    if (createDto.skill_ids && createDto.skill_ids.length > 0) {
      await Promise.all(
        createDto.skill_ids.map((skillId) =>
          this.prisma.job_skills.create({
            data: {
              id: randomBytes(12).toString('hex'),
              job_id: job.id,
              skill_id: skillId,
            },
          }),
        ),
      );
    }

    // Associate tags with job
    if (createDto.tag_ids && createDto.tag_ids.length > 0) {
      await Promise.all(
        createDto.tag_ids.map((tagId) =>
          this.prisma.job_tags.create({
            data: {
              id: randomBytes(12).toString('hex'),
              job_id: job.id,
              tag_id: tagId,
            },
          }),
        ),
      );
    }

    // Return job with associations
    return await this.getJobById(job.id);
  }

  /**
   * Get all jobs with filtering and pagination
   * Requirements: 9.1-9.8
   */
  async getJobs(filters?: FilterJobDto) {
    const page = filters?.page || 1;
    const perPage = filters?.per_page || 20;
    const skip = (page - 1) * perPage;

    // Build where clause
    const where: any = {
      status: 'ACTIVE',
    };

    // Filter by city
    if (filters?.city) {
      where.location = {
        contains: filters.city,
        mode: 'insensitive',
      };
    }

    // Filter by keyword (title or description)
    if (filters?.keyword) {
      where.OR = [
        {
          title: {
            contains: filters.keyword,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: filters.keyword,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Filter by skills (AND logic - job must have ALL specified skills)
    if (filters?.skill_ids && filters.skill_ids.length > 0) {
      // For AND logic, we need to ensure the job has all specified skills
      // We'll use a subquery approach by filtering in the main query
      where.AND = where.AND || [];
      filters.skill_ids.forEach((skillId) => {
        where.AND.push({
          job_skills: {
            some: {
              skill_id: skillId,
            },
          },
        });
      });
    }

    // Filter by tags (AND logic - job must have ALL specified tags)
    if (filters?.tag_ids && filters.tag_ids.length > 0) {
      // For AND logic, we need to ensure the job has all specified tags
      where.AND = where.AND || [];
      filters.tag_ids.forEach((tagId) => {
        where.AND.push({
          job_tags: {
            some: {
              tag_id: tagId,
            },
          },
        });
      });
    }

    // Get total count
    const totalCount = await this.prisma.jobs.count({ where });

    // Get jobs with pagination
    const jobs = await this.prisma.jobs.findMany({
      where,
      skip,
      take: perPage,
      include: {
        companies: true,
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

    const totalPages = Math.ceil(totalCount / perPage);

    return {
      data: jobs,
      pagination: {
        current_page: page,
        per_page: perPage,
        total_count: totalCount,
        total_pages: totalPages,
        has_next_page: page < totalPages,
        has_previous_page: page > 1,
      },
    };
  }

  /**
   * Get job by ID
   * Requirements: 9.8, 26.1-26.4
   */
  async getJobById(jobId: string, userId?: string) {
    const job = await this.prisma.jobs.findUnique({
      where: { id: jobId },
      include: {
        companies: {
          include: {
            recruiters: {
              include: {
                users: {
                  select: {
                    id: true,
                    email: true,
                    full_name: true,
                  },
                },
              },
            },
          },
        },
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
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // If userId is provided, calculate skill matching and check application status
    if (userId) {
      // Get candidate profile with skills
      const candidate = await this.prisma.candidates.findUnique({
        where: { user_id: userId },
        include: {
          candidate_skills: {
            include: {
              skills: true,
            },
          },
        },
      });

      if (candidate) {
        // Calculate skill match percentage
        const jobSkillIds = job.job_skills.map((js) => js.skill_id);
        const candidateSkillIds = candidate.candidate_skills.map(
          (cs) => cs.skill_id,
        );

        const matchedSkills = jobSkillIds.filter((skillId) =>
          candidateSkillIds.includes(skillId),
        );

        const skillMatchPercentage =
          jobSkillIds.length > 0
            ? Math.round((matchedSkills.length / jobSkillIds.length) * 100)
            : 0;

        // Check if candidate has already applied
        const hasApplied = job.applications.some(
          (app) => app.candidate_id === candidate.id && !app.deleted_at,
        );

        return {
          ...job,
          skill_match_percentage: skillMatchPercentage,
          has_applied: hasApplied,
        };
      }
    }

    return job;
  }

  /**
   * Update job posting
   * Requirements: 8.5, 8.6
   */
  async updateJob(userId: string, jobId: string, updateDto: UpdateJobDto) {
    // Get job with company and recruiter info
    const job = await this.prisma.jobs.findUnique({
      where: { id: jobId },
      include: {
        companies: {
          include: {
            recruiters: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Verify the authenticated user owns the company
    if (job.companies.recruiters.user_id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this job',
      );
    }

    // Validate salary range if both are provided
    if (
      updateDto.salary_min !== undefined &&
      updateDto.salary_max !== undefined &&
      updateDto.salary_min > updateDto.salary_max
    ) {
      throw new BadRequestException(
        'salary_min must be less than or equal to salary_max',
      );
    }

    // Update job
    const updatedJob = await this.prisma.jobs.update({
      where: { id: jobId },
      data: {
        ...updateDto,
        updated_at: new Date(),
      },
      include: {
        companies: true,
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
    });

    return updatedJob;
  }

  /**
   * Close/delete job posting
   * Requirements: 8.7
   */
  async deleteJob(userId: string, jobId: string) {
    // Get job with company and recruiter info
    const job = await this.prisma.jobs.findUnique({
      where: { id: jobId },
      include: {
        companies: {
          include: {
            recruiters: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Verify the authenticated user owns the company
    if (job.companies.recruiters.user_id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this job',
      );
    }

    // Set job status to CLOSED
    await this.prisma.jobs.update({
      where: { id: jobId },
      data: {
        status: 'CLOSED',
        updated_at: new Date(),
      },
    });

    return { message: 'Job closed successfully' };
  }

  /**
   * Get jobs for a specific recruiter
   * Requirements: 8.8
   */
  async getRecruiterJobs(userId: string) {
    // Get recruiter and their company
    const recruiter = await this.prisma.recruiters.findUnique({
      where: { user_id: userId },
      include: { companies: true },
    });

    if (!recruiter) {
      throw new NotFoundException('Recruiter profile not found');
    }

    if (!recruiter.companies) {
      return [];
    }

    const jobs = await this.prisma.jobs.findMany({
      where: { company_id: recruiter.companies.id },
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

    // Add application counts
    return jobs.map((job) => ({
      ...job,
      application_count: job.applications.length,
    }));
  }
}
