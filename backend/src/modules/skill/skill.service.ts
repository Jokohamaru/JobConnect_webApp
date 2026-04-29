import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SkillService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSkillDto) {
    return await this.prisma.skill.create({ data: dto });
  }

  async findAll() {
    return await this.prisma.skill.findMany();
  }

  async findOne(id: string) {
    const skill = await this.prisma.skill.findUnique({ where: { id } });
    if (!skill) throw new NotFoundException('Không tìm thấy kỹ năng!');
    return skill;
  }

  async update(id: string, dto: UpdateSkillDto) {
    try {
      return await this.prisma.skill.update({ where: { id }, data: dto });
    } catch (error: any) {
       if (error.code === 'P2025') throw new NotFoundException('Không tìm thấy kỹ năng để sửa!');
       throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.skill.delete({ where: { id } });
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new BadRequestException('Kỹ năng này đang được yêu cầu trong các Job, không thể xóa!');
      }
      throw error;
    }
  }
}