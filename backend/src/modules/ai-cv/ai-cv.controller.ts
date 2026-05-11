import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AiCVService } from './ai-cv.service';
import { GenerateCVDto } from './dto/generate-cv.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';

@Controller('cvs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiCVController {
  constructor(private readonly aiCVService: AiCVService) {}

  /**
   * POST /cvs/generate-ai
   * Nhận form data từ wizard AI CV builder, gọi Gemini API, trả về CVData JSON
   */
  @Post('generate-ai')
  @Roles(Role.CANDIDATE)
  @HttpCode(HttpStatus.OK)
  async generateAICV(
    @Body() dto: GenerateCVDto,
    @Request() req: any,
  ): Promise<Record<string, any>> {
    const userId = req.user.userId;
    return this.aiCVService.generateCVData(dto, userId);
  }
}
