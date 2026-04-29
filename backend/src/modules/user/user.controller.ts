import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * GET /users/me - Get authenticated user profile with role-specific data
   * Requirements: 15.1-15.4
   */
  @Get('me')
  async getMyProfile(@CurrentUser() user: any) {
    return await this.userService.getUserProfile(user.userId);
  }

  /**
   * PATCH /users/me - Update authenticated user profile
   * Requirements: 16.1-16.5
   */
  @Patch('me')
  async updateMyProfile(
    @CurrentUser() user: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.updateUserProfile(user.userId, updateUserDto);
  }

  /**
   * GET /users/:id - Get user by ID (admin only)
   * Requirements: 15.1-15.4
   */
  @Get(':id')
  @Roles('ADMIN')
  async getUserById(@Param('id') id: string) {
    return await this.userService.getUserById(id);
  }

  /**
   * GET /users - List all users (admin only)
   * Requirements: 15.1-15.4
   */
  @Get()
  @Roles('ADMIN')
  async getAllUsers() {
    return await this.userService.getAllUsers();
  }
}
