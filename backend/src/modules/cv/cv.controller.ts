import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Body, 
  Param, 
  Request, 
  UseGuards,
  BadRequestException
} from '@nestjs/common';
import { CVService } from './cv.service';
import { CreateCVDto, CVType } from './dto/create-cv.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Role } from '../../auth/enums/role.enum';

@Controller('cvs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CVController {
  constructor(private readonly cvService: CVService) {}

  @Post()
  @Roles(Role.CANDIDATE)
  async create(
    @Body() createCVDto: CreateCVDto, 
    @Request() req: any
  ) {
    const userId = req.user.userId;

    const candidate = await this.cvService['prisma'].candidate.findUnique({
      where: { userId: userId },
      select: { id: true },
    });

    if (!candidate) {
      throw new Error('Candidate profile not found');
    }

    // Chỉ chấp nhận CV từ builder với cvUrl và cvData
    if (!createCVDto.cvUrl) {
      throw new BadRequestException('CV URL is required');
    }

    const cvType = createCVDto.cvType || CVType.BUILDER;

    return this.cvService.create(
      { 
        ...createCVDto, 
        cvUrl: createCVDto.cvUrl,
        cvType,
      }, 
      candidate.id
    );
  }

  @Post('generate-pdf')
  @Roles(Role.CANDIDATE)
  async generatePDF(@Body() body: { title: string; htmlContent: string; cvData?: any }, @Request() req: any) {
    try {
      const userId = req.user.userId;

      const candidate = await this.cvService['prisma'].candidate.findUnique({
        where: { userId: userId },
        select: { id: true },
      });

      if (!candidate) {
        throw new Error('Candidate profile not found');
      }

      console.log('Generating PDF for user:', userId);
      console.log('Title:', body.title);
      console.log('HTML content length:', body.htmlContent?.length || 0);
      console.log('CV Data:', body.cvData ? 'Present' : 'Not present');

      // Generate PDF và lưu với tên: userId_cvId.pdf
      const result = await this.cvService.generatePDFFromHTML(
        body.htmlContent,
        body.title,
        userId,
        candidate.id,
        body.cvData
      );

      console.log('PDF generated successfully:', result);
      return result;
    } catch (error) {
      console.error('Error in generatePDF controller:', error);
      throw new BadRequestException(error.message || 'Failed to generate PDF');
    }
  }

  @Get()
  @Roles(Role.CANDIDATE)
  async getMyCVs(@Request() req: any) {
    const userId = req.user.userId;
    
    const candidate = await this.cvService['prisma'].candidate.findUnique({
      where: { userId: userId },
      select: { id: true },
    });

    if (!candidate) {
      throw new Error('Candidate profile not found');
    }

    return this.cvService.findAllByCandidate(candidate.id);
  }

  @Get(':id')
  @Roles(Role.CANDIDATE)
  async getOne(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId;
    
    const candidate = await this.cvService['prisma'].candidate.findUnique({
      where: { userId: userId },
      select: { id: true },
    });

    if (!candidate) {
      throw new Error('Candidate profile not found');
    }

    return this.cvService.findOne(id, candidate.id);
  }

  @Delete(':id')
  @Roles(Role.CANDIDATE)
  async delete(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId;
    
    const candidate = await this.cvService['prisma'].candidate.findUnique({
      where: { userId: userId },
      select: { id: true },
    });

    if (!candidate) {
      throw new Error('Candidate profile not found');
    }

    return this.cvService.delete(id, candidate.id);
  }
}
