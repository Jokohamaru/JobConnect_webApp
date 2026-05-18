import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/auth/decorators/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Cấu hình multer storage cho avatar
const avatarStorage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = join(process.cwd(), 'uploads', 'userAvas');
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req: any, file, cb) => {
    const userId = req.user?.userId || 'unknown';
    const timestamp = Date.now();
    const ext = extname(file.originalname).toLowerCase();
    cb(null, `${userId}_${timestamp}${ext}`);
  },
});

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @Get()
  async findAll() {
    return await this.userService.findAll();
  }

  // Dời các Route cố định (như who-am-i) lên trên các Route động (:id) để tránh bị bắt nhầm
  @Get('who-am-i')
  @UseGuards(JwtAuthGuard) 
  async whoAmI(@User() user: any) {
    return await this.userService.findOne(user.userId); // user.userId giờ là chuỗi (cuid)
  }

  @Get('profile/me') 
  @UseGuards(JwtAuthGuard)
  async getMyProfile(@User() user: any) {
    return await this.userService.getFullProfile(user.userId);
  }

  /**
   * PATCH /user/profile/me
   * Cập nhật thông tin cá nhân + upload avatar
   * Body (multipart/form-data): avatar (file), firstName, lastName, phoneNumber
   */
  @Patch('profile/me')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar', {
    storage: avatarStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
      const allowedTypes = /\.(jpg|jpeg|png|gif|webp)$/i;
      if (!allowedTypes.test(extname(file.originalname))) {
        return cb(new BadRequestException('Chỉ chấp nhận file ảnh (jpg, png, gif, webp)'), false);
      }
      cb(null, true);
    },
  }))
  async updateMyProfile(
    @User() user: any,
    @Body() body: { firstName?: string; lastName?: string; phoneNumber?: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const avatarPath = file ? `/uploads/userAvas/${file.filename}` : undefined;
    return await this.userService.updateProfile(user.userId, body, avatarPath);
  }

  /**
   * DELETE /user/profile/me/avatar
   * Xóa avatar
   */
  @Delete('profile/me/avatar')
  @UseGuards(JwtAuthGuard)
  async removeMyAvatar(@User() user: any) {
    return await this.userService.removeAvatar(user.userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.userService.findOne(id); // Bỏ dấu +
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.update(id, updateUserDto); // Bỏ dấu +
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.userService.remove(id); // Bỏ dấu +
  }
}

