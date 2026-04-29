import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateTagDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên Tag không được để trống' })
  @Length(2, 50, { message: 'Tên Tag phải từ 2 đến 50 ký tự' })
  name: string;
}
