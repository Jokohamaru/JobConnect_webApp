import { IsNotEmpty, IsString } from 'class-validator';
import { IsRFC5322Email } from '../../common/validators';

export class LoginDto {
  @IsRFC5322Email({ message: 'Email must be a valid RFC 5322 email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
