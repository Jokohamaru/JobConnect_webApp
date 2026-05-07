import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { $Enums } from '@prisma/client';

const { UserRole } = $Enums;
type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export class CreateUserDto {  
  @IsString()
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  first_name: string;

  @IsString()
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  last_name: string;

  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  password: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRoleType;
}
