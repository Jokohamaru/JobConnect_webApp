import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@Injectable()
export class CityService {
  constructor(private prisma: PrismaService) {}

  async create(createCityDto: CreateCityDto) {
    return await this.prisma.city.create({
      data: createCityDto,
    });
  }

  async findAll() {
    return await this.prisma.city.findMany();
  }

  // Bổ sung hàm findOne để fix lỗi TS2339
  async findOne(id: number) {
    const city = await this.prisma.city.findUnique({ where: { id } });
    if (!city) throw new NotFoundException('Không tìm thấy thành phố này!');
    return city;
  }

  // Bổ sung hàm update để fix lỗi TS2339
  async update(id: number, updateCityDto: UpdateCityDto) {
    try {
      return await this.prisma.city.update({
        where: { id },
        data: updateCityDto,
      });
    } catch (error) {
      if (error.code === 'P2025') throw new NotFoundException('Thành phố không tồn tại!');
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.city.delete({ where: { id } });
    } catch (error) {
      if (error.code === 'P2003' || error?.cause?.code === '23001') {
        throw new BadRequestException('Thành phố này đang được gán cho Job hoặc Công ty, không thể xóa!');
      }
      if (error.code === 'P2025') throw new NotFoundException('Thành phố không tồn tại!');
      throw error;
    }
  }
}