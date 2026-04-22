import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../modules/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import * as bcrypt from 'bcrypt';
import { User_role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  create(createAuthDto: CreateAuthDto) {
    return this.register(createAuthDto);
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
  // ------------------------------------------------

  // Logic Đăng ký chuẩn Schema mới
  async register(dto: CreateAuthDto) {
    const userExist = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (userExist) throw new ConflictException('Email này đã được sử dụng!');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
          email: dto.email,
          hash_password: hashedPassword, 
          role: dto.role, 
        },
    });
  }

  // Logic Đăng nhập
  async login(dto: UpdateAuthDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Thông tin tài khoản không chính xác');

    const isMatch = await bcrypt.compare(dto.password, user.hash_password);
    if (!isMatch) throw new UnauthorizedException('Thông tin tài khoản không chính xác');

    const payload = { sub: user.id, email: user.email, role: user.role };
    
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}