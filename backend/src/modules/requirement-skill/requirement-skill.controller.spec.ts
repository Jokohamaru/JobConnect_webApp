import { Test, TestingModule } from '@nestjs/testing';
import { RequirementSkillController } from './requirement-skill.controller';
import { RequirementSkillService } from './requirement-skill.service';

describe('RequirementSkillController', () => {
  let controller: RequirementSkillController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequirementSkillController],
      providers: [RequirementSkillService],
    }).compile();

    controller = module.get<RequirementSkillController>(RequirementSkillController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
