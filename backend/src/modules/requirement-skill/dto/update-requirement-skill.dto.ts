import { PartialType } from '@nestjs/mapped-types';
import { CreateRequirementSkillDto } from './create-requirement-skill.dto';

export class UpdateRequirementSkillDto extends PartialType(CreateRequirementSkillDto) {}
