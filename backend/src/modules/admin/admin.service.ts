import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    try {
      // Lấy tháng hiện tại
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      this.logger.debug(`Fetching stats for month: ${currentMonth} to ${nextMonth}`);

      // 1. Tổng số việc làm (tất cả các job đã được phê duyệt)
      const totalJobs = await this.prisma.job.count({
        where: {
          status: 'PUBLISHED',
          deletedAt: null,
        },
      });

      // 2. Nhà tuyển dụng mới (tháng này)
      const newEmployers = await this.prisma.recruiter.count({
        where: {
          createdAt: {
            gte: currentMonth,
            lt: nextMonth,
          },
          user: {
            deletedAt: null,
          },
        },
      });

      // 3. Ứng viên mới (tháng này)
      const newCandidates = await this.prisma.candidate.count({
        where: {
          createdAt: {
            gte: currentMonth,
            lt: nextMonth,
          },
          user: {
            deletedAt: null,
          },
        },
      });

      // 4. Tin hết hạn (tháng này) - Job được tạo tháng này nhưng status là CLOSED
      const expiredJobs = await this.prisma.job.count({
        where: {
          status: 'CLOSED',
          createdAt: {
            gte: currentMonth,
            lt: nextMonth,
          },
          deletedAt: null,
        },
      });

      const result = {
        totalJobs: totalJobs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
        newEmployers: newEmployers.toString(),
        newCandidates: newCandidates.toString(),
        expiredJobs: expiredJobs.toString(),
      };

      this.logger.debug(`Dashboard stats: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`Error fetching dashboard stats: ${error}`);
      throw error;
    }
  }

  async getUsersStats() {
    try {
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      // 1. Tổng số tài khoản
      const totalUsers = await this.prisma.user.count({
        where: {
          deletedAt: null,
        },
      });

      // 2. Số ứng viên tạo mới (tháng này)
      const newCandidates = await this.prisma.candidate.count({
        where: {
          createdAt: {
            gte: currentMonth,
            lt: nextMonth,
          },
          user: {
            deletedAt: null,
          },
        },
      });

      // 3. Số Recruiter tạo mới (tháng này)
      const newRecruiters = await this.prisma.recruiter.count({
        where: {
          createdAt: {
            gte: currentMonth,
            lt: nextMonth,
          },
          user: {
            deletedAt: null,
          },
        },
      });

      // 4. Tài khoản hoạt động
      const activeUsers = await this.prisma.user.count({
        where: {
          status: 'ACTIVE',
          deletedAt: null,
        },
      });

      return {
        totalUsers: totalUsers.toString(),
        newCandidates: newCandidates.toString(),
        newRecruiters: newRecruiters.toString(),
        activeUsers: activeUsers.toString(),
      };
    } catch (error) {
      this.logger.error(`Error fetching users stats: ${error}`);
      throw error;
    }
  }

  async getUsers(page: number = 1, limit: number = 10, search?: string) {
    try {
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {
        deletedAt: null,
      };

      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Get users with pagination
      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            status: true,
            avaUrl: true,
            createdAt: true,
          },
        }),
        this.prisma.user.count({ where }),
      ]);

      // Format users data
      const formattedUsers = users.map((user) => {
        let name = user.lastName || 'N/A';
        if (user.firstName && user.lastName) {
          name = `${user.firstName} ${user.lastName}`;
        } else if (user.role === 'ADMIN') {
          name = 'Admin';
        }

        return {
          id: user.id,
          email: user.email,
          name,
          role: user.role,
          status: user.status,
          avaUrl: user.avaUrl,
          createdAt: user.createdAt,
        };
      });

      return {
        data: formattedUsers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(`Error fetching users: ${error}`);
      throw error;
    }
  }

  async createUser(createUserDto: CreateUserDto) {
    try {
      // Check if email already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email đã tồn tại trong hệ thống');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      // Create user with firstName and lastName
      const user = await this.prisma.user.create({
        data: {
          email: createUserDto.email,
          password: hashedPassword,
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          role: createUserDto.role,
          status: 'ACTIVE',
        },
      });

      // Create profile based on role
      if (createUserDto.role === 'CANDIDATE') {
        await this.prisma.candidate.create({
          data: {
            userId: user.id,
          },
        });
      } else if (createUserDto.role === 'RECRUITER') {
        await this.prisma.recruiter.create({
          data: {
            userId: user.id,
          },
        });
      } else if (createUserDto.role === 'ADMIN') {
        await this.prisma.admin.create({
          data: {
            userId: user.id,
          },
        });
      }

      this.logger.log(`User created: ${user.email} with role ${user.role}`);

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      };
    } catch (error) {
      this.logger.error(`Error creating user: ${error}`);
      throw error;
    }
  }

  // Company methods
  async getCompaniesStats() {
    try {
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      // 1. Tổng số công ty
      const totalCompanies = await this.prisma.company.count({
        where: {
          deletedAt: null,
        },
      });

      // 2. Công ty mới (tháng này)
      const newCompanies = await this.prisma.company.count({
        where: {
          createdAt: {
            gte: currentMonth,
            lt: nextMonth,
          },
          deletedAt: null,
        },
      });

      // 3. Công ty có việc làm đang tuyển
      const activeCompanies = await this.prisma.company.count({
        where: {
          jobs: {
            some: {
              status: 'PUBLISHED',
              deletedAt: null,
            },
          },
          deletedAt: null,
        },
      });

      // 4. Công ty có website
      const companiesWithWebsite = await this.prisma.company.count({
        where: {
          websiteUrl: {
            not: null,
          },
          deletedAt: null,
        },
      });

      return {
        totalCompanies: totalCompanies.toString(),
        newCompanies: newCompanies.toString(),
        activeCompanies: activeCompanies.toString(),
        companiesWithWebsite: companiesWithWebsite.toString(),
      };
    } catch (error) {
      this.logger.error(`Error fetching companies stats: ${error}`);
      throw error;
    }
  }

  async getCompanies(page: number = 1, limit: number = 10, search?: string) {
    try {
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {
        deletedAt: null,
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
          { nation: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Get companies with pagination
      const [companies, total] = await Promise.all([
        this.prisma.company.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            type: true,
            _count: {
              select: {
                jobs: {
                  where: {
                    deletedAt: null,
                  },
                },
                recruiters: {
                  where: {
                    deletedAt: null,
                  },
                },
              },
            },
          },
        }),
        this.prisma.company.count({ where }),
      ]);

      // Format companies data
      const formattedCompanies = companies.map((company) => ({
        id: company.id,
        name: company.name,
        size: company.size,
        nation: company.nation,
        address: company.address,
        logoUrl: company.logoUrl,
        websiteUrl: company.websiteUrl,
        type: company.type?.name || 'N/A',
        jobsCount: company._count.jobs,
        recruitersCount: company._count.recruiters,
        createdAt: company.createdAt,
      }));

      return {
        data: formattedCompanies,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(`Error fetching companies: ${error}`);
      throw error;
    }
  }

  async createCompany(createCompanyDto: CreateCompanyDto, logo?: Express.Multer.File) {
    try {
      // Check if company name already exists
      const existingCompany = await this.prisma.company.findFirst({
        where: { 
          name: createCompanyDto.name,
          deletedAt: null,
        },
      });

      if (existingCompany) {
        throw new ConflictException('Tên công ty đã tồn tại trong hệ thống');
      }

      // Prepare logo URL if file uploaded
      let logoUrl: string | undefined = undefined;
      if (logo) {
        logoUrl = `/uploads/companies/${logo.filename}`;
      }

      // Create company
      const company = await this.prisma.company.create({
        data: {
          name: createCompanyDto.name,
          size: createCompanyDto.size,
          nation: createCompanyDto.nation,
          description: createCompanyDto.description,
          address: createCompanyDto.address,
          logoUrl,
          websiteUrl: createCompanyDto.websiteUrl,
          typeId: createCompanyDto.typeId,
        },
        include: {
          type: true,
        },
      });

      this.logger.log(`Company created: ${company.name}`);

      return {
        id: company.id,
        name: company.name,
        logoUrl: company.logoUrl,
        type: company.type?.name || null,
      };
    } catch (error) {
      this.logger.error(`Error creating company: ${error}`);
      throw error;
    }
  }

  async getCompanyTypes() {
    try {
      const types = await this.prisma.companyType.findMany({
        orderBy: { name: 'asc' },
      });

      return types;
    } catch (error) {
      this.logger.error(`Error fetching company types: ${error}`);
      throw error;
    }
  }

  async getCompanyById(id: string) {
    try {
      const company = await this.prisma.company.findUnique({
        where: { id, deletedAt: null },
        include: {
          type: true,
          _count: {
            select: {
              jobs: true,
              recruiters: true,
            },
          },
        },
      });

      if (!company) {
        throw new ConflictException('Không tìm thấy công ty');
      }

      return {
        id: company.id,
        name: company.name,
        size: company.size,
        nation: company.nation,
        description: company.description,
        address: company.address,
        logoUrl: company.logoUrl,
        websiteUrl: company.websiteUrl,
        type: company.type,
        jobsCount: company._count.jobs,
        recruitersCount: company._count.recruiters,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
      };
    } catch (error) {
      this.logger.error(`Error fetching company by id: ${error}`);
      throw error;
    }
  }

  async updateCompany(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
    logo?: Express.Multer.File,
  ) {
    try {
      // Check if company exists
      const existingCompany = await this.prisma.company.findUnique({
        where: { id, deletedAt: null },
      });

      if (!existingCompany) {
        throw new ConflictException('Không tìm thấy công ty');
      }

      // Check if new name conflicts with another company
      if (updateCompanyDto.name && updateCompanyDto.name !== existingCompany.name) {
        const nameConflict = await this.prisma.company.findFirst({
          where: {
            name: updateCompanyDto.name,
            deletedAt: null,
            id: { not: id },
          },
        });

        if (nameConflict) {
          throw new ConflictException('Tên công ty đã tồn tại trong hệ thống');
        }
      }

      // Handle logo upload
      let logoUrl = existingCompany.logoUrl;
      if (logo) {
        logoUrl = `/uploads/companies/${logo.filename}`;
      }

      // Update company
      const company = await this.prisma.company.update({
        where: { id },
        data: {
          ...updateCompanyDto,
          logoUrl,
        },
        include: {
          type: true,
        },
      });

      this.logger.log(`Company updated: ${company.name}`);

      return {
        id: company.id,
        name: company.name,
        size: company.size,
        nation: company.nation,
        description: company.description,
        address: company.address,
        logoUrl: company.logoUrl,
        websiteUrl: company.websiteUrl,
        type: company.type?.name || null,
      };
    } catch (error) {
      this.logger.error(`Error updating company: ${error}`);
      throw error;
    }
  }

  async deleteCompany(id: string) {
    try {
      // Check if company exists
      const existingCompany = await this.prisma.company.findUnique({
        where: { id, deletedAt: null },
        include: {
          _count: {
            select: {
              jobs: true,
              recruiters: true,
            },
          },
        },
      });

      if (!existingCompany) {
        throw new ConflictException('Không tìm thấy công ty');
      }

      // Check if company has active jobs or recruiters
      if (existingCompany._count.jobs > 0) {
        throw new ConflictException(
          'Không thể xóa công ty có việc làm đang hoạt động. Vui lòng xóa tất cả việc làm trước.',
        );
      }

      if (existingCompany._count.recruiters > 0) {
        throw new ConflictException(
          'Không thể xóa công ty có nhà tuyển dụng. Vui lòng xóa tất cả nhà tuyển dụng trước.',
        );
      }

      // Soft delete company
      await this.prisma.company.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });

      this.logger.log(`Company deleted: ${existingCompany.name}`);

      return {
        message: 'Xóa công ty thành công',
      };
    } catch (error) {
      this.logger.error(`Error deleting company: ${error}`);
      throw error;
    }
  }

  // ==================== JOB MANAGEMENT ====================

  async getJobsStats() {
    try {
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      // Total jobs
      const totalJobs = await this.prisma.job.count({
        where: { deletedAt: null },
      });

      // New jobs this month
      const newJobs = await this.prisma.job.count({
        where: {
          createdAt: {
            gte: currentMonth,
            lt: nextMonth,
          },
          deletedAt: null,
        },
      });

      // Published jobs
      const publishedJobs = await this.prisma.job.count({
        where: {
          status: 'PUBLISHED',
          deletedAt: null,
        },
      });

      // Pending jobs
      const pendingJobs = await this.prisma.job.count({
        where: {
          status: 'PENDING_APPROVAL',
          deletedAt: null,
        },
      });

      return {
        totalJobs: totalJobs.toString(),
        newJobs: newJobs.toString(),
        publishedJobs: publishedJobs.toString(),
        pendingJobs: pendingJobs.toString(),
      };
    } catch (error) {
      this.logger.error(`Error fetching jobs stats: ${error}`);
      throw error;
    }
  }

  async getJobs(page: number = 1, limit: number = 10, search?: string, status?: string) {
    try {
      const skip = (page - 1) * limit;

      const where: any = {
        deletedAt: null,
      };

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { company: { name: { contains: search, mode: 'insensitive' } } },
          { recruiter: { user: { firstName: { contains: search, mode: 'insensitive' } } } },
          { recruiter: { user: { lastName: { contains: search, mode: 'insensitive' } } } },
        ];
      }

      if (status) {
        where.status = status;
      }

      const [jobs, total] = await Promise.all([
        this.prisma.job.findMany({
          where,
          skip,
          take: limit,
          include: {
            company: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
              },
            },
            recruiter: {
              select: {
                id: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
            city: {
              select: {
                name: true,
              },
            },
            _count: {
              select: {
                applications: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.job.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: jobs.map(job => ({
          id: job.id,
          title: job.title,
          company: {
            id: job.company.id,
            name: job.company.name,
            logoUrl: job.company.logoUrl,
          },
          recruiter: {
            id: job.recruiter.id,
            name: `${job.recruiter.user.firstName || ''} ${job.recruiter.user.lastName || ''}`.trim(),
            email: job.recruiter.user.email,
          },
          location: job.city?.name || 'N/A',
          minSalary: job.minSalary,
          maxSalary: job.maxSalary,
          currency: job.currency,
          status: job.status,
          applicationsCount: job._count.applications,
          createdAt: job.createdAt,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      this.logger.error(`Error fetching jobs: ${error}`);
      throw error;
    }
  }

  async getRecruiters() {
    try {
      const recruiters = await this.prisma.recruiter.findMany({
        where: {
          user: {
            deletedAt: null,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return recruiters.map(recruiter => ({
        id: recruiter.id,
        userId: recruiter.user.id,
        name: `${recruiter.user.firstName || ''} ${recruiter.user.lastName || ''}`.trim() || recruiter.user.email,
        email: recruiter.user.email,
        company: recruiter.company ? {
          id: recruiter.company.id,
          name: recruiter.company.name,
        } : null,
      }));
    } catch (error) {
      this.logger.error(`Error fetching recruiters: ${error}`);
      throw error;
    }
  }

  async createJob(createJobDto: any) {
    try {
      const { recruiterId, title, description, headcount, minSalary, maxSalary, currency, cityId, tagIds, skillIds } = createJobDto;

      // Get recruiter with company
      const recruiter = await this.prisma.recruiter.findUnique({
        where: { id: recruiterId },
        include: { company: true },
      });

      if (!recruiter) {
        throw new Error('Recruiter not found');
      }

      if (!recruiter.companyId) {
        throw new Error('Recruiter must be associated with a company');
      }

      // Calculate expires date (30 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Create job
      const job = await this.prisma.job.create({
        data: {
          title,
          description,
          headcount,
          minSalary,
          maxSalary,
          currency: currency || 'VND',
          status: 'PUBLISHED',
          recruiterId: recruiter.id,
          companyId: recruiter.companyId,
          cityId,
          tags: tagIds && tagIds.length > 0 ? {
            connect: tagIds.map((tagId: string) => ({ id: tagId })),
          } : undefined,
          skills: skillIds && skillIds.length > 0 ? {
            connect: skillIds.map((skillId: string) => ({ id: skillId })),
          } : undefined,
        },
        include: {
          company: true,
          recruiter: {
            include: {
              user: true,
            },
          },
          city: true,
        },
      });

      this.logger.log(`Job created by admin: ${job.title}`);

      return {
        id: job.id,
        title: job.title,
        company: job.company.name,
        recruiter: `${job.recruiter.user.firstName || ''} ${job.recruiter.user.lastName || ''}`.trim(),
        status: job.status,
        createdAt: job.createdAt,
      };
    } catch (error) {
      this.logger.error(`Error creating job: ${error}`);
      throw error;
    }
  }
}

