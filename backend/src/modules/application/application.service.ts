import { Injectable } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApplicationService {
  constructor(private prisma: PrismaService) {}

  async create(createApplicationDto: CreateApplicationDto) {
    const { job_id, cv_id, status } = createApplicationDto;

    return await this.prisma.application.create({
      data: {
        status: status as any, // Ép kiểu Enum nếu cần
        // Thay vì dùng job_id, ta dùng tên relation là 'job'
        job: { 
          connect: { id: job_id } 
        },
        // Thay vì dùng CV_id (trong schema), ta dùng tên relation là 'cv'
        cv: { 
          connect: { id: cv_id } 
        }
      }
    });
  }

  async findAll() {
    return await this.prisma.application.findMany({
      include: { job: true, cv: true },
    });
  }

  async findOne(id: number) {
    return await this.prisma.application.findUnique({
      where: { id },
      include: { job: true, cv: true },
    });
  }

  async update(id: number, updateApplicationDto: UpdateApplicationDto) {
    return await this.prisma.application.update({
      where: { id },
      data: updateApplicationDto as any,
    });
  }

  async remove(id: number) {
    return await this.prisma.application.delete({
      where: { id }
    });
  }
}