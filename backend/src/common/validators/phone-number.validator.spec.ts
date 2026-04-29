import { validate } from 'class-validator';
import { IsPhoneNumber } from './phone-number.validator';

class TestPhoneDto {
  @IsPhoneNumber()
  phone: string;
}

describe('IsPhoneNumber Validator', () => {
  it('should validate phone number with only digits', async () => {
    const dto = new TestPhoneDto();
    dto.phone = '1234567890';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate phone number with hyphens', async () => {
    const dto = new TestPhoneDto();
    dto.phone = '123-456-7890';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate phone number with multiple hyphens', async () => {
    const dto = new TestPhoneDto();
    dto.phone = '1-2-3-4-5-6-7-8-9-0';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject phone number with spaces', async () => {
    const dto = new TestPhoneDto();
    dto.phone = '123 456 7890';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isPhoneNumber).toBe(
      'Phone number must contain only digits and hyphens',
    );
  });

  it('should reject phone number with parentheses', async () => {
    const dto = new TestPhoneDto();
    dto.phone = '(123) 456-7890';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject phone number with letters', async () => {
    const dto = new TestPhoneDto();
    dto.phone = '123-ABC-7890';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject phone number with special characters', async () => {
    const dto = new TestPhoneDto();
    dto.phone = '123-456-7890+';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject non-string values', async () => {
    const dto = new TestPhoneDto();
    dto.phone = 1234567890 as any;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject empty string', async () => {
    const dto = new TestPhoneDto();
    dto.phone = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
