import {
  IsNotEmpty,
  IsString,
  Matches,
  IsEnum,
  MinLength,
} from 'class-validator';
import { UserRole } from '@prisma/client';
import { IsRFC5322Email, IsValidPassword } from '../../common/validators';

export class RegisterDto {
  @IsRFC5322Email({ message: 'Email must be a valid RFC 5322 email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @IsValidPassword({ message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @IsString({ message: 'Full name must be a string' })
  @IsNotEmpty({ message: 'Full name is required' })
  @MinLength(2, { message: 'Full name must be at least 2 characters' })
  full_name: string;

  @IsEnum(UserRole, { message: 'Role must be CANDIDATE, RECRUITER, or ADMIN' })
  @IsNotEmpty({ message: 'Role is required' })
  role: UserRole;
}
