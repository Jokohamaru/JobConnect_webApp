import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobService {
  constructor(private prisma: PrismaService) {}

  async create(createJobDto: CreateJobDto) {
    const { company_id, skill_ids, tag_ids, ...jobData } = createJobDto;
    
    try {
      return await this.prisma.job.create({
        data: {
          ...jobData,
          company: { connect: { id: company_id } },
          // Việc map skill_ids và tag_ids vào bảng trung gian JobSkill, JobTag 
          // có thể được thêm logic vào đây sau nếu cần thiết
        },
      });
    } catch (error: any) {
      if (error.code === 'P2003' || error.code === 'P2025') {
        throw new BadRequestException('ID Công ty không tồn tại trong hệ thống!');
      }
      throw new BadRequestException('Lỗi tạo Job: ' + error.message);
    }
  }

  async findAll() {
    return await this.prisma.job.findMany({ 
      include: { company: true } 
    });
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({ 
      where: { id },
      include: { 
        company: true,
        skills: { include: { skill: true } },
        tags: { include: { tag: true } }
      }
    });
    if (!job) throw new NotFoundException('Không tìm thấy tin tuyển dụng này!');
    return job;
  }

  async update(id: string, updateJobDto: UpdateJobDto) {
    const { company_id, skill_ids, tag_ids, ...jobData } = updateJobDto;
    
    try {
      return await this.prisma.job.update({
        where: { id },
        data: {
          ...jobData,
          ...(company_id && { company: { connect: { id: company_id } } }),
        },
      });
    } catch (error: any) {
      if (error.code === 'P2025') throw new NotFoundException('Tin tuyển dụng không tồn tại!');
      throw new BadRequestException('Lỗi cập nhật: ' + error.message);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.job.delete({ where: { id } });
    } catch (error: any) {
      if (error.code === 'P2025') throw new NotFoundException('Tin tuyển dụng không tồn tại!');
      throw error;
    }
  }
}