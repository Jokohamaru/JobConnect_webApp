import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get user profile with role-specific data
   * Requirements: 15.1-15.4
   */
  async getUserProfile(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      include: {
        candidates: {
          include: {
            candidate_skills: {
              include: {
                skills: true,
              },
            },
            cvs: true,
            applications: {
              include: {
                jobs: true,
              },
            },
          },
        },
        recruiters: {
          include: {
            companies: {
              include: {
                jobs: true,
              },
            },
          },
        },
        admins: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Exclude password from response
    const { password_hash, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  /**
   * Update user profile (email, full_name, password)
   * Requirements: 16.1-16.5
   */
  async updateUserProfile(userId: string, updateDto: UpdateUserDto) {
    // Check if email is being updated and if it's already taken
    if (updateDto.email) {
      const existingUser = await this.prisma.users.findUnique({
        where: { email: updateDto.email },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Email already registered');
      }
    }

    // Hash password if being updated
    const updateData: Prisma.usersUpdateInput = {};
    
    if (updateDto.email) {
      updateData.email = updateDto.email;
    }
    
    if (updateDto.full_name) {
      updateData.full_name = updateDto.full_name;
    }
    
    if (updateDto.password) {
      updateData.password_hash = await bcrypt.hash(updateDto.password, 10);
    }

    updateData.updated_at = new Date();

    const updatedUser = await this.prisma.users.update({
      where: { id: userId },
      data: updateData,
    });

    // Exclude password from response
    const { password_hash, ...userWithoutPassword } = updatedUser;

    return userWithoutPassword;
  }

  /**
   * Get user by ID (admin only)
   * Requirements: 15.1-15.4
   */
  async getUserById(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      include: {
        candidates: {
          include: {
            candidate_skills: {
              include: {
                skills: true,
              },
            },
            cvs: true,
          },
        },
        recruiters: {
          include: {
            companies: true,
          },
        },
        admins: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Exclude password from response
    const { password_hash, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  /**
   * Get all users (admin only)
   * Requirements: 15.1-15.4
   */
  async getAllUsers() {
    const users = await this.prisma.users.findMany({
      include: {
        candidates: true,
        recruiters: true,
        admins: true,
      },
    });

    // Exclude passwords from response
    return users.map(user => {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }
}
