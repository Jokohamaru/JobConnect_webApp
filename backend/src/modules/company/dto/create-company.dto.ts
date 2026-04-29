import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';
import { CompanyType } from '@prisma/client';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  recruiter_id: string; // Trỏ tới bảng Recruiter bằng string (cuid)

  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString() // Dùng IsString hoặc IsUrl đều được
  website?: string;

  @IsString()
  @IsNotEmpty()
  industry: string;

  @IsEnum(CompanyType)
  company_type: CompanyType; // Khớp với Enum trong design.md

  @IsString()
  @IsNotEmpty()
  location: string;
}
