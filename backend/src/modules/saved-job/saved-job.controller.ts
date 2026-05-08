import { Controller, Get, Post, Delete, Param, Request, UseGuards } from '@nestjs/common';
import { SavedJobService } from './saved-job.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Role } from '../../auth/enums/role.enum';

@Controller('saved-jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SavedJobController {
  constructor(private readonly savedJobService: SavedJobService) {}

  @Post(':jobId')
  @Roles(Role.CANDIDATE)
  async saveJob(@Param('jobId') jobId: string, @Request() req) {
    const userId = req.user.sub;
    
    const candidate = await this.savedJobService['prisma'].candidate.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!candidate) {
      throw new Error('Candidate profile not found');
    }

    return this.savedJobService.saveJob(jobId, candidate.id);
  }

  @Delete(':jobId')
  @Roles(Role.CANDIDATE)
  async unsaveJob(@Param('jobId') jobId: string, @Request() req) {
    const userId = req.user.sub;
    
    const candidate = await this.savedJobService['prisma'].candidate.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!candidate) {
      throw new Error('Candidate profile not found');
    }

    return this.savedJobService.unsaveJob(jobId, candidate.id);
  }

  @Get()
  @Roles(Role.CANDIDATE)
  async getMySavedJobs(@Request() req) {
    const userId = req.user.sub;
    
    const candidate = await this.savedJobService['prisma'].candidate.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!candidate) {
      throw new Error('Candidate profile not found');
    }

    return this.savedJobService.findAllByCandidate(candidate.id);
  }

  @Get('check/:jobId')
  @Roles(Role.CANDIDATE)
  async checkIfSaved(@Param('jobId') jobId: string, @Request() req) {
    const userId = req.user.sub;
    
    const candidate = await this.savedJobService['prisma'].candidate.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!candidate) {
      return { saved: false };
    }

    const saved = await this.savedJobService.checkIfSaved(jobId, candidate.id);
    return { saved };
  }
}
