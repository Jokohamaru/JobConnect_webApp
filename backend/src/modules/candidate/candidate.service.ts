import { Injectable, ConflictException } from '@nestjs/common';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';


@Injectable()
export class CandidateService {

  constructor(private prisma: PrismaService) { }

  async create(createCandidateDto: CreateCandidateDto) {
    // 1. Kiểm tra email tồn tại
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createCandidateDto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // 2. Hash mật khẩu
    const hashedPassword = await bcrypt.hash(createCandidateDto.password, 10);

    // 3. Chạy Transaction để tạo cả User và Candidate
    return this.prisma.$transaction(async (tx) => {
      const user = await this.prisma.user.create({
        data: {
          email: createCandidateDto.email,
          password: hashedPassword,
        }
      })

      const candidate = await this.prisma.candidate.create({
        data: {
          lastName: createCandidateDto.lastName,
          firstName: createCandidateDto.firstName,
          userId: user.id
        }
      })

      const { password, ...result } = user;
      return { ...result, profile: candidate };
    });
  }


  findAll() {
    return `This action returns all candidate`;
  }

  async findOne(id: string) {
    return await this.prisma.candidate.findUnique({
      where: { id },
      include: { user: true }
    });
  }

  async update(id: string, updateCandidateDto: UpdateCandidateDto) {
    return await this.prisma.candidate.update({
      where: { id },
      data: updateCandidateDto
    });
  }

  async remove(id: string) {
    return await this.prisma.$transaction(async (tx) => {
      const candidate = await this.prisma.candidate.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        }
      })

      const user = await this.prisma.user.update({
        where: { id: candidate.userId },
        data: { 
          status : "DELETED",
          deletedAt: new Date() 
        }
      })

      return "delete succesfully"
    });
  }
}
