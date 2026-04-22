import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CityService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCityDto: CreateCityDto) {
    return await this.prisma.city.create({
      data: createCityDto,
    });
  }

  async findAll() {
    return await this.prisma.city.findMany();
  }

  async findOne(id: number) {
    const city = await this.prisma.city.findUnique({
      where: { id },
    });
    if (!city) {
      throw new NotFoundException(`Không tìm thấy thành phố với ID ${id}`);
    }
    return city;
  }

  async update(id: number, updateCityDto: UpdateCityDto) {
    await this.findOne(id); // Kiểm tra tồn tại trước khi update
    return await this.prisma.city.update({
      where: { id },
      data: updateCityDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Kiểm tra tồn tại trước khi xóa
    return await this.prisma.city.delete({
      where: { id },
    });
  }
}