import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    // Mock the GEMINI_API_KEY environment variable
    process.env.GEMINI_API_KEY = 'test-api-key';

    const module: TestingModule = await Test.createTestingModule({
      providers: [AiService],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  afterEach(() => {
    // Clean up environment variable
    delete process.env.GEMINI_API_KEY;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
