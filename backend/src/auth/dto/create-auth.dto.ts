import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { User_role } from '@prisma/client';

export class CreateAuthDto {
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password!: string;

  @IsEnum(User_role, { message: 'Role phải là CANDIDATE, RECRUITER hoặc ADMIN' })
  @IsNotEmpty({ message: 'Role không được để trống' })
  role!: User_role;
}
