import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  async getDashboardStats() {
    return await this.adminService.getDashboardStats();
  }

  @Get('users/stats')
  async getUsersStats() {
    return await this.adminService.getUsersStats();
  }

  @Get('users')
  async getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return await this.adminService.getUsers(pageNum, limitNum, search);
  }

  @Post('users')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.adminService.createUser(createUserDto);
  }

  // Company endpoints
  @Get('companies/stats')
  async getCompaniesStats() {
    return await this.adminService.getCompaniesStats();
  }

  @Get('companies')
  async getCompanies(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return await this.adminService.getCompanies(pageNum, limitNum, search);
  }

  @Get('companies/types')
  async getCompanyTypes() {
    return await this.adminService.getCompanyTypes();
  }

  @Post('companies')
  @UseInterceptors(FileInterceptor('logo', {
    storage: diskStorage({
      destination: './uploads/companies',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  async createCompany(
    @Body() createCompanyDto: CreateCompanyDto,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    return await this.adminService.createCompany(createCompanyDto, logo);
  }

  @Get('companies/:id')
  async getCompanyById(@Param('id') id: string) {
    return await this.adminService.getCompanyById(id);
  }

  @Put('companies/:id')
  @UseInterceptors(FileInterceptor('logo', {
    storage: diskStorage({
      destination: './uploads/companies',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  async updateCompany(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    return await this.adminService.updateCompany(id, updateCompanyDto, logo);
  }

  @Delete('companies/:id')
  async deleteCompany(@Param('id') id: string) {
    return await this.adminService.deleteCompany(id);
  }

  // Job endpoints
  @Get('jobs/stats')
  async getJobsStats() {
    return await this.adminService.getJobsStats();
  }

  @Get('jobs')
  async getJobs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return await this.adminService.getJobs(pageNum, limitNum, search, status);
  }

  @Get('recruiters')
  async getRecruiters() {
    return await this.adminService.getRecruiters();
  }

  @Post('jobs')
  async createJob(@Body() createJobDto: any) {
    return await this.adminService.createJob(createJobDto);
  }
}
