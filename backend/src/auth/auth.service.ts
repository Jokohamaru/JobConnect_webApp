// import { Prisma } from './../../../generated/prisma';
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../modules/prisma/prisma.service'; // Kiểm tra lại đường dẫn này
import { JwtService } from '@nestjs/jwt';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Prisma } from '@prisma/client'; 
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
// ---------------------------------------------------------------------------------------------


  // 1. Đăng ký tài khoản mới
  async register(dto: CreateAuthDto) {
    // Kiểm tra email đã tồn tại chưa
    const userExist = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (userExist) throw new ConflictException('Email này đã được sử dụng!');

    // Mã hóa mật khẩu trước khi lưu
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
          email: dto.email,
          hash_password: hashedPassword, 
          full_name: dto.name,
          user_role: dto.role,           
        },
    });
  }

  // 2. Đăng nhập và trả về Token
  async login(dto: UpdateAuthDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Thông tin tài khoản không chính xác');

    const isMatch = await bcrypt.compare(dto.password, user.hash_password);
    if (!isMatch) throw new UnauthorizedException('Thông tin tài khoản không chính xác');

    // Tạo JWT Payload (không có role theo ý bạn)
    const payload = { sub: user.id, email: user.email,role: user.user_role };
    
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
