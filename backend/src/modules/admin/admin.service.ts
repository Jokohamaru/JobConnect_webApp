import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { PrismaService } from '../prisma/prisma.service'; // Chú ý đường dẫn này Nam nhé

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // 1. Tạo mới Admin
  async create(createAdminDto: CreateAdminDto) {
    return await this.prisma.admin.create({
      data: createAdminDto,
    });
  }

  // 2. Lấy danh sách tất cả Admin
  async findAll() {
    return await this.prisma.admin.findMany({
      include: {
        user: true, // Để khi lấy Admin thì xem luôn được email/status của họ
      },
    });
  }

  // 3. Lấy chi tiết 1 Admin theo ID
  async findOne(id: number) {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!admin)
      throw new NotFoundException(`Không tìm thấy Admin với ID #${id}`);
    return admin;
  }

  // 4. Cập nhật Admin
  async update(id: number, updateAdminDto: UpdateAdminDto) {
    return await this.prisma.admin.update({
      where: { id },
      data: updateAdminDto,
    });
  }

  // 5. Xóa Admin
  async remove(id: number) {
    return await this.prisma.admin.delete({
      where: { id },
    });
  }
}
