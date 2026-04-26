import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateRequirementSkillDto } from './dto/create-requirement-skill.dto';
import { UpdateRequirementSkillDto } from './dto/update-requirement-skill.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RequirementSkillService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRequirementSkillDto) {
    return await this.prisma.requirementSkill.create({ data: dto as any });
  }

  async findAll() {
    return await this.prisma.requirementSkill.findMany();
  }

  async findOne(id: number) {
    const skill = await this.prisma.requirementSkill.findUnique({ where: { id } });
    if (!skill) throw new NotFoundException('Không tìm thấy kỹ năng!');
    return skill;
  }

  async update(id: number, dto: UpdateRequirementSkillDto) {
    try {
      return await this.prisma.requirementSkill.update({ where: { id }, data: dto as any });
    } catch (error) {
       if (error.code === 'P2025') throw new NotFoundException('Không tìm thấy kỹ năng để sửa!');
       throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.requirementSkill.delete({ where: { id } });
    } catch (error) {
      if (error.code === 'P2003') {
        throw new BadRequestException('Kỹ năng này đang được yêu cầu trong các Job, không thể xóa!');
      }
      throw error;
    }
  }
}