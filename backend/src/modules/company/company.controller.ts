import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  /**
   * POST /companies - Create a new company
   * Requirements: 7.1, 7.2
   */
  @Post()
  @Roles('RECRUITER')
  async createCompany(
    @CurrentUser() user: any,
    @Body() createCompanyDto: CreateCompanyDto,
  ) {
    return await this.companyService.createCompany(
      user.userId,
      createCompanyDto,
    );
  }

  /**
   * GET /companies/:id - Get company details
   * Requirements: 7.5
   */
  @Get(':id')
  async getCompany(@Param('id') id: string) {
    return await this.companyService.getCompanyById(id);
  }

  /**
   * PATCH /companies/:id - Update company information
   * Requirements: 7.3, 7.4, 7.6
   */
  @Patch(':id')
  @Roles('RECRUITER')
  async updateCompany(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    return await this.companyService.updateCompany(
      user.userId,
      id,
      updateCompanyDto,
    );
  }

  /**
   * GET /companies/:id/jobs - Get all jobs for a company
   * Requirements: 7.5
   */
  @Get(':id/jobs')
  async getCompanyJobs(@Param('id') id: string) {
    return await this.companyService.getCompanyJobs(id);
  }
}
