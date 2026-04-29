import { validate } from 'class-validator';
import { IsValidPassword } from './password.validator';

class TestPasswordDto {
  @IsValidPassword()
  password: string;
}

describe('IsValidPassword Validator', () => {
  it('should validate password with exactly 8 characters', async () => {
    const dto = new TestPasswordDto();
    dto.password = 'Pass1234';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate password with more than 8 characters', async () => {
    const dto = new TestPasswordDto();
    dto.password = 'MySecurePassword123';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate password with special characters', async () => {
    const dto = new TestPasswordDto();
    dto.password = 'P@ssw0rd!';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject password with less than 8 characters', async () => {
    const dto = new TestPasswordDto();
    dto.password = 'Pass12';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isValidPassword).toBe(
      'Password must be at least 8 characters long',
    );
  });

  it('should reject empty password', async () => {
    const dto = new TestPasswordDto();
    dto.password = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject non-string values', async () => {
    const dto = new TestPasswordDto();
    dto.password = 12345678 as any;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should validate password with exactly 8 spaces', async () => {
    const dto = new TestPasswordDto();
    dto.password = '        ';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
