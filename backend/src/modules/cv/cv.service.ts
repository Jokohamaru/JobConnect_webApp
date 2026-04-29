import {
  Injectable,
  NotFoundException,
  BadRequestException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadCvDto } from './dto/upload-cv.dto';

@Injectable()
export class CvService {
  constructor(private prisma: PrismaService) {}

  /**
   * Upload CV for a candidate
   * Requirements: 6.1-6.4
   */
  async uploadCv(
    candidateId: string,
    uploadCvDto: UploadCvDto,
    fileSize?: number,
  ) {
    const { file_name, file_path, is_default } = uploadCvDto;

    // Validate file format (PDF, DOC, DOCX)
    // Requirements: 6.1, 6.2
    this.validateFileFormat(file_name);

    // Validate file size (max 5MB)
    // Requirements: 6.3
    if (fileSize !== undefined) {
      this.validateFileSize(fileSize);
    }

    // If is_default is true, unset all other CVs as default
    if (is_default) {
      await this.prisma.cvs.updateMany({
        where: { candidate_id: candidateId },
        data: { is_default: false },
      });
    }

    // Create CV record
    const cv = await this.prisma.cvs.create({
      data: {
        id: `cv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        candidate_id: candidateId,
        file_name,
        file_path,
        is_default: is_default || false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return cv;
  }

  /**
   * Get all CVs for a candidate
   * Requirements: 6.5
   */
  async getCandidateCvs(candidateId: string) {
    const cvs = await this.prisma.cvs.findMany({
      where: { candidate_id: candidateId },
      orderBy: { created_at: 'desc' },
    });

    return cvs;
  }

  /**
   * Delete a CV
   * Requirements: 6.6
   */
  async deleteCv(candidateId: string, cvId: string) {
    // Verify the CV belongs to the candidate
    const cv = await this.prisma.cvs.findUnique({
      where: { id: cvId },
    });

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    if (cv.candidate_id !== candidateId) {
      throw new BadRequestException(
        'You do not have permission to delete this CV',
      );
    }

    // Delete the CV record
    await this.prisma.cvs.delete({
      where: { id: cvId },
    });

    // Note: File cleanup should be handled separately
    // (e.g., delete the actual file from storage)

    return { message: 'CV deleted successfully' };
  }

  /**
   * Mark a CV as default
   * Requirements: 6.7
   */
  async markCvAsDefault(candidateId: string, cvId: string) {
    // Verify the CV belongs to the candidate
    const cv = await this.prisma.cvs.findUnique({
      where: { id: cvId },
    });

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    if (cv.candidate_id !== candidateId) {
      throw new BadRequestException(
        'You do not have permission to modify this CV',
      );
    }

    // Unset all other CVs as default for this candidate
    await this.prisma.cvs.updateMany({
      where: { candidate_id: candidateId },
      data: { is_default: false },
    });

    // Set this CV as default
    const updatedCv = await this.prisma.cvs.update({
      where: { id: cvId },
      data: {
        is_default: true,
        updated_at: new Date(),
      },
    });

    return updatedCv;
  }

  /**
   * Validate file size (helper method)
   * Requirements: 6.3
   */
  validateFileSize(fileSize: number) {
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (fileSize > maxSize) {
      throw new PayloadTooLargeException('File size exceeds 5MB limit');
    }
  }

  /**
   * Validate file format (helper method)
   * Requirements: 6.1, 6.2
   */
  validateFileFormat(fileName: string) {
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const fileExtension = fileName
      .toLowerCase()
      .substring(fileName.lastIndexOf('.'));

    if (!allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException('Unsupported file format');
    }
  }
}
