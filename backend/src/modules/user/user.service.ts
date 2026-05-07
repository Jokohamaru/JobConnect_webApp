import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {

  constructor(private prisma: PrismaService) { }

  async create(createUserDto: CreateUserDto) {

    // Kiểm tra Tài khoản available
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email }
    })

    if (existingUser) {
      throw new ConflictException('Tài khoản đã tồn tại');
    }

    // Thêm User - Candidate
    const unhashPassword = createUserDto.password;
    const hashedPassword = await bcrypt.hash(unhashPassword, 10);

    return await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        role: createUserDto.role
      }
    })
  }

  async findAll() {
    return await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      }
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`Không tìm thấy người dùng!`);

    // Xóa password_hash trước khi ném dữ liệu ra ngoài
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const { password, ...updateData } = updateUserDto as CreateUserDto;
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
