import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Custom validator for email addresses
 * Validates that email matches RFC 5322 format
 * Requirement 19.1: Email validation must match RFC 5322 format
 */
export function IsRFC5322Email(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isRFC5322Email',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }
          // RFC 5322 compliant email regex
          // This is a simplified but practical regex that covers most valid email formats
          const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
          return emailRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return 'Email must be a valid RFC 5322 email address';
        },
      },
    });
  };
}
