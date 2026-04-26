import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async create(createCompanyDto: any) {
  try {
    return await this.prisma.company.create({
      data: {
        // Nối trực tiếp bằng ID vật lý
        recruiter_id: Number(createCompanyDto.recruiter_id),
        company_type: Number(createCompanyDto.company_type_id), // Map từ DTO sang cột trong DB
        
        // Các trường thông tin khác
        company_size: createCompanyDto.company_size,
        address: createCompanyDto.address,
        description: createCompanyDto.description,
        salary_rangename: createCompanyDto.salary_rangename,
        nation: createCompanyDto.nation,
        official_website_url: createCompanyDto.official_website_url,
        logo_url: createCompanyDto.logo_url
      },
    });
  } catch (error) {
    if (error.code === 'P2003') {
      throw new BadRequestException('ID Recruiter hoặc ID Loại công ty không tồn tại!');
    }
    if (error.code === 'P2002') {
      throw new BadRequestException('Mỗi Recruiter chỉ được tạo duy nhất một Công ty!');
    }
    throw error;
  }
}

  async findAll() {
    return await this.prisma.company.findMany({
      include: { 
        recruiter: true, 
        type: true // Sửa từ company_type thành type cho đúng schema
      }
    });
  }

  async findOne(id: number) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) throw new NotFoundException('Không tìm thấy công ty này!');
    return company;
  }

  async update(id: number, updateCompanyDto: UpdateCompanyDto) {
    try {
      return await this.prisma.company.update({
        where: { id },
        data: updateCompanyDto as any,
      });
    } catch (error) {
      if (error.code === 'P2025') throw new NotFoundException('Công ty không tồn tại để cập nhật!');
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.company.delete({ where: { id } });
    } catch (error) {
      if (error.code === 'P2003' || error?.cause?.code === '23001') {
        throw new BadRequestException('Không thể xóa Công ty đang có các Tin tuyển dụng (Job) đang hoạt động!');
      }
      throw error;
    }
  }
}