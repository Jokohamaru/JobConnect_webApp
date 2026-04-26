import { Module } from '@nestjs/common';
import { RequirementSkillService } from './requirement-skill.service';
import { RequirementSkillController } from './requirement-skill.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RequirementSkillController],
  providers: [RequirementSkillService],
})
export class RequirementSkillModule {}