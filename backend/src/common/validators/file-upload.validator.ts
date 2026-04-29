import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Custom validator for file uploads
 * Validates that file extension matches declared MIME type
 * Requirement 19.6: File upload validation for file extension matching declared MIME type
 */
export function IsValidFileUpload(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidFileUpload',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }

          const obj = args.object as any;
          const fileName = obj.file_name;
          const mimeType = obj.mime_type;

          // If no MIME type is provided, skip MIME validation
          if (!mimeType) {
            return true;
          }

          // Extract file extension
          const fileExtension = fileName
            ?.toLowerCase()
            .substring(fileName.lastIndexOf('.'));

          // Map MIME types to expected extensions
          const mimeToExtension: Record<string, string[]> = {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
              '.docx',
            ],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'image/gif': ['.gif'],
            'text/plain': ['.txt'],
            'application/zip': ['.zip'],
          };

          const expectedExtensions = mimeToExtension[mimeType];

          // If MIME type is not in our map, allow it (permissive approach)
          if (!expectedExtensions) {
            return true;
          }

          // Check if file extension matches MIME type
          return expectedExtensions.includes(fileExtension);
        },
        defaultMessage(args: ValidationArguments) {
          return 'File extension does not match declared MIME type';
        },
      },
    });
  };
}

/**
 * Custom validator for file format
 * Validates that file has an allowed extension
 */
export function IsAllowedFileFormat(
  allowedExtensions: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isAllowedFileFormat',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }

          const fileExtension = value
            .toLowerCase()
            .substring(value.lastIndexOf('.'));

          return allowedExtensions
            .map((ext) => ext.toLowerCase())
            .includes(fileExtension);
        },
        defaultMessage(args: ValidationArguments) {
          return `File format must be one of: ${allowedExtensions.join(', ')}`;
        },
      },
    });
  };
}
