import { IsString, IsOptional, IsEnum } from 'class-validator';
import { CompanyType } from '@prisma/client';
import { IsValidUrl } from '../../../common/validators';

export class UpdateCompanyDto {
  @IsOptional()
  @IsString({ message: 'Company name must be a string' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsValidUrl({ message: 'Website must be a valid URL' })
  website?: string;

  @IsOptional()
  @IsString({ message: 'Industry must be a string' })
  industry?: string;

  @IsOptional()
  @IsEnum(CompanyType, { message: 'Company type must be a valid CompanyType enum value' })
  company_type?: CompanyType;

  @IsOptional()
  @IsString({ message: 'Location must be a string' })
  location?: string;
}
