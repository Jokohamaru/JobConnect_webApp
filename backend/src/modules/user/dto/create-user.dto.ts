import { IsString, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';
import { IsRFC5322Email, IsValidPassword } from '../../../common/validators';

export class CreateUserDto {
  @IsRFC5322Email({ message: 'Email must be a valid RFC 5322 email address' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsValidPassword({ message: 'Password must be at least 8 characters long' })
  password: string;

  @IsString()
  full_name: string;

  @IsEnum(UserRole)
  role: UserRole;
}
