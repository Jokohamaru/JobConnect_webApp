import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { CvService } from './cv.service';
import { UploadCvDto } from './dto/upload-cv.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('candidates/me/cvs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CANDIDATE')
export class CvController {
  constructor(
    private readonly cvService: CvService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * POST /candidates/me/cvs - Upload CV
   * Requirements: 6.1-6.4
   */
  @Post()
  async uploadCv(
    @CurrentUser() user: any,
    @Body() uploadCvDto: UploadCvDto,
  ) {
    // Get candidate ID from user
    const candidate = await this.getCandidateFromUser(user.userId);
    return await this.cvService.uploadCv(candidate.id, uploadCvDto);
  }

  /**
   * GET /candidates/me/cvs - List candidate CVs
   * Requirements: 6.5
   */
  @Get()
  async getCandidateCvs(@CurrentUser() user: any) {
    const candidate = await this.getCandidateFromUser(user.userId);
    return await this.cvService.getCandidateCvs(candidate.id);
  }

  /**
   * DELETE /candidates/me/cvs/:cvId - Delete CV
   * Requirements: 6.6
   */
  @Delete(':cvId')
  async deleteCv(@CurrentUser() user: any, @Param('cvId') cvId: string) {
    const candidate = await this.getCandidateFromUser(user.userId);
    return await this.cvService.deleteCv(candidate.id, cvId);
  }

  /**
   * PATCH /candidates/me/cvs/:cvId/default - Mark CV as default
   * Requirements: 6.7
   */
  @Patch(':cvId/default')
  async markCvAsDefault(
    @CurrentUser() user: any,
    @Param('cvId') cvId: string,
  ) {
    const candidate = await this.getCandidateFromUser(user.userId);
    return await this.cvService.markCvAsDefault(candidate.id, cvId);
  }

  /**
   * Helper method to get candidate from user ID
   */
  private async getCandidateFromUser(userId: string) {
    const candidate = await this.prisma.candidates.findUnique({
      where: { user_id: userId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate profile not found');
    }

    return candidate;
  }
}
