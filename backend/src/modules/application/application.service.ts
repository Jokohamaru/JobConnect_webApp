import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';

@Injectable()
export class ApplicationService {
  constructor(private prisma: PrismaService) {}

  async create(createApplicationDto: CreateApplicationDto, candidateId: string) {
    const { jobId, cvId } = createApplicationDto;

    // Check if job exists and is published
    const job = await this.prisma.job.findUnique({
      where: { id: jobId, deletedAt: null },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.status !== 'PUBLISHED') {
      throw new BadRequestException('Job is not available for application');
    }

    // Check if CV exists and belongs to candidate
    const cv = await this.prisma.cV.findUnique({
      where: { id: cvId, deletedAt: null },
    });

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    if (cv.candidateId !== candidateId) {
      throw new BadRequestException('CV does not belong to you');
    }

    // Check if already applied
    const existingApplication = await this.prisma.application.findFirst({
      where: {
        jobId,
        cv: {
          candidateId,
        },
        deletedAt: null,
      },
    });

    if (existingApplication) {
      throw new BadRequestException('You have already applied to this job');
    }

    // Create application
    const application = await this.prisma.application.create({
      data: {
        jobId,
        cvId,
      },
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
              },
            },
            city: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        cv: {
          select: {
            id: true,
            title: true,
            cvUrl: true,
          },
        },
      },
    });

    return application;
  }

  async findAllByCandidate(candidateId: string) {
    const applications = await this.prisma.application.findMany({
      where: {
        cv: {
          candidateId,
        },
        deletedAt: null,
      },
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
              },
            },
            city: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        cv: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        appliedAt: 'desc',
      },
    });

    return applications;
  }

  async checkIfApplied(jobId: string, candidateId: string): Promise<boolean> {
    const application = await this.prisma.application.findFirst({
      where: {
        jobId,
        cv: {
          candidateId,
        },
        deletedAt: null,
      },
    });

    return !!application;
  }
}
