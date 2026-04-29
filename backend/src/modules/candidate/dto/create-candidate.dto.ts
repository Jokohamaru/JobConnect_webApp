import { IsOptional, IsString, IsArray } from 'class-validator';
import { IsPhoneNumber } from '../../../common/validators';

export class CreateCandidateDto {
  @IsOptional()
  @IsString()
  @IsPhoneNumber({ message: 'Phone number must contain only digits and hyphens' })
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
