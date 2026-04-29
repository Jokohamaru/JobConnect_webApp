import { IsString } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  job_id: string;

  @IsString()
  cv_id: string;
}
