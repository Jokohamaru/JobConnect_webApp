import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateRecruiterDto } from './dto/update-recruiter.dto';

@Injectable()
export class RecruiterService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get recruiter profile with company and jobs
   * Requirements: 7.5
   */
  async getRecruiterProfile(userId: string) {
    const recruiter = await this.prisma.recruiters.findUnique({
      where: { user_id: userId },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            full_name: true,
            role: true,
            created_at: true,
            updated_at: true,
          },
        },
        companies: {
          include: {
            jobs: {
              include: {
                applications: true,
              },
            },
          },
        },
      },
    });

    if (!recruiter) {
      throw new NotFoundException('Recruiter profile not found');
    }

    return recruiter;
  }

  /**
   * Get recruiter profile by recruiter ID
   * Requirements: 7.5
   */
  async getRecruiterById(recruiterId: string) {
    const recruiter = await this.prisma.recruiters.findUnique({
      where: { id: recruiterId },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            full_name: true,
            role: true,
            created_at: true,
            updated_at: true,
          },
        },
        companies: {
          include: {
            jobs: true,
          },
        },
      },
    });

    if (!recruiter) {
      throw new NotFoundException('Recruiter not found');
    }

    return recruiter;
  }

  /**
   * Update recruiter profile
   * Requirements: 7.1-7.6
   */
  async updateRecruiterProfile(
    userId: string,
    recruiterId: string,
    updateDto: UpdateRecruiterDto,
  ) {
    // Get the recruiter to verify ownership
    const recruiter = await this.prisma.recruiters.findUnique({
      where: { id: recruiterId },
    });

    if (!recruiter) {
      throw new NotFoundException('Recruiter profile not found');
    }

    // Verify the authenticated user owns this recruiter profile
    if (recruiter.user_id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this profile',
      );
    }

    // Update recruiter profile
    const updatedRecruiter = await this.prisma.recruiters.update({
      where: { id: recruiterId },
      data: {
        ...updateDto,
        updated_at: new Date(),
      },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            full_name: true,
            role: true,
            created_at: true,
            updated_at: true,
          },
        },
        companies: {
          include: {
            jobs: {
              include: {
                applications: true,
              },
            },
          },
        },
      },
    });

    return updatedRecruiter;
  }
}
