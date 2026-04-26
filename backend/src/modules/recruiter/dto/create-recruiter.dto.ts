import { IsInt, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateRecruiterDto {
  @IsInt()
  @IsNotEmpty({ message: 'user_id không được để trống' })
  user_id!: number; // Kết nối với bảng User

  @IsString()
  @IsNotEmpty({ message: 'Họ không được để trống' })
  @Length(1, 20)
  first_name!: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên không được để trống' })
  @Length(1, 20)
  last_name!: string;

  @IsOptional()
  @IsString()
  @Length(10, 11, { message: 'Số điện thoại không hợp lệ' })
  phone_number?: string;
}
