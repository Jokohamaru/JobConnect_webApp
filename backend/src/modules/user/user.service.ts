import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return await this.prisma.user.create({ data: createUserDto as any });
  }

  async findAll() {
    return await this.prisma.user.findMany();
  }

  async findOne(id: number) {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.prisma.user.update({ 
      where: { id }, 
      data: updateUserDto as any 
    });
  }

  async remove(id: number) {
    try {
      // Thực hiện lệnh xóa User
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      // Bắt lỗi vi phạm khóa ngoại (RESTRICT) khi HR đang nắm giữ Công ty
      if (error.code === 'P2003' || error?.cause?.code === '23001') {
        throw new BadRequestException(
          'Không thể xóa tài khoản! HR này đang quản lý một Công ty. Vui lòng chuyển giao quyền hoặc gỡ Công ty trước khi xóa.'
        );
      }
      
      // Nếu là lỗi khác (ví dụ: User không tồn tại) thì ném lỗi gốc
      throw error;
    }
  }
}