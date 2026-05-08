import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SavedJobService {
  constructor(private prisma: PrismaService) {}

  async saveJob(jobId: string, candidateId: string) {
    // Check if job exists and is published
    const job = await this.prisma.job.findUnique({
      where: { id: jobId, deletedAt: null },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.status !== 'PUBLISHED') {
      throw new BadRequestException('Job is not available');
    }

    // Check if already saved
    const existingSave = await this.prisma.savedJob.findUnique({
      where: {
        candidateId_jobId: {
          candidateId,
          jobId,
        },
      },
    });

    if (existingSave) {
      throw new BadRequestException('Job already saved');
    }

    // Save job
    const savedJob = await this.prisma.savedJob.create({
      data: {
        candidateId,
        jobId,
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
            tags: {
              select: {
                id: true,
                name: true,
              },
            },
            skills: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return savedJob;
  }

  async unsaveJob(jobId: string, candidateId: string) {
    const savedJob = await this.prisma.savedJob.findUnique({
      where: {
        candidateId_jobId: {
          candidateId,
          jobId,
        },
      },
    });

    if (!savedJob) {
      throw new NotFoundException('Saved job not found');
    }

    await this.prisma.savedJob.delete({
      where: {
        candidateId_jobId: {
          candidateId,
          jobId,
        },
      },
    });

    return { message: 'Job unsaved successfully' };
  }

  async findAllByCandidate(candidateId: string) {
    const savedJobs = await this.prisma.savedJob.findMany({
      where: {
        candidateId,
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
            tags: {
              select: {
                id: true,
                name: true,
              },
            },
            skills: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        savedAt: 'desc',
      },
    });

    return savedJobs;
  }

  async checkIfSaved(jobId: string, candidateId: string): Promise<boolean> {
    const savedJob = await this.prisma.savedJob.findUnique({
      where: {
        candidateId_jobId: {
          candidateId,
          jobId,
        },
      },
    });

    return !!savedJob;
  }
}
