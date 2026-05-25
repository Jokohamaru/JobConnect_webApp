import { Controller, Get, Post, Body, Param, Query, Request, UseGuards, ForbiddenException } from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';

@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createJobDto: CreateJobDto, @Request() req) {
    // Get recruiter info from JWT token
    const userId = req.user.userId;
    
    // Get recruiter profile to get companyId
    const recruiter = await this.jobService['prisma'].recruiter.findUnique({
      where: { userId },
      select: { id: true, companyId: true },
    });

    if (!recruiter) {
      throw new Error('Recruiter profile not found');
    }

    if (!recruiter.companyId) {
      throw new Error('Recruiter must be associated with a company');
    }

    return this.jobService.create(createJobDto, recruiter.id, recruiter.companyId);
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('cityId') cityId?: string,
    @Query('cityName') cityName?: string,
    @Query('companyId') companyId?: string,
    @Query('minSalary') minSalary?: string,
    @Query('maxSalary') maxSalary?: string,
    @Query('search') search?: string,
    @Query('tagNames') tagNames?: string | string[],
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 27;
    const skip = (pageNum - 1) * pageSizeNum;

    // tagNames can be a single string or array
    const tagNamesArr = tagNames
      ? Array.isArray(tagNames)
        ? tagNames
        : [tagNames]
      : undefined;

    return this.jobService.findAll({
      skip,
      take: pageSizeNum,
      cityId,
      cityName,
      companyId,
      minSalary: minSalary ? parseInt(minSalary, 10) : undefined,
      maxSalary: maxSalary ? parseInt(maxSalary, 10) : undefined,
      search,
      tagNames: tagNamesArr,
    });
  }

  @Get('recruiter')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RECRUITER)
  async findRecruiterJobs(@Request() req) {
    const userId = req.user.userId;
    const recruiter = await this.jobService['prisma'].recruiter.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!recruiter) {
      throw new ForbiddenException('Không tìm thấy thông tin nhà tuyển dụng');
    }
    return this.jobService.findRecruiterJobs(recruiter.id);
  }

  @Get('recruiter/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RECRUITER)
  async findRecruiterJobById(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId;
    const recruiter = await this.jobService['prisma'].recruiter.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!recruiter) {
      throw new ForbiddenException('Không tìm thấy thông tin nhà tuyển dụng');
    }
    return this.jobService.findOneForRecruiter(id, recruiter.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.jobService.findOne(id);
  }
}
