import { Controller, Get, Param, Query } from '@nestjs/common';
import { JobService } from './job.service';

@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('cityId') cityId?: string,
    @Query('companyId') companyId?: string,
    @Query('minSalary') minSalary?: string,
    @Query('maxSalary') maxSalary?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 27;
    const skip = (pageNum - 1) * pageSizeNum;

    return this.jobService.findAll({
      skip,
      take: pageSizeNum,
      cityId,
      companyId,
      minSalary: minSalary ? parseInt(minSalary, 10) : undefined,
      maxSalary: maxSalary ? parseInt(maxSalary, 10) : undefined,
      search,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.jobService.findOne(id);
  }
}
