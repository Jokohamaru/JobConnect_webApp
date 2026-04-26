import { IsInt, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateCompanyDto {
  @IsInt()
  @IsNotEmpty()
  recruiter_id!: number; // Khóa ngoại trỏ tới Recruiter

  @IsInt()
  @IsNotEmpty()
  company_type_id!: number; // Khóa ngoại trỏ tới CompanyType (Tên biến thêm _id cho chuẩn DB)

  @IsOptional()
  @IsString()
  salary_rangename?: string;

  @IsOptional()
  @IsString()
  company_size?: string;

  @IsOptional()
  @IsString()
  nation?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString() // Có thể dùng @IsUrl() nếu muốn bắt buộc phải là link hợp lệ
  logo_url?: string;

  @IsOptional()
  @IsString()
  official_website_url?: string;
}
