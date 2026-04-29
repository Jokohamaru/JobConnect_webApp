import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
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
    return await this.userService.findOne(user.userId);
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
