import { IsEmail, IsNotEmpty, IsString, IsEnum, IsOptional, MinLength } from 'class-validator';

export enum UserRole {
  CANDIDATE = 'CANDIDATE',
  RECRUITER = 'RECRUITER',
  ADMIN = 'ADMIN',
}

export class CreateUserDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu ít nhất 6 ký tự' })
  hash_password!: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.CANDIDATE;
}
