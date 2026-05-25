import { Controller, Get, Post, Body, Param, Request, UseGuards } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Role } from '../../auth/enums/role.enum';

@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @Roles(Role.CANDIDATE)
  async create(@Body() createApplicationDto: CreateApplicationDto, @Request() req) {
    const userId = req.user.userId;
    
    // Get candidate profile
    const candidate = await this.applicationService['prisma'].candidate.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!candidate) {
      throw new Error('Candidate profile not found');
    }

    return this.applicationService.create(createApplicationDto, candidate.id);
  }

  @Get('my-applications')
  @Roles(Role.CANDIDATE)
  async getMyApplications(@Request() req) {
    const userId = req.user.userId;
    
    const candidate = await this.applicationService['prisma'].candidate.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!candidate) {
      throw new Error('Candidate profile not found');
    }

    return this.applicationService.findAllByCandidate(candidate.id);
  }

  @Get('check/:jobId')
  @Roles(Role.CANDIDATE)
  async checkIfApplied(@Param('jobId') jobId: string, @Request() req) {
    const userId = req.user.userId;
    
    const candidate = await this.applicationService['prisma'].candidate.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!candidate) {
      return { applied: false };
    }

    const applied = await this.applicationService.checkIfApplied(jobId, candidate.id);
    return { applied };
  }

  @Get('job/:jobId')
  @Roles(Role.RECRUITER)
  async getApplicationsByJob(@Param('jobId') jobId: string, @Request() req) {
    const userId = req.user.userId;
    const recruiter = await this.applicationService['prisma'].recruiter.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!recruiter) {
      throw new Error('Không tìm thấy thông tin nhà tuyển dụng');
    }
    return this.applicationService.findAllByJob(jobId, recruiter.id);
  }

  @Post(':id/match')
  @Roles(Role.RECRUITER)
  async matchApplication(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId;
    const recruiter = await this.applicationService['prisma'].recruiter.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!recruiter) {
      throw new Error('Không tìm thấy thông tin nhà tuyển dụng');
    }
    return this.applicationService.matchApplication(id, recruiter.id);
  }

  @Get(':id')
  @Roles(Role.RECRUITER)
  async getApplicationById(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId;
    const recruiter = await this.applicationService['prisma'].recruiter.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!recruiter) {
      throw new Error('Không tìm thấy thông tin nhà tuyển dụng');
    }
    return this.applicationService.findOneForRecruiter(id, recruiter.id);
  }
}

