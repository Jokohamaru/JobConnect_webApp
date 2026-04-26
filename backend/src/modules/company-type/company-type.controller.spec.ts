import { Test, TestingModule } from '@nestjs/testing';
import { CompanyTypeController } from './company-type.controller';
import { CompanyTypeService } from './company-type.service';

describe('CompanyTypeController', () => {
  let controller: CompanyTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyTypeController],
      providers: [CompanyTypeService],
    }).compile();

    controller = module.get<CompanyTypeController>(CompanyTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
