import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new company linked to a recruiter
   * Requirements: 7.1, 7.2
   */
  async createCompany(userId: string, createDto: CreateCompanyDto) {
    // Get recruiter by user_id
    const recruiter = await this.prisma.recruiters.findUnique({
      where: { user_id: userId },
      include: { companies: true },
    });

    if (!recruiter) {
      throw new NotFoundException('Recruiter profile not found');
    }

    // Check if recruiter already has a company
    if (recruiter.companies) {
      throw new ConflictException('Recruiter already has a company');
    }

    // Create company linked to recruiter
    const company = await this.prisma.companies.create({
      data: {
        id: randomBytes(12).toString('hex'),
        name: createDto.name,
        description: createDto.description,
        website: createDto.website,
        industry: createDto.industry,
        company_type: createDto.company_type,
        location: createDto.location,
        recruiter_id: recruiter.id,
        created_at: new Date(),
        updated_at: new Date(),
      },
      include: {
        recruiters: {
          include: {
            users: {
              select: {
                id: true,
                email: true,
                full_name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    return company;
  }

  /**
   * Get company details by ID
   * Requirements: 7.5
   */
  async getCompanyById(companyId: string) {
    const company = await this.prisma.companies.findUnique({
      where: { id: companyId },
      include: {
        recruiters: {
          include: {
            users: {
              select: {
                id: true,
                email: true,
                full_name: true,
                role: true,
              },
            },
          },
        },
        jobs: {
          include: {
            applications: true,
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Calculate application counts
    const applicationCounts = company.jobs.reduce(
      (acc, job) => acc + job.applications.length,
      0,
    );

    return {
      ...company,
      applicationCounts,
    };
  }

  /**
   * Update company information
   * Requirements: 7.3, 7.4, 7.6
   */
  async updateCompany(
    userId: string,
    companyId: string,
    updateDto: UpdateCompanyDto,
  ) {
    // Get company with recruiter info
    const company = await this.prisma.companies.findUnique({
      where: { id: companyId },
      include: {
        recruiters: true,
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Verify the authenticated user owns this company
    if (company.recruiters.user_id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this company',
      );
    }

    // Update company
    const updatedCompany = await this.prisma.companies.update({
      where: { id: companyId },
      data: {
        ...updateDto,
        updated_at: new Date(),
      },
      include: {
        recruiters: {
          include: {
            users: {
              select: {
                id: true,
                email: true,
                full_name: true,
                role: true,
              },
            },
          },
        },
        jobs: {
          include: {
            applications: true,
          },
        },
      },
    });

    return updatedCompany;
  }

  /**
   * Get all jobs for a company
   * Requirements: 7.5
   */
  async getCompanyJobs(companyId: string) {
    const company = await this.prisma.companies.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const jobs = await this.prisma.jobs.findMany({
      where: { company_id: companyId },
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

    return jobs;
  }
}
