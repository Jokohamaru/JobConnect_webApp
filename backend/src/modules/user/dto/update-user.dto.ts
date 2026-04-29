import { IsOptional, IsString } from 'class-validator';
import { IsRFC5322Email, IsValidPassword } from '../../../common/validators';

export class UpdateUserDto {
  @IsOptional()
  @IsRFC5322Email({ message: 'Email must be a valid RFC 5322 email address' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Full name must be a string' })
  full_name?: string;

  @IsOptional()
  @IsString({ message: 'Password must be a string' })
  @IsValidPassword({ message: 'Password must be at least 8 characters long' })
  password?: string;
}
