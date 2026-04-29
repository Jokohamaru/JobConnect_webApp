import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { FilterJobDto } from './dto/filter-job.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Public } from '../../auth/decorators/public.decorator';

@Controller('jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JobController {
  constructor(private readonly jobService: JobService) {}

  /**
   * POST /jobs - Create a new job posting
   * Requirements: 8.1, 8.2, 8.3, 8.4
   */
  @Post()
  @Roles('RECRUITER')
  async createJob(
    @CurrentUser() user: any,
    @Body() createJobDto: CreateJobDto,
  ) {
    return await this.jobService.createJob(user.userId, createJobDto);
  }

  /**
   * GET /jobs - List all jobs with filtering and pagination
   * Requirements: 9.1-9.8
   */
  @Get()
  @Public()
  async getJobs(@Query() filters: FilterJobDto) {
    return await this.jobService.getJobs(filters);
  }

  /**
   * GET /jobs/:id - Get job details by ID
   * Requirements: 9.8, 26.1-26.4
   */
  @Get(':id')
  @Public()
  async getJob(@Param('id') id: string, @CurrentUser() user?: any) {
    // Pass userId if user is authenticated (for skill matching)
    const userId = user?.userId;
    return await this.jobService.getJobById(id, userId);
  }

  /**
   * PATCH /jobs/:id - Update job posting
   * Requirements: 8.5, 8.6
   */
  @Patch(':id')
  @Roles('RECRUITER')
  async updateJob(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
  ) {
    return await this.jobService.updateJob(user.userId, id, updateJobDto);
  }

  /**
   * DELETE /jobs/:id - Close/delete job posting
   * Requirements: 8.7
   */
  @Delete(':id')
  @Roles('RECRUITER')
  async deleteJob(@CurrentUser() user: any, @Param('id') id: string) {
    return await this.jobService.deleteJob(user.userId, id);
  }
}
