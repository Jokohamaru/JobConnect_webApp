import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { RecruiterService } from './recruiter.service';
import { UpdateRecruiterDto } from './dto/update-recruiter.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('recruiters')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RecruiterController {
  constructor(private readonly recruiterService: RecruiterService) {}

  /**
   * GET /recruiters/me - Get authenticated recruiter profile
   * Requirements: 7.5
   */
  @Get('me')
  @Roles('RECRUITER')
  async getMyProfile(@CurrentUser() user: any) {
    return await this.recruiterService.getRecruiterProfile(user.userId);
  }

  /**
   * PATCH /recruiters/me - Update authenticated recruiter profile
   * Requirements: 7.1-7.6
   */
  @Patch('me')
  @Roles('RECRUITER')
  async updateMyProfile(
    @CurrentUser() user: any,
    @Body() updateRecruiterDto: UpdateRecruiterDto,
  ) {
    // Get recruiter by user_id first
    const recruiter = await this.recruiterService.getRecruiterProfile(
      user.userId,
    );
    return await this.recruiterService.updateRecruiterProfile(
      user.userId,
      recruiter.id,
      updateRecruiterDto,
    );
  }
}
