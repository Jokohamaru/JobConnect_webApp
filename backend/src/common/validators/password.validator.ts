import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Custom validator for passwords
 * Validates that password is at least 8 characters long
 * Requirement 19.2: Password validation must be at least 8 characters long
 */
export function IsValidPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }
          // Password must be at least 8 characters long
          return value.length >= 8;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Password must be at least 8 characters long';
        },
      },
    });
  };
}
