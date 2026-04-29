import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Custom validator for phone numbers
 * Validates that phone number contains only digits and hyphens
 * Requirement 19.3: Phone number validation
 */
export function IsPhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isPhoneNumber',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }
          // Phone number must contain only digits and hyphens
          const phoneRegex = /^[0-9-]+$/;
          return phoneRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return 'Phone number must contain only digits and hyphens';
        },
      },
    });
  };
}
