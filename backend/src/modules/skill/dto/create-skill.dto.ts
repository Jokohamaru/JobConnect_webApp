import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSkillDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên kỹ năng không được để trống' })
  name: string;
}
