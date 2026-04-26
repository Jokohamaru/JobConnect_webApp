import { Injectable } from '@nestjs/common';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CvService {
  constructor(private prisma: PrismaService) {}

  async create(createCvDto: CreateCvDto) {
  try {
    return await this.prisma.cV.create({
      data: {
        title: createCvDto.title,
        CV_url: createCvDto.CV_url,
        status: createCvDto.status as any,
        // Viết trực tiếp tên cột mà Nam đã sửa trong Schema (đã có chữ n)
        candidate_id: Number(createCvDto.candidate_id), 
      }
    });
  } catch (error) {
    console.error("Lỗi tại Service:", error);
    throw error;
  }
}
  async findAll() {
    return await this.prisma.cV.findMany();
  }
  async findOne(id: number) {
    return await this.prisma.cV.findUnique({ where: { id } });
  }
  async update(id: number, updateCvDto: UpdateCvDto) {
    return await this.prisma.cV.update({ where: { id }, data: updateCvDto as any });
  }
  async remove(id: number) {
    return await this.prisma.cV.delete({ where: { id } });
  }
}
