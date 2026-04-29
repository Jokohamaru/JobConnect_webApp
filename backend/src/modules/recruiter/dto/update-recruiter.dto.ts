import { IsOptional, IsString } from 'class-validator';

export class UpdateRecruiterDto {
  @IsOptional()
  @IsString()
  company_id?: string;
}
