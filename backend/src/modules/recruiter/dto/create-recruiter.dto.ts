import { IsOptional, IsString } from 'class-validator';

export class CreateRecruiterDto {
  @IsOptional()
  @IsString()
  company_id?: string;
}
