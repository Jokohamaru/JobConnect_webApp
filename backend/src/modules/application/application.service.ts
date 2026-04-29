import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { ApplicationStatus } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class ApplicationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Submit a job application
   * Requirements: 10.1-10.7
   */
  async createApplication(userId: string, createDto: CreateApplicationDto) {
    // Get candidate profile
    const candidate = await this.prisma.candidates.findUnique({
      where: { user_id: userId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    // Verify job exists and is ACTIVE
    const job = await this.prisma.jobs.findUnique({
      where: { id: createDto.job_id },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.status !== 'ACTIVE') {
      throw new BadRequestException('Job is no longer accepting applications');
    }

    // Verify CV exists and belongs to candidate
    const cv = await this.prisma.cvs.findUnique({
      where: { id: createDto.cv_id },
    });

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    if (cv.candidate_id !== candidate.id) {
      throw new ForbiddenException('You do not have access to this CV');
    }

    // Check for duplicate application (unique constraint on candidate_id, job_id)
    // Only check for non-deleted applications
    const existingApplication = await this.prisma.applications.findUnique({
      where: {
        candidate_id_job_id: {
          candidate_id: candidate.id,
          job_id: createDto.job_id,
        },
      },
    });

    if (existingApplication && !existingApplication.deleted_at) {
      throw new ConflictException('You have already applied to this job');
    }

    // Create application with APPLIED status
    const application = await this.prisma.applications.create({
      data: {
        id: randomBytes(12).toString('hex'),
        candidate_id: candidate.id,
        job_id: createDto.job_id,
        cv_id: createDto.cv_id,
        status: ApplicationStatus.APPLIED,
        created_at: new Date(),
        updated_at: new Date(),
      },
      include: {
        jobs: true,
        cvs: true,
        candidates: {
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
    });

    return application;
  }

  /**
   * Get all applications for the authenticated user
   * Requirements: 10.7, 13.1-13.4, 14.1-14.5
   */
  async getApplications(
    userId: string,
    userRole: string,
    status?: string,
    jobId?: string,
    page: number = 1,
    perPage: number = 20,
  ) {
    if (userRole === 'CANDIDATE') {
      // Get candidate's applications
      const candidate = await this.prisma.candidates.findUnique({
        where: { user_id: userId },
      });

      if (!candidate) {
        throw new NotFoundException('Candidate profile not found');
      }

      const where: any = {
        candidate_id: candidate.id,
        deleted_at: null, // Exclude soft-deleted applications
      };

      if (status) {
        where.status = status;
      }

      // Get total count for pagination metadata
      const totalCount = await this.prisma.applications.count({ where });

      // Calculate pagination values
      const totalPages = Math.ceil(totalCount / perPage);
      const skip = (page - 1) * perPage;

      const applications = await this.prisma.applications.findMany({
        where,
        include: {
          jobs: {
            include: {
              companies: true,
            },
          },
          cvs: true,
        },
        orderBy: {
          created_at: 'desc', // Most recent first
        },
        skip,
        take: perPage,
      });

      return {
        data: applications,
        pagination: {
          current_page: page,
          per_page: perPage,
          total_count: totalCount,
          total_pages: totalPages,
          has_next_page: page < totalPages,
          has_previous_page: page > 1,
        },
      };
    } else if (userRole === 'RECRUITER') {
      // Get applications for recruiter's company jobs
      const recruiter = await this.prisma.recruiters.findUnique({
        where: { user_id: userId },
        include: { companies: true },
      });

      if (!recruiter) {
        throw new NotFoundException('Recruiter profile not found');
      }

      if (!recruiter.companies) {
        return {
          data: [],
          pagination: {
            current_page: page,
            per_page: perPage,
            total_count: 0,
            total_pages: 0,
            has_next_page: false,
            has_previous_page: false,
          },
        };
      }

      const where: any = {
        jobs: {
          company_id: recruiter.companies.id,
        },
        deleted_at: null, // Exclude soft-deleted applications
      };

      if (status) {
        where.status = status;
      }

      if (jobId) {
        where.job_id = jobId;
      }

      // Get total count for pagination metadata
      const totalCount = await this.prisma.applications.count({ where });

      // Calculate pagination values
      const totalPages = Math.ceil(totalCount / perPage);
      const skip = (page - 1) * perPage;

      const applications = await this.prisma.applications.findMany({
        where,
        include: {
          candidates: {
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
          jobs: true,
          cvs: true,
        },
        orderBy: {
          created_at: 'desc',
        },
        skip,
        take: perPage,
      });

      return {
        data: applications,
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

    throw new ForbiddenException('Invalid role for accessing applications');
  }

  /**
   * Get application by ID
   * Requirements: 10.7, 13.1
   */
  async getApplicationById(userId: string, userRole: string, id: string) {
    const application = await this.prisma.applications.findUnique({
      where: { id },
      include: {
        candidates: {
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
        jobs: {
          include: {
            companies: {
              include: {
                recruiters: true,
              },
            },
          },
        },
        cvs: true,
      },
    });

    if (!application || application.deleted_at) {
      throw new NotFoundException('Application not found');
    }

    // Check authorization
    if (userRole === 'CANDIDATE') {
      const candidate = await this.prisma.candidates.findUnique({
        where: { user_id: userId },
      });

      if (!candidate || application.candidate_id !== candidate.id) {
        throw new ForbiddenException(
          'You do not have permission to view this application',
        );
      }
    } else if (userRole === 'RECRUITER') {
      const recruiter = await this.prisma.recruiters.findUnique({
        where: { user_id: userId },
      });

      if (
        !recruiter ||
        application.jobs.companies.recruiter_id !== recruiter.id
      ) {
        throw new ForbiddenException(
          'You do not have permission to view this application',
        );
      }
    }

    return application;
  }

  /**
   * Update application status
   * Requirements: 11.1-11.7, 12.1-12.3
   */
  async updateApplicationStatus(
    userId: string,
    id: string,
    updateDto: UpdateApplicationStatusDto,
  ) {
    // Get application with job and company info
    const application = await this.prisma.applications.findUnique({
      where: { id },
      include: {
        jobs: {
          include: {
            companies: {
              include: {
                recruiters: true,
              },
            },
          },
        },
      },
    });

    if (!application || application.deleted_at) {
      throw new NotFoundException('Application not found');
    }

    // Verify the authenticated user is the recruiter who owns the job's company
    if (application.jobs.companies.recruiters.user_id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this application',
      );
    }

    // Validate status transition
    const currentStatus = application.status;
    const newStatus = updateDto.status;

    const validTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
      APPLIED: [ApplicationStatus.REVIEWING, ApplicationStatus.REJECTED],
      REVIEWING: [ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED],
      ACCEPTED: [], // No transitions allowed from ACCEPTED
      REJECTED: [], // No transitions allowed from REJECTED
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }

    // Update application status
    const updatedApplication = await this.prisma.applications.update({
      where: { id },
      data: {
        status: newStatus,
        updated_at: new Date(),
      },
      include: {
        candidates: {
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
        jobs: {
          include: {
            companies: true,
          },
        },
        cvs: true,
      },
    });

    return updatedApplication;
  }

  /**
   * Withdraw/delete application (soft delete)
   * Requirements: 28.1-28.4
   */
  async deleteApplication(userId: string, id: string) {
    // Get application
    const application = await this.prisma.applications.findUnique({
      where: { id },
      include: {
        candidates: true,
      },
    });

    if (!application || application.deleted_at) {
      throw new NotFoundException('Application not found');
    }

    // Verify the authenticated user is the candidate who owns the application
    const candidate = await this.prisma.candidates.findUnique({
      where: { user_id: userId },
    });

    if (!candidate || application.candidate_id !== candidate.id) {
      throw new ForbiddenException(
        'You do not have permission to delete this application',
      );
    }

    // Soft delete the application
    await this.prisma.applications.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });

    return { message: 'Application withdrawn successfully' };
  }
}
