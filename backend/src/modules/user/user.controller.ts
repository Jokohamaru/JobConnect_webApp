import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
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
}
