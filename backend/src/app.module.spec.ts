import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  it('should compile the module successfully', () => {
    expect(module).toBeDefined();
  });

  it('should have AppModule defined', () => {
    const appModule = module.get(AppModule);
    expect(appModule).toBeDefined();
  });
});
