import { IsInt, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export enum AppStatus {
  APPLIED = 'APPLIED',
  REVIEWING = 'REVIEWING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export class CreateApplicationDto {
  @IsInt()
  @IsNotEmpty()
  job_id!: number;

  @IsInt()
  @IsNotEmpty()
  cv_id!: number;

  @IsEnum(AppStatus)
  @IsOptional()
  status?: AppStatus = AppStatus.APPLIED;
}
