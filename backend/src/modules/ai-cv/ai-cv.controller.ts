import {
  Controller,
  Post,
  Get,
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

@Controller('ai-cv')
export class AiCVController {
  constructor(private readonly aiCVService: AiCVService) {}

  /**
   * GET /ai-cv/test
   * Test endpoint không cần auth
   */
  @Get('test')
  @HttpCode(HttpStatus.OK)
  async test(): Promise<{ message: string }> {
    return { message: 'AI CV service is working!' };
  }

  /**
   * POST /ai-cv/generate
   * Nhận form data từ wizard AI CV builder, gọi Gemini API, trả về CVData JSON
   */
  @Post('generate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CANDIDATE)
  @HttpCode(HttpStatus.OK)
  async generateAICV(
    @Body() dto: GenerateCVDto,
    @Request() req: any,
  ): Promise<Record<string, any>> {
    console.log('🚀 AI CV Generate request received');
    console.log('User ID:', req.user?.userId);
    console.log('User Role:', req.user?.role);
    console.log('DTO:', JSON.stringify(dto, null, 2));
    
    const userId = req.user.userId;
    const result = await this.aiCVService.generateCVData(dto, userId);
    
    console.log('✅ AI CV Generated successfully');
    return result;
  }
}
