import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCandidateDto } from './dto/update-candidate.dto';

@Injectable()
export class CandidateService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get candidate profile with skills and CVs
   * Requirements: 5.4
   */
  async getCandidateProfile(userId: string) {
    const candidate = await this.prisma.candidates.findUnique({
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
        candidate_skills: {
          include: {
            skills: true,
          },
        },
        cvs: true,
        applications: {
          include: {
            jobs: {
              include: {
                companies: true,
              },
            },
          },
        },
      },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    return candidate;
  }

  /**
   * Get candidate profile by candidate ID
   * Requirements: 5.4
   */
  async getCandidateById(candidateId: string) {
    const candidate = await this.prisma.candidates.findUnique({
      where: { id: candidateId },
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
        candidate_skills: {
          include: {
            skills: true,
          },
        },
        cvs: true,
      },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return candidate;
  }

  /**
   * Update candidate profile
   * Requirements: 5.1-5.6
   */
  async updateCandidateProfile(
    userId: string,
    candidateId: string,
    updateDto: UpdateCandidateDto,
  ) {
    // Get the candidate to verify ownership
    const candidate = await this.prisma.candidates.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    // Verify the authenticated user owns this candidate profile
    if (candidate.user_id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this profile',
      );
    }

    // Extract skill_ids from updateDto
    const { skill_ids, ...profileData } = updateDto;

    // Update candidate profile
    const updatedCandidate = await this.prisma.candidates.update({
      where: { id: candidateId },
      data: {
        ...profileData,
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
        candidate_skills: {
          include: {
            skills: true,
          },
        },
        cvs: true,
      },
    });

    // Handle skill associations if skill_ids provided
    if (skill_ids && skill_ids.length > 0) {
      // Remove existing skills
      await this.prisma.candidate_skills.deleteMany({
        where: { candidate_id: candidateId },
      });

      // Add new skills
      await this.prisma.candidate_skills.createMany({
        data: skill_ids.map((skill_id) => ({
          id: `cs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          candidate_id: candidateId,
          skill_id,
        })),
      });

      // Fetch updated candidate with new skills
      return await this.prisma.candidates.findUnique({
        where: { id: candidateId },
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
          candidate_skills: {
            include: {
              skills: true,
            },
          },
          cvs: true,
        },
      });
    }

    return updatedCandidate;
  }
}
