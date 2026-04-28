import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      return await this.prisma.user.create({
        data: {
          ...userData,
          password_hash: hashedPassword, // Sửa tên cột cho chuẩn Database
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Email này đã được đăng ký!');
      }
      throw new BadRequestException('Lỗi khi tạo người dùng: ' + error.message);
    }
  }

  async findAll() {
    return await this.prisma.user.findMany({
      orderBy: { created_at: 'desc' },
      select: { // Ẩn password_hash khi trả về danh sách cho an toàn
        id: true,
        email: true,
        full_name: true,
        role: true,
        is_active: true,
        created_at: true,
        last_login: true
      }
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`Không tìm thấy người dùng!`);
    
    // Xóa password_hash trước khi ném dữ liệu ra ngoài
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const { password, ...updateData } = updateUserDto;
      const dataToUpdate: any = { ...updateData };

      if (password) {
        const salt = await bcrypt.genSalt(10);
        dataToUpdate.password_hash = await bcrypt.hash(password, salt);
      }

      return await this.prisma.user.update({
        where: { id },
        data: dataToUpdate,
      });
    } catch (error: any) {
      if (error.code === 'P2025') throw new NotFoundException('Không tìm thấy người dùng để cập nhật');
      throw new BadRequestException('Lỗi cập nhật: ' + error.message);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.user.delete({ where: { id } });
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new BadRequestException('Không thể xóa tài khoản! Người dùng này đang bị ràng buộc dữ liệu.');
      }
      throw new BadRequestException('Lỗi khi xóa người dùng: ' + error.message);
    }
  }
}
