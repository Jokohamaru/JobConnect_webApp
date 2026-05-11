import { IsString, IsOptional, IsUrl, IsNotEmpty } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

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