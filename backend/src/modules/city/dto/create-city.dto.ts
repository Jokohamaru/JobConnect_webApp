import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateCityDto {
  @IsString({ message: 'Tên thành phố phải là chữ' })
  @IsNotEmpty({ message: 'Tên thành phố không được để trống' })
  @MaxLength(20, { message: 'Tên thành phố không được vượt quá 20 ký tự' })
  name: string;
}