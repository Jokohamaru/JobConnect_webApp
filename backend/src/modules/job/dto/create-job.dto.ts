import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  MinLength,
  Min,
} from 'class-validator';
import { IsSalaryRangeValid } from '../../../common/validators';

export class CreateJobDto {
  @IsString({ message: 'Job title must be a string' })
  @MinLength(5, { message: 'Job title must be at least 5 characters long' })
  title: string;

  @IsString({ message: 'Job description must be a string' })
  @MinLength(20, { message: 'Job description must be at least 20 characters long' })
  description: string;

  @IsString({ message: 'Location must be a string' })
  location: string;

  @IsOptional()
  @IsNumber({}, { message: 'Minimum salary must be a number' })
  @Min(0, { message: 'Minimum salary must be greater than or equal to 0' })
  salary_min?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Maximum salary must be a number' })
  @Min(0, { message: 'Maximum salary must be greater than or equal to 0' })
  @IsSalaryRangeValid({ message: 'Minimum salary must be less than or equal to maximum salary' })
  salary_max?: number;

  @IsString({ message: 'Job type must be a string' })
  job_type: string;

  @IsArray({ message: 'Skill IDs must be an array' })
  @IsString({ each: true, message: 'Each skill ID must be a string' })
  skill_ids: string[];

  @IsOptional()
  @IsArray({ message: 'Tag IDs must be an array' })
  @IsString({ each: true, message: 'Each tag ID must be a string' })
  tag_ids?: string[];
}
