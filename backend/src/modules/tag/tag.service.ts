import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService) {}

  async create(createTagDto: CreateTagDto) {
    return await this.prisma.tag.create({ data: createTagDto });
  }

  async findAll() {
    return await this.prisma.tag.findMany();
  }

  async findOne(id: string) {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag) throw new NotFoundException('Không tìm thấy Tag!');
    return tag;
  }

  async update(id: string, updateTagDto: UpdateTagDto) {
    try {
      return await this.prisma.tag.update({
        where: { id },
        data: updateTagDto,
      });
    } catch (error: any) {
      if (error.code === 'P2025') throw new NotFoundException('Không tìm thấy Tag để cập nhật!');
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.tag.delete({ where: { id } });
    } catch (error: any) {
      if (error.code === 'P2003') throw new BadRequestException('Tag này đang được gắn vào Job, không thể xóa!');
      if (error.code === 'P2025') throw new NotFoundException('Không tìm thấy Tag để xóa!');
      throw error;
    }
  }
}