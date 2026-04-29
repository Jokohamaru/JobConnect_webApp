import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRecruiterDto {
  @IsString()
  @IsNotEmpty({ message: 'user_id không được để trống' })
  user_id: string; // Chuyển sang string (cuid) để nối với bảng User
}
