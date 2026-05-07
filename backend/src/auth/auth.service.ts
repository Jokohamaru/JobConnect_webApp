import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../modules/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: CreateAuthDto) {
    const userExist = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (userExist) throw new ConflictException('Email này đã được sử dụng!');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword, // Đã sửa tên cột
        role: dto.role,
      },
    });
  }

  async login(dto: UpdateAuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user)
      throw new UnauthorizedException('Thông tin tài khoản không chính xác');

    // Nếu đăng ký bằng tk có password
    if (user.password) {

      const isMatch = await bcrypt.compare(dto.password, user.password);
      if (!isMatch)
      throw new UnauthorizedException('Thông tin tài khoản không chính xác'); // Đã sửa tên cột
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
