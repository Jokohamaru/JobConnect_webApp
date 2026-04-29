import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CandidateService } from './candidate.service';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('candidates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}

  /**
   * GET /candidates/me - Get authenticated candidate profile
   * Requirements: 5.4
   */
  @Get('me')
  @Roles('CANDIDATE')
  async getMyProfile(@CurrentUser() user: any) {
    return await this.candidateService.getCandidateProfile(user.userId);
  }

  /**
   * PATCH /candidates/me - Update authenticated candidate profile
   * Requirements: 5.1-5.6
   */
  @Patch('me')
  @Roles('CANDIDATE')
  async updateMyProfile(
    @CurrentUser() user: any,
    @Body() updateCandidateDto: UpdateCandidateDto,
  ) {
    // Get candidate by user_id first
    const candidate = await this.candidateService.getCandidateProfile(
      user.userId,
    );
    return await this.candidateService.updateCandidateProfile(
      user.userId,
      candidate.id,
      updateCandidateDto,
    );
  }

  /**
   * GET /candidates/:id - Get candidate by ID
   * Requirements: 5.4
   */
  @Get(':id')
  async getCandidateById(@Param('id') id: string) {
    return await this.candidateService.getCandidateById(id);
  }
}
