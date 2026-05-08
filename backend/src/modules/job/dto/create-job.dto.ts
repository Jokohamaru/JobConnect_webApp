import { IsString, IsInt, IsOptional, IsEnum, IsArray, Min } from 'class-validator';
import { Currency } from '@prisma/client';

export class CreateJobDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsInt()
  @Min(1)
  headcount: number;

  @IsOptional()
  @IsInt()
  minSalary?: number;

  @IsOptional()
  @IsInt()
  maxSalary?: number;

  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @IsString()
  cityId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skillIds?: string[];
}
