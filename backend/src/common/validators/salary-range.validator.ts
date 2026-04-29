import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Custom validator for salary range
 * Validates that salary_min is less than or equal to salary_max
 * Requirement 19.4: Salary range validation
 */
export function IsSalaryRangeValid(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isSalaryRangeValid',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const obj = args.object as any;
          const salaryMin = obj.salary_min;
          const salaryMax = obj.salary_max;

          // If either value is not provided, skip validation
          if (salaryMin === undefined || salaryMax === undefined) {
            return true;
          }

          // If either value is null, skip validation
          if (salaryMin === null || salaryMax === null) {
            return true;
          }

          // Validate that salary_min <= salary_max
          return salaryMin <= salaryMax;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Minimum salary must be less than or equal to maximum salary';
        },
      },
    });
  };
}
