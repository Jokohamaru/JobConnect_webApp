import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async create(createAdminDto: CreateAdminDto) {
    return await this.prisma.admin.create({
      data: {
        user: { connect: { id: createAdminDto.user_id } }
      },
    });
  }

  async findAll() {
    return await this.prisma.admin.findMany({
      include: { user: true } 
    });
  }

  async findOne(id: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
      include: { user: true }
    });
    if (!admin) throw new NotFoundException('Không tìm thấy Admin!');
    return admin;
  }

  // Đã bổ sung hàm update để hết báo lỗi đỏ ở Controller
  async update(id: string, updateAdminDto: UpdateAdminDto) {
    const admin = await this.prisma.admin.findUnique({ where: { id } });
    if (!admin) throw new NotFoundException('Không tìm thấy Admin!');

    return await this.prisma.admin.update({
      where: { id },
      data: updateAdminDto,
    });
  }

  async remove(id: string) {
    return await this.prisma.admin.delete({ where: { id } });
  }
}