import { validate } from 'class-validator';
import { IsRFC5322Email } from './email.validator';

class TestEmailDto {
  @IsRFC5322Email()
  email: string;
}

describe('IsRFC5322Email Validator', () => {
  it('should validate a valid email address', async () => {
    const dto = new TestEmailDto();
    dto.email = 'test@example.com';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate email with subdomain', async () => {
    const dto = new TestEmailDto();
    dto.email = 'user@mail.example.com';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate email with special characters', async () => {
    const dto = new TestEmailDto();
    dto.email = 'user.name+tag@example.co.uk';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject email without @ symbol', async () => {
    const dto = new TestEmailDto();
    dto.email = 'invalidemail.com';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isRFC5322Email).toBe(
      'Email must be a valid RFC 5322 email address',
    );
  });

  it('should reject email without domain', async () => {
    const dto = new TestEmailDto();
    dto.email = 'user@';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject email without local part', async () => {
    const dto = new TestEmailDto();
    dto.email = '@example.com';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject email with spaces', async () => {
    const dto = new TestEmailDto();
    dto.email = 'user name@example.com';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject non-string values', async () => {
    const dto = new TestEmailDto();
    dto.email = 123 as any;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject empty string', async () => {
    const dto = new TestEmailDto();
    dto.email = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
