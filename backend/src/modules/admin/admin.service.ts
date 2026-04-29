import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all users with optional role filtering
   * Requirements: 22.1-22.3
   */
  async getAllUsers(role?: string) {
    const whereClause = role ? { role: role as UserRole } : {};

    const users = await this.prisma.users.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        last_login: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return users;
  }

  /**
   * Get platform analytics
   * Requirements: 23.1-23.4
   */
  async getPlatformAnalytics() {
    // User counts by role
    const candidateCount = await this.prisma.users.count({
      where: { role: 'CANDIDATE' },
    });

    const recruiterCount = await this.prisma.users.count({
      where: { role: 'RECRUITER' },
    });

    const adminCount = await this.prisma.users.count({
      where: { role: 'ADMIN' },
    });

    // Job counts
    const totalJobs = await this.prisma.jobs.count();
    const activeJobs = await this.prisma.jobs.count({
      where: { status: 'ACTIVE' },
    });

    // Application counts
    const totalApplications = await this.prisma.applications.count({
      where: { deleted_at: null },
    });

    const appliedCount = await this.prisma.applications.count({
      where: { status: 'APPLIED', deleted_at: null },
    });

    const reviewingCount = await this.prisma.applications.count({
      where: { status: 'REVIEWING', deleted_at: null },
    });

    const acceptedCount = await this.prisma.applications.count({
      where: { status: 'ACCEPTED', deleted_at: null },
    });

    const rejectedCount = await this.prisma.applications.count({
      where: { status: 'REJECTED', deleted_at: null },
    });

    // User registration trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await this.prisma.users.findMany({
      where: {
        created_at: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        created_at: true,
      },
    });

    // Group by day
    const usersByDay = this.groupByDay(recentUsers.map(u => u.created_at));

    // Job posting trends (last 30 days)
    const recentJobs = await this.prisma.jobs.findMany({
      where: {
        created_at: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        created_at: true,
      },
    });

    const jobsByDay = this.groupByDay(recentJobs.map(j => j.created_at));

    return {
      users: {
        total: candidateCount + recruiterCount + adminCount,
        by_role: {
          candidates: candidateCount,
          recruiters: recruiterCount,
          admins: adminCount,
        },
      },
      jobs: {
        total: totalJobs,
        active: activeJobs,
        closed: totalJobs - activeJobs,
      },
      applications: {
        total: totalApplications,
        by_status: {
          applied: appliedCount,
          reviewing: reviewingCount,
          accepted: acceptedCount,
          rejected: rejectedCount,
        },
      },
      trends: {
        user_registrations: {
          last_30_days: usersByDay,
        },
        job_postings: {
          last_30_days: jobsByDay,
        },
      },
    };
  }

  /**
   * Helper method to group dates by day
   */
  private groupByDay(dates: Date[]): Record<string, number> {
    const grouped: Record<string, number> = {};

    dates.forEach(date => {
      // Skip invalid dates
      if (!date || isNaN(date.getTime())) {
        return;
      }
      const day = date.toISOString().split('T')[0];
      grouped[day] = (grouped[day] || 0) + 1;
    });

    return grouped;
  }

  /**
   * Get all applications including soft-deleted for audit purposes
   * Requirements: 28.3
   */
  async getAllApplications(
    includeDeleted: boolean = false,
    page: number = 1,
    perPage: number = 20,
  ) {
    const where = includeDeleted ? {} : { deleted_at: null };

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
        jobs: {
          include: {
            companies: true,
          },
        },
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
}
