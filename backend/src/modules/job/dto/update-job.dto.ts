import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { JobStatus } from '@prisma/client';
import { IsSalaryRangeValid } from '../../../common/validators';

export class UpdateJobDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  salary_min?: number;

  @IsOptional()
  @IsNumber()
  @IsSalaryRangeValid({ message: 'Minimum salary must be less than or equal to maximum salary' })
  salary_max?: number;

  @IsOptional()
  @IsString()
  job_type?: string;

  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;
}
