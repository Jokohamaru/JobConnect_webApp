import { IsString, IsOptional, IsUrl } from 'class-validator';

export class UpdateCompanyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  size?: string;

  @IsString()
  @IsOptional()
  nation?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsUrl()
  @IsOptional()
  websiteUrl?: string;

  @IsString()
  @IsOptional()
  typeId?: string;
}
