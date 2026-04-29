import { IsString, IsOptional, IsEnum, MinLength } from 'class-validator';
import { CompanyType } from '@prisma/client';
import { IsValidUrl } from '../../../common/validators';

export class CreateCompanyDto {
  @IsString({ message: 'Company name must be a string' })
  @MinLength(2, { message: 'Company name must be at least 2 characters long' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsValidUrl({ message: 'Website must be a valid URL' })
  website?: string;

  @IsString({ message: 'Industry must be a string' })
  industry: string;

  @IsEnum(CompanyType, { message: 'Company type must be a valid CompanyType enum value' })
  company_type: CompanyType;

  @IsString({ message: 'Location must be a string' })
  location: string;
}
