import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAdminDto {
  @IsString({ message: 'user_id phải là chuỗi' })
  @IsNotEmpty({ message: 'user_id không được để trống' })
  user_id!: string;
}
