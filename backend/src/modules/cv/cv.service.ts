import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CvService {
  constructor(private prisma: PrismaService) {}

  async create(createCvDto: CreateCvDto) {
    const { candidate_id, ...cvData } = createCvDto;
    try {
      return await this.prisma.cV.create({
        data: {
          ...cvData,
          candidate: { connect: { id: candidate_id } }, 
        }
      });
    } catch (error: any) {
      if (error.code === 'P2003' || error.code === 'P2025') {
        throw new BadRequestException('ID Ứng viên không tồn tại!');
      }
      throw error;
    }
  }

  async findAll() {
    return await this.prisma.cV.findMany({
      include: { candidate: { include: { user: true } } }
    });
  }

  async findOne(id: string) {
    const cv = await this.prisma.cV.findUnique({ 
      where: { id },
      include: { candidate: true }
    });
    if (!cv) throw new NotFoundException('Không tìm thấy CV!');
    return cv;
  }

  async update(id: string, updateCvDto: UpdateCvDto) {
    const { candidate_id, ...updateData } = updateCvDto;
    try {
      return await this.prisma.cV.update({ 
        where: { id }, 
        data: {
          ...updateData,
          ...(candidate_id && { candidate: { connect: { id: candidate_id } } })
        }
      });
    } catch (error: any) {
      if (error.code === 'P2025') throw new NotFoundException('Không tìm thấy CV để cập nhật!');
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.cV.delete({ where: { id } });
    } catch (error: any) {
      if (error.code === 'P2025') throw new NotFoundException('Không tìm thấy CV để xóa!');
      throw error;
    }
  }
}
