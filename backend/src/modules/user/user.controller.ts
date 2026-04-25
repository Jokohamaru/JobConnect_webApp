import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/auth/decorators/user.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    // Gọi đúng tên hàm 'createUser' trong service của bạn
    return await this.userService.createUser(createUserDto);
  }

  @Get()
  async findAll() {
    // Gọi đúng tên hàm 'users' với object rỗng (theo params của service)
    return await this.userService.users({});
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    // Gọi đúng tên hàm 'user' và truyền object where
    return await this.userService.user({ id: +id });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    // Gọi đúng hàm 'updateUser' với cấu trúc params { where, data }
    return await this.userService.updateUser({
      where: { id: +id },
      data: updateUserDto,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    // Gọi đúng hàm 'deleteUser' với object where
    return await this.userService.deleteUser({ id: +id });
  }


  @Get('who-am-i')
@UseGuards(JwtAuthGuard) 
async whoAmI(@User() user: any) {
  // Triệu không cần Frontend gửi ID, Triệu tự biết luôn!
  console.log('Nhóm trưởng ơi, em biết đây là user ID:', user.userId);
  
  // Trả về thông tin chi tiết từ DB cho Frontend
  return await this.userService.user({ id: user.userId });
}

@Get('profile/me') // Phải có đúng chữ này ở đây
@UseGuards(JwtAuthGuard)
async getMyProfile(@User() user: any) {
  // Ở đây Triệu dùng user.userId hoặc user.sub tùy theo Strategy
  return await this.userService.user({ id: user.userId });
}
}
