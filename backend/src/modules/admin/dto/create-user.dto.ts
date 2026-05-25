import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEnum(['CANDIDATE', 'RECRUITER', 'ADMIN'])
  @IsNotEmpty()
  role: 'CANDIDATE' | 'RECRUITER' | 'ADMIN';

  @IsString()
  @IsOptional()
  companyId?: string;
}
