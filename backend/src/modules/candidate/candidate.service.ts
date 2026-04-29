import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CandidateService {
  constructor(private prisma: PrismaService) {}

  async create(createCandidateDto: CreateCandidateDto) {
    const { user_id, skill_ids, ...rest } = createCandidateDto;
    try {
      return await this.prisma.candidate.create({
        data: {
          ...rest,
          user: { connect: { id: user_id } },
          // Note: Xử lý mảng skill_ids sẽ nối vào bảng candidate_skills nếu cần
        },
      });
    } catch (error) {
      if (error.code === 'P2002') throw new BadRequestException('User này đã có hồ sơ ứng viên!');
      throw error;
    }
  }

  async findAll() {
    return await this.prisma.candidate.findMany({
      include: { user: true }
    });
  }

  async findOne(id: string) {
    const candidate = await this.prisma.candidate.findUnique({ 
      where: { id },
      include: { user: true, skills: true }
    });
    if (!candidate) throw new NotFoundException('Không tìm thấy ứng viên!');
    return candidate;
  }

  async update(id: string, updateCandidateDto: UpdateCandidateDto) {
    try {
      return await this.prisma.candidate.update({
        where: { id },
        data: updateCandidateDto,
      });
    } catch (error) {
      if (error.code === 'P2025') throw new NotFoundException('Không tìm thấy ứng viên để cập nhật!');
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.candidate.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Không tìm thấy Ứng viên với id = ${id} để xóa!`);
      }
      throw error;
    }
  }
}