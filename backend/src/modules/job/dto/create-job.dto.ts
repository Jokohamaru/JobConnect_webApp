import { IsInt, IsNotEmpty, IsString, IsOptional, Min } from 'class-validator';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsInt()
  @IsNotEmpty()
  company_id!: number;

  @IsInt()
  @IsNotEmpty()
  city_id!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  salary?: number;
}
