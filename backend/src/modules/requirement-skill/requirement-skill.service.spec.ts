import { Test, TestingModule } from '@nestjs/testing';
import { RequirementSkillService } from './requirement-skill.service';

describe('RequirementSkillService', () => {
  let service: RequirementSkillService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequirementSkillService],
    }).compile();

    service = module.get<RequirementSkillService>(RequirementSkillService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
