import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Custom validator for URLs
 * Validates that URL is properly formatted
 * Requirement 19.5: URL validation for properly formatted URLs
 */
export function IsValidUrl(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidUrl',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }

          try {
            const url = new URL(value);
            // Ensure the URL has a valid protocol (http or https)
            return url.protocol === 'http:' || url.protocol === 'https:';
          } catch {
            return false;
          }
        },
        defaultMessage(args: ValidationArguments) {
          return 'URL must be a properly formatted URL with http or https protocol';
        },
      },
    });
  };
}
