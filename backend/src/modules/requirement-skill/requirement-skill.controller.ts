import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RequirementSkillService } from './requirement-skill.service';
import { CreateRequirementSkillDto } from './dto/create-requirement-skill.dto';
import { UpdateRequirementSkillDto } from './dto/update-requirement-skill.dto';

@Controller('requirement-skill')
export class RequirementSkillController {
  constructor(private readonly requirementSkillService: RequirementSkillService) {}

  @Post()
  create(@Body() createRequirementSkillDto: CreateRequirementSkillDto) {
    return this.requirementSkillService.create(createRequirementSkillDto);
  }

  @Get()
  findAll() {
    return this.requirementSkillService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requirementSkillService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRequirementSkillDto: UpdateRequirementSkillDto) {
    return this.requirementSkillService.update(+id, updateRequirementSkillDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.requirementSkillService.remove(+id);
  }
}
