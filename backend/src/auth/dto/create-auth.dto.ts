import { IsEmail, IsInt, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateAuthDto {
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password!: string;

@IsString()
@IsNotEmpty({ message: 'Tên không được để trống' })
name!: string;

  @IsInt()
  @IsNotEmpty()
  role!: number;

  // @IsString()
  // @IsOptional()
  // role?: string; // Ví dụ: 'CANDIDATE' hoặc 'EMPLOYER'
}
