import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * GET /admin/users - List all users with optional role filtering
   * Requirements: 22.1-22.5
   */
  @Get('users')
  async getUsers(@Query('role') role?: string) {
    return await this.adminService.getAllUsers(role);
  }

  /**
   * GET /admin/analytics - Get platform analytics
   * Requirements: 23.1-23.4
   */
  @Get('analytics')
  async getAnalytics() {
    return await this.adminService.getPlatformAnalytics();
  }

  /**
   * GET /admin/applications - Get all applications including soft-deleted for audit
   * Requirements: 28.3
   */
  @Get('applications')
  async getAllApplications(
    @Query('include_deleted') includeDeleted?: string,
    @Query('page') page?: string,
    @Query('per_page') perPage?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const perPageNum = perPage ? parseInt(perPage, 10) : 20;
    const shouldIncludeDeleted = includeDeleted === 'true';

    return await this.adminService.getAllApplications(
      shouldIncludeDeleted,
      pageNum,
      perPageNum,
    );
  }
}
