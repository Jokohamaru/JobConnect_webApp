import { IsString, IsUUID } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  @IsUUID()
  jobId: string;

  @IsString()
  @IsUUID()
  cvId: string;
}
