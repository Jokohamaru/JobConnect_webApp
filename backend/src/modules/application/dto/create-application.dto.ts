import { IsNotEmpty, IsEnum, IsOptional, IsString } from 'class-validator';

export enum AppStatus {
  APPLIED = 'APPLIED',
  REVIEWING = 'REVIEWING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export class CreateApplicationDto {
  @IsString() // Đổi từ IsInt sang IsString
  @IsNotEmpty()
  job_id: string;

  @IsString() // Đổi từ IsInt sang IsString
  @IsNotEmpty()
  cv_id: string; // Đảm bảo viết thường 'cv_id' để khớp với Service

  @IsString() // Bổ sung candidate_id để fix lỗi "Property missing"
  @IsNotEmpty()
  candidate_id: string;

  @IsEnum(AppStatus)
  @IsOptional()
  status?: AppStatus;

  @IsOptional()
  @IsString()
  content?: string;
}
