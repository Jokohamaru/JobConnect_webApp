import { IsArray, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class CreateCandidateDto {
  @IsString()
  user_id: string; // Bắt buộc phải có để link với bảng User

  @IsOptional()
  @IsString() // Dùng tạm IsString thay cho IsPhoneNumber để tránh lỗi validate định dạng quốc tế lúc dev
  phone_number?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skill_ids?: string[];
}