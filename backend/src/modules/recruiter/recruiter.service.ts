import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRecruiterDto } from './dto/create-recruiter.dto';
import { UpdateRecruiterDto } from './dto/update-recruiter.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecruiterService {
  constructor(private prisma: PrismaService) {}

  async create(createRecruiterDto: CreateRecruiterDto) {
    return await this.prisma.recruiter.create({
      data: createRecruiterDto as any,
    });
  }

  async findAll() {
    return await this.prisma.recruiter.findMany();
  }

  async findOne(id: number) {
    const recruiter = await this.prisma.recruiter.findUnique({ where: { id } });
    if (!recruiter) throw new NotFoundException('Không tìm thấy nhà tuyển dụng!');
    return recruiter;
  }

  async update(id: number, updateRecruiterDto: UpdateRecruiterDto) {
    return await this.prisma.recruiter.update({
      where: { id },
      data: updateRecruiterDto as any,
    });
  }

  async remove(id: number) {
    return await this.prisma.recruiter.delete({ where: { id } });
  }
}
