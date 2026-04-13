import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  full_name: string;

  @IsNotEmpty()
  @MinLength(6)
  hash_password: string;

  @IsOptional()
  @IsString()
  ava_url?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
