import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
// Sửa thành:
import { UserRole } from '@prisma/client';

export class CreateAuthDto {
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password!: string;

  @IsString()
  full_name: string; // Thêm dòng này để fix lỗi AuthService dòng 24

  @IsEnum(UserRole, { message: 'Role phải là CANDIDATE, RECRUITER hoặc ADMIN' })
  @IsNotEmpty({ message: 'Role không được để trống' })
  role!: UserRole;
}
