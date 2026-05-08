import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCVDto } from './dto/create-cv.dto';
import { CVStatus, CVType } from '@prisma/client';
import { unlink } from 'fs/promises';
import { join } from 'path';
import * as htmlPdf from 'html-pdf-node';

@Injectable()
export class CVService {
  constructor(private prisma: PrismaService) {}

  async create(createCVDto: CreateCVDto, candidateId: string) {
    const cv = await this.prisma.cV.create({
      data: {
        title: createCVDto.title,
        cvUrl: createCVDto.cvUrl!,
        cvType: (createCVDto.cvType as CVType) || CVType.UPLOADED,
        cvData: createCVDto.cvData || null,
        status: CVStatus.DONE,
        candidateId,
      },
    });

    return cv;
  }

  async generatePDFFromHTML(htmlContent: string, title: string, userId: string, candidateId: string) {
    let cv;
    
    try {
      // Tạo CV record trước để có ID
      cv = await this.prisma.cV.create({
        data: {
          title,
          cvUrl: 'temp', // Temporary, sẽ update sau
          cvType: CVType.UPLOADED,
          status: CVStatus.DONE,
          candidateId,
        },
      });

      // Tạo tên file: userId_cvId.pdf
      const filename = `${userId}_${cv.id}.pdf`;
      
      // Fix path: uploads folder nằm ở root của project, không phải trong dist
      const uploadsDir = join(process.cwd(), 'uploads', 'cvs');
      const filePath = join(uploadsDir, filename);

      console.log('Starting PDF generation...');
      console.log('Uploads directory:', uploadsDir);
      console.log('File path:', filePath);

      // Đảm bảo folder tồn tại
      const fs = require('fs');
      if (!fs.existsSync(uploadsDir)) {
        console.log('Creating uploads directory...');
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Cấu hình PDF options
      const options = { 
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0mm',
          right: '0mm',
          bottom: '0mm',
          left: '0mm',
        },
      };

      const file = { content: htmlContent };

      console.log('Generating PDF with html-pdf-node...');
      
      // Generate PDF buffer
      const pdfBuffer = await htmlPdf.generatePdf(file, options);
      
      console.log('PDF buffer generated, writing to file...');
      
      // Write buffer to file
      await require('fs').promises.writeFile(filePath, pdfBuffer);

      console.log('PDF file written successfully');

      // Update CV với URL thực
      const cvUrl = `/uploads/cvs/${filename}`;
      await this.prisma.cV.update({
        where: { id: cv.id },
        data: { cvUrl },
      });

      console.log('CV updated with URL:', cvUrl);

      return {
        id: cv.id,
        title: cv.title,
        cvUrl,
        cvType: cv.cvType,
        createdAt: cv.createdAt,
      };
    } catch (error) {
      console.error('Error generating PDF:', error);
      console.error('Error stack:', error.stack);
      
      // Nếu generate PDF thất bại, xóa CV record
      if (cv) {
        try {
          await this.prisma.cV.delete({ where: { id: cv.id } });
          console.log('Cleaned up CV record');
        } catch (deleteError) {
          console.error('Error cleaning up CV record:', deleteError);
        }
      }
      
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }
  }

  async findAllByCandidate(candidateId: string) {
    return this.prisma.cV.findMany({
      where: {
        candidateId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, candidateId: string) {
    const cv = await this.prisma.cV.findFirst({
      where: {
        id,
        candidateId,
        deletedAt: null,
      },
    });

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    return cv;
  }

  async delete(id: string, candidateId: string) {
    const cv = await this.findOne(id, candidateId);

    // Chỉ xóa file vật lý nếu là UPLOADED type và file path là local
    if (cv.cvType === CVType.UPLOADED && cv.cvUrl.startsWith('/uploads/')) {
      try {
        // Fix path: uploads folder ở root của project
        const filePath = join(process.cwd(), cv.cvUrl);
        await unlink(filePath);
        console.log('Deleted file:', filePath);
      } catch (error) {
        console.error('Error deleting file:', error);
        // Không throw error nếu file không tồn tại
      }
    }

    // Soft delete trong database
    await this.prisma.cV.update({
      where: { id: cv.id },
      data: { deletedAt: new Date() },
    });

    return { message: 'CV deleted successfully' };
  }
}
