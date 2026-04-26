import { IsInt, IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator'; // Thêm IsOptional

export enum CvStatus {
  DONE = 'DONE',
  DRAFT = 'DRAFT',
  DELETED = 'DELETED',
}

export class CreateCvDto {
  @IsInt()
  @IsNotEmpty()
  candidate_id!: number;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  CV_url!: string;

  @IsEnum(CvStatus)
  @IsOptional() // Thêm dòng này ở đây
  status?: CvStatus;
}
