import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { unlink } from 'fs/promises';
import { join } from 'path';

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

  /**
   * Lấy thông tin đầy đủ của user bao gồm candidate profile
   */
  async getFullProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        candidate: true,
      },
    });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng!');

    const { password, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Cập nhật profile: User (firstName, lastName, avaUrl) + Candidate (phoneNumber)
   */
  async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      dob?: string;
      gender?: string;
      address?: string;
      city?: string;
      link?: string;
    },
    avatarPath?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { candidate: true },
    });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng!');

    // Nếu upload avatar mới → xóa file cũ (nếu là file local)
    if (avatarPath && user.avaUrl && user.avaUrl.startsWith('/uploads/userAvas/')) {
      try {
        const oldPath = join(process.cwd(), user.avaUrl);
        await unlink(oldPath);
        console.log('Deleted old avatar:', oldPath);
      } catch (err) {
        console.warn('Could not delete old avatar:', err);
      }
    }

    // Update User model
    const userUpdateData: any = {};
    if (data.firstName !== undefined) userUpdateData.firstName = data.firstName;
    if (data.lastName !== undefined) userUpdateData.lastName = data.lastName;
    if (avatarPath) userUpdateData.avaUrl = avatarPath;

    await this.prisma.user.update({
      where: { id: userId },
      data: userUpdateData,
    });

    // Update Candidate model — upsert để tạo mới nếu chưa tồn tại
    const candidateData: any = {};
    if (data.phoneNumber !== undefined) candidateData.phoneNumber = data.phoneNumber;
    if (data.dob !== undefined) candidateData.dob = data.dob;
    if (data.gender !== undefined) candidateData.gender = data.gender;
    if (data.address !== undefined) candidateData.address = data.address;
    if (data.city !== undefined) candidateData.city = data.city;
    if (data.link !== undefined) candidateData.link = data.link;

    if (Object.keys(candidateData).length > 0) {
      await this.prisma.candidate.upsert({
        where: { userId },
        update: candidateData,
        create: { userId, ...candidateData },
      });
    }

    return this.getFullProfile(userId);
  }

  /**
   * Xóa avatar: set avaUrl = null, xóa file
   */
  async removeAvatar(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng!');

    if (user.avaUrl && user.avaUrl.startsWith('/uploads/userAvas/')) {
      try {
        const filePath = join(process.cwd(), user.avaUrl);
        await unlink(filePath);
      } catch (err) {
        console.warn('Could not delete avatar file:', err);
      }
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { avaUrl: null },
    });

    return this.getFullProfile(userId);
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
