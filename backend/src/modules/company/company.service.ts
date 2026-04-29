import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async create(createCompanyDto: CreateCompanyDto) {
    const { recruiter_id, ...companyData } = createCompanyDto;
    
    try {
      return await this.prisma.company.create({
        data: {
          ...companyData,
          recruiter: { connect: { id: recruiter_id } }
        },
      });
    } catch (error: any) {
      if (error.code === 'P2003' || error.code === 'P2025') {
        throw new BadRequestException('ID Recruiter không tồn tại!');
      }
      if (error.code === 'P2002') {
        throw new BadRequestException('Mỗi Recruiter chỉ được tạo duy nhất một Công ty!');
      }
      throw error;
    }
  }

  async findAll() {
    return await this.prisma.company.findMany({
      include: { recruiter: true }
    });
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({ 
      where: { id },
      include: { recruiter: true } 
    });
    if (!company) throw new NotFoundException('Không tìm thấy công ty này!');
    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    const { recruiter_id, ...updateData } = updateCompanyDto;
    try {
      return await this.prisma.company.update({
        where: { id },
        data: {
          ...updateData,
          ...(recruiter_id && { recruiter: { connect: { id: recruiter_id } } })
        },
      });
    } catch (error: any) {
      if (error.code === 'P2025') throw new NotFoundException('Công ty không tồn tại để cập nhật!');
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.company.delete({ where: { id } });
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new BadRequestException('Không thể xóa Công ty đang có các Tin tuyển dụng (Job) đang hoạt động!');
      }
      if (error.code === 'P2025') throw new NotFoundException('Công ty không tồn tại!');
      throw error;
    }
  }
}