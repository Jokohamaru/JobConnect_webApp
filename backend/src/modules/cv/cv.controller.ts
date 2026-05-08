import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Body, 
  Param, 
  Request, 
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
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
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/cvs',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `cv-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        // Chỉ chấp nhận PDF files
        if (!file.originalname.match(/\.(pdf)$/)) {
          return callback(
            new BadRequestException('Only PDF files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async create(
    @Body() createCVDto: CreateCVDto, 
    @UploadedFile() file: Express.Multer.File,
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

    let cvUrl: string;
    let cvType: CVType = CVType.UPLOADED;

    // Case 1: File upload (from profile dashboard)
    if (file) {
      cvUrl = `/uploads/cvs/${file.filename}`;
      cvType = CVType.UPLOADED;
    } 
    // Case 2: CV URL provided (from CV builder)
    else if (createCVDto.cvUrl) {
      cvUrl = createCVDto.cvUrl;
      cvType = createCVDto.cvType || CVType.BUILDER;
    } 
    // Case 3: No file and no URL
    else {
      throw new BadRequestException('Either CV file or CV URL is required');
    }

    return this.cvService.create(
      { 
        ...createCVDto, 
        cvUrl,
        cvType,
      }, 
      candidate.id
    );
  }

  @Post('generate-pdf')
  @Roles(Role.CANDIDATE)
  async generatePDF(@Body() body: { title: string; htmlContent: string }, @Request() req: any) {
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

      // Generate PDF và lưu với tên: userId_cvId.pdf
      const result = await this.cvService.generatePDFFromHTML(
        body.htmlContent,
        body.title,
        userId,
        candidate.id
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
