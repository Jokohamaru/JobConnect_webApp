import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCandidateDto {
  @IsString()
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  lastName: string;

  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  password: string;
}
