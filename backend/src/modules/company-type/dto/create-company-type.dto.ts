import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCompanyTypeDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}
