import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCvDto {
  @IsString()
  @IsNotEmpty()
  candidate_id: string; // Chuỗi ID của ứng viên

  @IsString()
  @IsNotEmpty()
  file_name: string;

  @IsString()
  @IsNotEmpty()
  file_path: string;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}