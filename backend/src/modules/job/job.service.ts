import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobService {
  constructor(private prisma: PrismaService) {}

  async create(createJobDto: any) {
  try {
    return await this.prisma.job.create({
      data: {
        title: createJobDto.title,
        company_id: Number(createJobDto.company_id),
        // Map từ field 'city_id' ở Postman sang cột 'Location' trong Schema
        Location: Number(createJobDto.city_id), 
        salary_range: createJobDto.salary_range,
        number: Number(createJobDto.number),
        status: createJobDto.status || 'DRAFT',
        
        // Nếu Nam có nạp thêm Tag hoặc Skill thì dùng connect ở đây
        // Hiện tại mình làm bản basic để Nam chạy thành công đã nhé
      },
    });
  } catch (error) {
    if (error.code === 'P2003') {
      throw new BadRequestException('ID Công ty hoặc ID Thành phố không tồn tại!');
    }
    throw error;
  }
}

  async findAll() {
    return await this.prisma.job.findMany({ include: { company: true, city: true } });
  }

  async findOne(id: number) {
    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) throw new NotFoundException('Không tìm thấy tin tuyển dụng này!');
    return job;
  }

  async update(id: number, updateJobDto: UpdateJobDto) {
    try {
      return await this.prisma.job.update({
        where: { id },
        data: updateJobDto as any,
      });
    } catch (error) {
      if (error.code === 'P2025') throw new NotFoundException('Tin tuyển dụng không tồn tại!');
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.job.delete({ where: { id } });
    } catch (error) {
      if (error.code === 'P2003' || error?.cause?.code === '23001') {
        throw new BadRequestException('Tin tuyển dụng này đã có ứng viên nộp đơn (Application), không thể xóa!');
      }
      throw error;
    }
  }
}