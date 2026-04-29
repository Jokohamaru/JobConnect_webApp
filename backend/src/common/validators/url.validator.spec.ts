import { validate } from 'class-validator';
import { IsValidUrl } from './url.validator';

class TestUrlDto {
  @IsValidUrl()
  url: string;
}

describe('IsValidUrl Validator', () => {
  it('should validate http URL', async () => {
    const dto = new TestUrlDto();
    dto.url = 'http://example.com';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate https URL', async () => {
    const dto = new TestUrlDto();
    dto.url = 'https://example.com';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate URL with path', async () => {
    const dto = new TestUrlDto();
    dto.url = 'https://example.com/path/to/resource';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate URL with query parameters', async () => {
    const dto = new TestUrlDto();
    dto.url = 'https://example.com/search?q=test&page=1';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate URL with port', async () => {
    const dto = new TestUrlDto();
    dto.url = 'https://example.com:8080';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate URL with subdomain', async () => {
    const dto = new TestUrlDto();
    dto.url = 'https://www.example.com';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject URL without protocol', async () => {
    const dto = new TestUrlDto();
    dto.url = 'example.com';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isValidUrl).toBe(
      'URL must be a properly formatted URL with http or https protocol',
    );
  });

  it('should reject URL with ftp protocol', async () => {
    const dto = new TestUrlDto();
    dto.url = 'ftp://example.com';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject invalid URL format', async () => {
    const dto = new TestUrlDto();
    dto.url = 'not a url';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject non-string values', async () => {
    const dto = new TestUrlDto();
    dto.url = 123 as any;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject empty string', async () => {
    const dto = new TestUrlDto();
    dto.url = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
