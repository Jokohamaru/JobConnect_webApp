import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
// Sửa thành:
import { UserRole } from '@prisma/client';

export class CreateAuthDto {
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  lastName: string;

  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  password: string;
}
