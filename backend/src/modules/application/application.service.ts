import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { AiCVService } from '../ai-cv/ai-cv.service';

@Injectable()
export class ApplicationService {
  constructor(
    private prisma: PrismaService,
    private aiCVService: AiCVService,
  ) {}

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

    // Auto-trigger matching bất đồng bộ (fire-and-forget)
    // Không await — trả response ngay, matching chạy nền
    this.triggerAutoMatch(application.id, cvId, jobId);

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

  async findAllByJob(jobId: string, recruiterId: string) {
    // Check if job belongs to recruiter
    const job = await this.prisma.job.findUnique({
      where: { id: jobId, deletedAt: null },
    });
    if (!job) {
      throw new NotFoundException('Không tìm thấy tin tuyển dụng');
    }
    if (job.recruiterId !== recruiterId) {
      throw new ForbiddenException('Bạn không có quyền xem ứng viên của tin tuyển dụng này');
    }

    return this.prisma.application.findMany({
      where: { jobId, deletedAt: null },
      include: {
        cv: {
          select: {
            id: true,
            title: true,
            cvUrl: true,
            cvType: true,
            cvData: true,
            candidate: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    avaUrl: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async matchApplication(applicationId: string, recruiterId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId, deletedAt: null },
      include: {
        job: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Không tìm thấy hồ sơ ứng tuyển');
    }

    if (application.job.recruiterId !== recruiterId) {
      throw new ForbiddenException('Bạn không có quyền thực hiện hành động này');
    }

    // Call AiCVService to run the match
    const aiResult = await this.aiCVService.matchCVAndJob(
      application.cvId,
      application.jobId,
    );

    // Save result in DB
    return this.prisma.application.update({
      where: { id: applicationId },
      data: {
        matchScore: aiResult.score,
        matchLevel: aiResult.matchLevel,
        aiFeedback: aiResult.feedback,
      },
      include: {
        cv: {
          select: {
            id: true,
            title: true,
            cvUrl: true,
            cvType: true,
            cvData: true,
            candidate: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    avaUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findOneForRecruiter(applicationId: string, recruiterId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId, deletedAt: null },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            recruiterId: true,
            company: { select: { id: true, name: true, logoUrl: true } },
            city: { select: { id: true, name: true } },
          },
        },
        cv: {
          select: {
            id: true,
            title: true,
            cvUrl: true,
            cvType: true,
            cvData: true,
            candidate: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    avaUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Không tìm thấy hồ sơ ứng tuyển');
    }

    if (application.job.recruiterId !== recruiterId) {
      throw new ForbiddenException('Bạn không có quyền xem hồ sơ này');
    }

    return application;
  }

  /**
   * Tự động trigger AI matching sau khi ứng viên nộp đơn (fire-and-forget).
   * Không throw lỗi ra ngoài — đảm bảo việc tạo application luôn thành công.
   */
  private async triggerAutoMatch(applicationId: string, cvId: string, jobId: string): Promise<void> {
    try {
      const aiResult = await this.aiCVService.matchCVAndJob(cvId, jobId);
      await this.prisma.application.update({
        where: { id: applicationId },
        data: {
          matchScore: aiResult.score,
          matchLevel: aiResult.matchLevel,
          aiFeedback: aiResult.feedback,
        },
      });
      console.log(
        `✅ Auto-match hoàn thành cho application ${applicationId}: ` +
        `score=${aiResult.score}, level=${aiResult.matchLevel}`,
      );
    } catch (error) {
      console.warn(
        `⚠️ Auto-match thất bại cho application ${applicationId}:`,
        error?.message,
      );
    }
  }
}
