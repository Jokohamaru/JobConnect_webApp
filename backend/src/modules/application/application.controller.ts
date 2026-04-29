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
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  /**
   * POST /applications - Submit a job application
   * Requirements: 10.1-10.7
   */
  @Post()
  @Roles('CANDIDATE')
  async createApplication(
    @CurrentUser() user: any,
    @Body() createApplicationDto: CreateApplicationDto,
  ) {
    return await this.applicationService.createApplication(
      user.userId,
      createApplicationDto,
    );
  }

  /**
   * GET /applications - List applications
   * For candidates: their own applications
   * For recruiters: applications to their company's jobs
   * Requirements: 10.7, 13.1-13.4, 14.1-14.5
   */
  @Get()
  @Roles('CANDIDATE', 'RECRUITER')
  async getApplications(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('job_id') jobId?: string,
    @Query('page') page?: string,
    @Query('per_page') perPage?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const perPageNum = perPage ? parseInt(perPage, 10) : 20;

    return await this.applicationService.getApplications(
      user.userId,
      user.role,
      status,
      jobId,
      pageNum,
      perPageNum,
    );
  }

  /**
   * GET /applications/:id - Get application details
   * Requirements: 10.7, 13.1
   */
  @Get(':id')
  @Roles('CANDIDATE', 'RECRUITER')
  async getApplication(@CurrentUser() user: any, @Param('id') id: string) {
    return await this.applicationService.getApplicationById(
      user.userId,
      user.role,
      id,
    );
  }

  /**
   * PATCH /applications/:id/status - Update application status
   * Requirements: 11.1-11.7, 12.1-12.3
   */
  @Patch(':id/status')
  @Roles('RECRUITER')
  async updateApplicationStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateApplicationStatusDto,
  ) {
    return await this.applicationService.updateApplicationStatus(
      user.userId,
      id,
      updateStatusDto,
    );
  }

  /**
   * DELETE /applications/:id - Withdraw application (soft delete)
   * Requirements: 28.1-28.4
   */
  @Delete(':id')
  @Roles('CANDIDATE')
  async deleteApplication(@CurrentUser() user: any, @Param('id') id: string) {
    return await this.applicationService.deleteApplication(user.userId, id);
  }
}
