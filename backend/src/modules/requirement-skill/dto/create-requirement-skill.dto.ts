import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRequirementSkillDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên kỹ năng không được để trống' })
  name!: string;
}
