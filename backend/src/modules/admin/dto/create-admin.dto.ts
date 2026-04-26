import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateAdminDto {
  @IsInt({ message: 'user_id phải là số nguyên' })
  @IsNotEmpty({ message: 'user_id không được để trống' })
  user_id!: number;
}
