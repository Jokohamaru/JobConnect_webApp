import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  IsBoolean,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ExperienceInputDto {
  @IsString()
  @IsNotEmpty()
  company: string;

  @IsString()
  @IsNotEmpty()
  position: string;

  @IsString()
  @IsOptional()
  workType?: string; // fulltime, parttime, freelance, intern

  @IsString()
  @IsOptional()
  startDate?: string; // MM/YYYY

  @IsString()
  @IsOptional()
  endDate?: string; // MM/YYYY

  @IsBoolean()
  @IsOptional()
  isCurrent?: boolean;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  achievements?: string;
}

export class EducationInputDto {
  @IsString()
  @IsNotEmpty()
  school: string;

  @IsString()
  @IsNotEmpty()
  degree: string; // highschool, diploma, bachelor, master, phd, other

  @IsString()
  @IsNotEmpty()
  major: string;

  @IsString()
  @IsOptional()
  startDate?: string; // MM/YYYY

  @IsString()
  @IsOptional()
  endDate?: string; // MM/YYYY

  @IsBoolean()
  @IsOptional()
  isCurrent?: boolean;

  @IsString()
  @IsOptional()
  gpa?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CertificateInputDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  issuer: string;

  @IsString()
  @IsOptional()
  date?: string;
}

export class GenerateCVDto {
  // Step 1 — Thông tin cơ bản
  @IsString()
  @IsNotEmpty()
  industry: string; // "it", "marketing", "business", "design", "education", "finance", "hr", "other"

  @IsString()
  @IsNotEmpty()
  jobTitle: string; // "Frontend Developer", "Marketing Executive"...

  @IsString()
  @IsNotEmpty()
  level: string; // "fresher", "under_1", "1_to_3", "3_to_5", "senior"

  @IsNumber()
  @IsOptional()
  templateId?: number;

  // Step 2 — Kinh nghiệm
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceInputDto)
  @IsOptional()
  experiences?: ExperienceInputDto[];

  // Step 3 — Học vấn
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EducationInputDto)
  @IsOptional()
  educations?: EducationInputDto[];

  // Step 4 — Kỹ năng
  @IsArray()
  @IsOptional()
  skills?: string[];

  @IsObject()
  @IsOptional()
  skillLevels?: Record<string, string>; // { "Excel": "Thành thạo", "React": "Khá" }

  @IsArray()
  @IsOptional()
  strengths?: string[]; // ["Làm việc nhóm", "Tư duy phân tích"]

  // Chứng chỉ
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CertificateInputDto)
  @IsOptional()
  certificates?: CertificateInputDto[];
}
