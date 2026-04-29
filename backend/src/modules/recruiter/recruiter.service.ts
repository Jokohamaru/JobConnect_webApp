import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateRecruiterDto } from './dto/create-recruiter.dto';
import { UpdateRecruiterDto } from './dto/update-recruiter.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecruiterService {
  constructor(private prisma: PrismaService) {}

  async create(createRecruiterDto: CreateRecruiterDto) {
    try {
      return await this.prisma.recruiter.create({
        data: {
          user: { connect: { id: createRecruiterDto.user_id } }
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Tài khoản User này đã là Nhà tuyển dụng rồi!');
      }
      if (error.code === 'P2025') {
        throw new BadRequestException('ID User không tồn tại!');
      }
      throw error;
    }
  }

  async findAll() {
    return await this.prisma.recruiter.findMany({
      include: { user: true, company: true } // Lấy kèm thông tin cá nhân và cty
    });
  }

  async findOne(id: string) {
    const recruiter = await this.prisma.recruiter.findUnique({ 
      where: { id },
      include: { user: true, company: true }
    });
    if (!recruiter) throw new NotFoundException('Không tìm thấy nhà tuyển dụng!');
    return recruiter;
  }

  async update(id: string, updateRecruiterDto: UpdateRecruiterDto) {
    try {
      return await this.prisma.recruiter.update({
        where: { id },
        data: updateRecruiterDto,
      });
    } catch (error: any) {
      if (error.code === 'P2025') throw new NotFoundException('Không tìm thấy nhà tuyển dụng để cập nhật!');
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.recruiter.delete({ where: { id } });
    } catch (error: any) {
      if (error.code === 'P2025') throw new NotFoundException('Nhà tuyển dụng không tồn tại!');
      throw error;
    }
  }
}
