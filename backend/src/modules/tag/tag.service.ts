import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService) {}

  async create(createTagDto: CreateTagDto) {
    return await this.prisma.tAG.create({ data: createTagDto as any });
  }

  async findAll() {
    return await this.prisma.tAG.findMany();
  }

  async findOne(id: number) {
    const tag = await this.prisma.tAG.findUnique({ where: { id } });
    if (!tag) throw new NotFoundException('Không tìm thấy TAG!');
    return tag;
  }

  async update(id: number, updateTagDto: UpdateTagDto) {
    try {
      return await this.prisma.tAG.update({
        where: { id },
        data: updateTagDto as any,
      });
    } catch (error) {
      if (error.code === 'P2025') throw new NotFoundException('Không tìm thấy TAG để cập nhật!');
      throw error;
    }
  }

// ... trong class TagService
async remove(id: number) {
    try {
      return await this.prisma.tAG.delete({ where: { id } });
    } catch (error) {
      if (error.code === 'P2003') throw new BadRequestException('TAG này đang được gắn vào Job, không thể xóa!');
      if (error.code === 'P2025') throw new NotFoundException('Không tìm thấy TAG để xóa!');
      throw error;
    }
  }
}
