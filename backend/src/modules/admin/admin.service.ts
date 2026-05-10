import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
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
}
