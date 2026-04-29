import { validate } from 'class-validator';
import { IsSalaryRangeValid } from './salary-range.validator';

class TestSalaryDto {
  salary_min?: number;

  @IsSalaryRangeValid()
  salary_max?: number;
}

describe('IsSalaryRangeValid Validator', () => {
  it('should validate when salary_min equals salary_max', async () => {
    const dto = new TestSalaryDto();
    dto.salary_min = 50000;
    dto.salary_max = 50000;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate when salary_min is less than salary_max', async () => {
    const dto = new TestSalaryDto();
    dto.salary_min = 40000;
    dto.salary_max = 60000;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate when both salaries are zero', async () => {
    const dto = new TestSalaryDto();
    dto.salary_min = 0;
    dto.salary_max = 0;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject when salary_min is greater than salary_max', async () => {
    const dto = new TestSalaryDto();
    dto.salary_min = 70000;
    dto.salary_max = 50000;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isSalaryRangeValid).toBe(
      'Minimum salary must be less than or equal to maximum salary',
    );
  });

  it('should skip validation when salary_min is undefined', async () => {
    const dto = new TestSalaryDto();
    dto.salary_min = undefined;
    dto.salary_max = 60000;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should skip validation when salary_max is undefined', async () => {
    const dto = new TestSalaryDto();
    dto.salary_min = 40000;
    dto.salary_max = undefined;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should skip validation when both salaries are undefined', async () => {
    const dto = new TestSalaryDto();
    dto.salary_min = undefined;
    dto.salary_max = undefined;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should skip validation when salary_min is null', async () => {
    const dto = new TestSalaryDto();
    dto.salary_min = null as any;
    dto.salary_max = 60000;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should skip validation when salary_max is null', async () => {
    const dto = new TestSalaryDto();
    dto.salary_min = 40000;
    dto.salary_max = null as any;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate negative salaries if min <= max', async () => {
    const dto = new TestSalaryDto();
    dto.salary_min = -1000;
    dto.salary_max = -500;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
