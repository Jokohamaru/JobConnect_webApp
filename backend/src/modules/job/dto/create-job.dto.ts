import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  company_id: string; // Đổi sang chuỗi (cuid)

  @IsString()
  @MinLength(5, { message: 'Tiêu đề công việc phải có ít nhất 5 ký tự' })
  title: string;

  @IsString()
  @MinLength(20, { message: 'Mô tả công việc phải có ít nhất 20 ký tự' })
  description: string;

  @IsString()
  @IsNotEmpty()
  location: string; // Thay thế cho city_id cũ

  @IsOptional()
  @IsNumber()
  @Min(0)
  salary_min?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salary_max?: number;

  @IsString()
  @IsNotEmpty()
  job_type: string;

  @IsArray()
  @IsString({ each: true })
  skill_ids: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tag_ids?: string[];
}
