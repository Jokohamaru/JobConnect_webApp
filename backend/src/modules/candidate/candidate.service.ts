import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CandidateService {
  constructor(private prisma: PrismaService) {}

  // 1. Tạo mới Ứng viên
  async create(createCandidateDto: CreateCandidateDto) {
    const { user_id, ...rest } = createCandidateDto;
    try {
      return await this.prisma.candidate.create({
        data: {
          ...rest,
          // Bắt buộc dùng connect để nối với ID có sẵn trong bảng User
          user: { connect: { id: user_id } },
        },
      });
    } catch (error) {
      if (error.code === 'P2002') throw new BadRequestException('User này đã có hồ sơ ứng viên!');
      throw error;
    }
  }

  // 2. Lấy danh sách
  async findAll() {
    return await this.prisma.candidate.findMany();
  }

  // 3. Lấy chi tiết
  async findOne(id: number) {
    const candidate = await this.prisma.candidate.findUnique({ where: { id: Number(id) } });
    if (!candidate) throw new NotFoundException('Không tìm thấy ứng viên!');
    return candidate;
  }

  // 4. Cập nhật
  async update(id: number, updateCandidateDto: UpdateCandidateDto) {
    const { user_id, ...rest } = updateCandidateDto;
    return await this.prisma.candidate.update({
      where: { id: Number(id) },
      data: {
        ...rest,
        // Nếu muốn đổi sang user khác thì mới connect lại
        ...(user_id && { user: { connect: { id: user_id } } }),
      },
    });
  }

  // 5. Xóa (Đã thêm Try-Catch chống lỗi 500 như module TAG)
  async remove(id: number) {
    try {
      return await this.prisma.candidate.delete({
        where: { id: Number(id) },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Không tìm thấy Ứng viên với id = ${id} để xóa!`);
      }
      throw error;
    }
  }
}