import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject } from 'class-validator';

export enum CVType {
  UPLOADED = 'UPLOADED',
  BUILDER = 'BUILDER',
}

export class CreateCVDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  cvUrl?: string;

  @IsEnum(CVType)
  @IsOptional()
  cvType?: CVType;

  @IsObject()
  @IsOptional()
  cvData?: any; // CV builder data (JSON)
}
