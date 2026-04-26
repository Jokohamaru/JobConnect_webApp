import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCompanyTypeDto } from './dto/create-company-type.dto';
import { UpdateCompanyTypeDto } from './dto/update-company-type.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompanyTypeService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCompanyTypeDto) {
    return await this.prisma.companyType.create({ data: dto as any });
  }

  async findAll() {
    return await this.prisma.companyType.findMany();
  }

  async findOne(id: number) {
    const type = await this.prisma.companyType.findUnique({ where: { id } });
    if (!type) throw new NotFoundException('Không tìm thấy loại công ty!');
    return type;
  }

  async update(id: number, dto: UpdateCompanyTypeDto) {
    try {
      return await this.prisma.companyType.update({ where: { id }, data: dto as any });
    } catch (error) {
      if (error.code === 'P2025') throw new NotFoundException('Không tìm thấy loại công ty!');
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.companyType.delete({ where: { id } });
    } catch (error) {
      if (error.code === 'P2003') {
        throw new BadRequestException('Loại hình công ty này đang có các Công ty tham chiếu, không thể xóa!');
      }
      throw error;
    }
  }
}