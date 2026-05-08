import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JobStatus } from '@prisma/client';
import { CreateJobDto } from './dto/create-job.dto';

@Injectable()
export class JobService {
  constructor(private prisma: PrismaService) {}

  async create(createJobDto: CreateJobDto, recruiterId: string, companyId: string) {
    const { tagIds, skillIds, ...jobData } = createJobDto;

    const job = await this.prisma.job.create({
      data: {
        ...jobData,
        recruiterId,
        companyId,
        status: JobStatus.DRAFT, // Default to DRAFT
        tags: tagIds && tagIds.length > 0 ? {
          connect: tagIds.map(id => ({ id })),
        } : undefined,
        skills: skillIds && skillIds.length > 0 ? {
          connect: skillIds.map(id => ({ id })),
        } : undefined,
      },
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
    });

    return job;
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    cityId?: string;
    companyId?: string;
    minSalary?: number;
    maxSalary?: number;
    search?: string;
  }) {
    const {
      skip = 0,
      take = 27,
      cityId,
      companyId,
      minSalary,
      maxSalary,
      search,
    } = params || {};

    const where: any = {
      status: JobStatus.PUBLISHED,
      deletedAt: null,
    };

    if (cityId) {
      where.cityId = cityId;
    }

    if (companyId) {
      where.companyId = companyId;
    }

    if (minSalary !== undefined) {
      where.minSalary = { gte: minSalary };
    }

    if (maxSalary !== undefined) {
      where.maxSalary = { lte: maxSalary };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        skip,
        take,
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
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      data: jobs,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      totalPages: Math.ceil(total / take),
    };
  }

  async findOne(id: string) {
    return this.prisma.job.findUnique({
      where: { id, deletedAt: null, status: JobStatus.PUBLISHED },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            description: true,
            address: true,
            websiteUrl: true,
            size: true,
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
        recruiter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }
}
