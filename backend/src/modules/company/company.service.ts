import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JobStatus } from '@prisma/client';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async findAll(params?: {
    skip?: number;
    take?: number;
    search?: string;
  }) {
    const { skip = 0, take = 20, search } = params || {};

    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        skip,
        take,
        include: {
          type: true,
          _count: {
            select: {
              jobs: {
                where: {
                  status: JobStatus.PUBLISHED,
                  deletedAt: null,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.company.count({ where }),
    ]);

    return {
      data: companies,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      totalPages: Math.ceil(total / take),
    };
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id, deletedAt: null },
      include: {
        type: true,
        jobs: {
          where: {
            status: JobStatus.PUBLISHED,
            deletedAt: null,
          },
          include: {
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
        },
      },
    });

    if (!company) {
      return null;
    }

    // Get unique skills from all jobs
    const allSkills = new Set<string>();
    company.jobs.forEach((job) => {
      job.skills.forEach((skill) => allSkills.add(skill.name));
    });

    return {
      ...company,
      skills: Array.from(allSkills),
    };
  }
}
