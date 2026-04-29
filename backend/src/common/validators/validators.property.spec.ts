import { validate } from 'class-validator';
import * as fc from 'fast-check';
import { IsRFC5322Email } from './email.validator';
import { IsValidPassword } from './password.validator';
import { IsPhoneNumber } from './phone-number.validator';
import { IsSalaryRangeValid } from './salary-range.validator';

/**
 * Property-Based Tests for Input Validation
 * 
 * **Validates: Requirements 1.3, 19.1-19.4**
 * 
 * These tests verify input validation properties using fast-check with minimum 100 iterations.
 */
describe('Input Validators - Property-Based Tests', () => {
  /**
   * Property 40: Input Validation for Email Format
   * 
   * For any email input, if it does not match RFC 5322 format,
   * the request SHALL fail with 400 Bad Request.
   * 
   * **Validates: Requirements 19.1**
   */
  describe('Property 40: Input validation for email format', () => {
    class TestEmailDto {
      @IsRFC5322Email()
      email: string;
    }

    it('should accept valid RFC 5322 email addresses (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          async (email) => {
            const dto = new TestEmailDto();
            dto.email = email;

            const errors = await validate(dto);
            
            // Valid emails should pass validation
            expect(errors.length).toBe(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should reject invalid email formats (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.string().filter(s => !s.includes('@')), // No @ symbol
            fc.string().map(s => '@' + s), // Starts with @
            fc.string().map(s => s + '@'), // Ends with @
            fc.string().map(s => s + '@@' + s), // Double @
            fc.constant(''), // Empty string
            fc.constant('   '), // Whitespace only
            fc.string().map(s => s + '@.com'), // Missing domain name
            fc.string().map(s => 'user@'), // Missing domain
          ),
          async (invalidEmail) => {
            const dto = new TestEmailDto();
            dto.email = invalidEmail;

            const errors = await validate(dto);
            
            // Invalid emails should fail validation
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('email');
            expect(errors[0].constraints).toHaveProperty('isRFC5322Email');
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should validate email format with various valid patterns (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(s)),
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(s)),
          fc.string({ minLength: 2, maxLength: 10 }).filter(s => /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(s)),
          async (localPart, domain, tld) => {
            const email = `${localPart}@${domain}.${tld}`;
            const dto = new TestEmailDto();
            dto.email = email;

            const errors = await validate(dto);
            
            // Should pass validation
            expect(errors.length).toBe(0);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 41: Input Validation for Password Length
   * 
   * For any password input, if it is less than 8 characters,
   * the request SHALL fail with 400 Bad Request.
   * 
   * **Validates: Requirements 1.3, 19.2**
   */
  describe('Property 41: Input validation for password length', () => {
    class TestPasswordDto {
      @IsValidPassword()
      password: string;
    }

    it('should accept passwords with 8 or more characters (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 8, maxLength: 128 }),
          async (password) => {
            const dto = new TestPasswordDto();
            dto.password = password;

            const errors = await validate(dto);
            
            // Valid passwords should pass validation
            expect(errors.length).toBe(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should reject passwords with less than 8 characters (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 0, maxLength: 7 }),
          async (shortPassword) => {
            const dto = new TestPasswordDto();
            dto.password = shortPassword;

            const errors = await validate(dto);
            
            // Short passwords should fail validation
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('password');
            expect(errors[0].constraints).toHaveProperty('isValidPassword');
            expect(errors[0].constraints?.isValidPassword).toContain('at least 8 characters');
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should validate password length boundary (exactly 8 characters)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 8, maxLength: 8 }),
          async (password) => {
            const dto = new TestPasswordDto();
            dto.password = password;

            const errors = await validate(dto);
            
            // Exactly 8 characters should pass
            expect(errors.length).toBe(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should reject non-string password values', async () => {
      const dto = new TestPasswordDto();
      (dto as any).password = 12345678; // Number instead of string

      const errors = await validate(dto);
      
      // Non-string values should fail validation
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  /**
   * Property 42: Input Validation for Phone Number
   * 
   * For any phone number input, if it contains characters other than digits and hyphens,
   * the request SHALL fail with 400 Bad Request.
   * 
   * **Validates: Requirements 19.3**
   */
  describe('Property 42: Input validation for phone number', () => {
    class TestPhoneDto {
      @IsPhoneNumber()
      phone_number: string;
    }

    it('should accept phone numbers with only digits (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1000000000, max: 9999999999 }).map(n => n.toString()),
          async (phoneNumber) => {
            const dto = new TestPhoneDto();
            dto.phone_number = phoneNumber;

            const errors = await validate(dto);
            
            // Valid phone numbers should pass validation
            expect(errors.length).toBe(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should accept phone numbers with digits and hyphens (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 100, max: 999 }),
          fc.integer({ min: 100, max: 999 }),
          fc.integer({ min: 1000, max: 9999 }),
          async (part1, part2, part3) => {
            const phoneNumber = `${part1}-${part2}-${part3}`;
            const dto = new TestPhoneDto();
            dto.phone_number = phoneNumber;

            const errors = await validate(dto);
            
            // Phone numbers with hyphens should pass validation
            expect(errors.length).toBe(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should reject phone numbers with invalid characters (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.string().filter(s => /[a-zA-Z]/.test(s)), // Contains letters
            fc.string().filter(s => /[!@#$%^&*()_+=\[\]{}|\\:;"'<>,.?/]/.test(s)), // Contains special chars
            fc.string().filter(s => /\s/.test(s)), // Contains whitespace
            fc.constant('123-456-789a'), // Ends with letter
            fc.constant('(123) 456-7890'), // Contains parentheses and space
            fc.constant('+1-234-567-8900'), // Contains plus sign
          ),
          async (invalidPhone) => {
            const dto = new TestPhoneDto();
            dto.phone_number = invalidPhone;

            const errors = await validate(dto);
            
            // Invalid phone numbers should fail validation
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('phone_number');
            expect(errors[0].constraints).toHaveProperty('isPhoneNumber');
            expect(errors[0].constraints?.isPhoneNumber).toContain('digits and hyphens');
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should accept various valid phone number formats (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 10, maxLength: 15 }),
          fc.integer({ min: 0, max: 3 }), // Number of hyphens to insert
          async (digits, hyphenCount) => {
            let phoneNumber = digits.join('');
            
            // Insert hyphens at random positions
            for (let i = 0; i < hyphenCount && phoneNumber.length > 1; i++) {
              const pos = Math.floor(Math.random() * (phoneNumber.length - 1)) + 1;
              phoneNumber = phoneNumber.slice(0, pos) + '-' + phoneNumber.slice(pos);
            }

            const dto = new TestPhoneDto();
            dto.phone_number = phoneNumber;

            const errors = await validate(dto);
            
            // Should pass validation
            expect(errors.length).toBe(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should reject non-string phone number values', async () => {
      const dto = new TestPhoneDto();
      (dto as any).phone_number = 1234567890; // Number instead of string

      const errors = await validate(dto);
      
      // Non-string values should fail validation
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  /**
   * Property 43: Input Validation for Salary Range
   * 
   * For any job posting with salary_min and salary_max,
   * if salary_min > salary_max, the request SHALL fail with 400 Bad Request.
   * 
   * **Validates: Requirements 19.4**
   */
  describe('Property 43: Input validation for salary range', () => {
    class TestSalaryDto {
      salary_min?: number;
      
      @IsSalaryRangeValid()
      salary_max?: number;
    }

    it('should accept valid salary ranges where min <= max (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 500000 }),
          fc.integer({ min: 0, max: 500000 }),
          async (salary1, salary2) => {
            const dto = new TestSalaryDto();
            dto.salary_min = Math.min(salary1, salary2);
            dto.salary_max = Math.max(salary1, salary2);

            const errors = await validate(dto);
            
            // Valid salary ranges should pass validation
            expect(errors.length).toBe(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should reject salary ranges where min > max (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 500000 }),
          fc.integer({ min: 1, max: 100000 }),
          async (salaryMin, difference) => {
            const dto = new TestSalaryDto();
            dto.salary_min = salaryMin;
            dto.salary_max = salaryMin - difference; // Ensure max < min

            const errors = await validate(dto);
            
            // Invalid salary ranges should fail validation
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('salary_max');
            expect(errors[0].constraints).toHaveProperty('isSalaryRangeValid');
            expect(errors[0].constraints?.isSalaryRangeValid).toContain('less than or equal to');
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should accept equal salary_min and salary_max (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 500000 }),
          async (salary) => {
            const dto = new TestSalaryDto();
            dto.salary_min = salary;
            dto.salary_max = salary;

            const errors = await validate(dto);
            
            // Equal salaries should pass validation
            expect(errors.length).toBe(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should accept when salary_min is undefined (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 500000 }),
          async (salaryMax) => {
            const dto = new TestSalaryDto();
            dto.salary_min = undefined;
            dto.salary_max = salaryMax;

            const errors = await validate(dto);
            
            // Should pass validation when min is undefined
            expect(errors.length).toBe(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should accept when salary_max is undefined (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 500000 }),
          async (salaryMin) => {
            const dto = new TestSalaryDto();
            dto.salary_min = salaryMin;
            dto.salary_max = undefined;

            const errors = await validate(dto);
            
            // Should pass validation when max is undefined
            expect(errors.length).toBe(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should accept when both salaries are null', async () => {
      const dto = new TestSalaryDto();
      dto.salary_min = null as any;
      dto.salary_max = null as any;

      const errors = await validate(dto);
      
      // Should pass validation when both are null
      expect(errors.length).toBe(0);
    });

    it('should validate boundary cases (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 1000000 }),
          async (salary) => {
            // Test min = 0, max = salary
            const dto1 = new TestSalaryDto();
            dto1.salary_min = 0;
            dto1.salary_max = salary;
            const errors1 = await validate(dto1);
            expect(errors1.length).toBe(0);

            // Test min = salary, max = very large number
            const dto2 = new TestSalaryDto();
            dto2.salary_min = salary;
            dto2.salary_max = 10000000;
            const errors2 = await validate(dto2);
            expect(errors2.length).toBe(0);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 39: Error Response Format Consistency
   * 
   * For any error response, the JSON body SHALL contain statusCode, timestamp (ISO 8601),
   * path, and message fields.
   * 
   * **Validates: Requirements 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 25.4**
   */
  describe('Property 39: Error response format consistency', () => {
    it('should format validation errors consistently (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.string().filter(s => !s.includes('@')), // Invalid email
            fc.string({ maxLength: 7 }), // Short password
            fc.string().filter(s => /[a-zA-Z]/.test(s)), // Invalid phone
          ),
          fc.constantFrom('email', 'password', 'phone_number'),
          async (invalidValue, fieldType) => {
            let dto: any;
            
            if (fieldType === 'email') {
              class TestDto {
                @IsRFC5322Email()
                email: string;
              }
              dto = new TestDto();
              dto.email = invalidValue;
            } else if (fieldType === 'password') {
              class TestDto {
                @IsValidPassword()
                password: string;
              }
              dto = new TestDto();
              dto.password = invalidValue;
            } else {
              class TestDto {
                @IsPhoneNumber()
                phone_number: string;
              }
              dto = new TestDto();
              dto.phone_number = invalidValue;
            }

            const errors = await validate(dto);
            
            // Verify error structure
            expect(errors.length).toBeGreaterThan(0);
            
            for (const error of errors) {
              // Each error should have these fields
              expect(error).toHaveProperty('property');
              expect(error).toHaveProperty('constraints');
              expect(error).toHaveProperty('value');
              
              // Property should be a string
              expect(typeof error.property).toBe('string');
              
              // Constraints should be an object with error messages
              expect(typeof error.constraints).toBe('object');
              expect(error.constraints).not.toBeNull();
              
              // Each constraint should have a message
              const constraintKeys = Object.keys(error.constraints || {});
              expect(constraintKeys.length).toBeGreaterThan(0);
              
              for (const key of constraintKeys) {
                expect(typeof error.constraints![key]).toBe('string');
                expect(error.constraints![key].length).toBeGreaterThan(0);
              }
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should include all required error fields for different validation types (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.string().filter(s => !s.includes('@')),
            password: fc.string({ maxLength: 7 }),
            phone_number: fc.string().filter(s => /[a-zA-Z]/.test(s)),
            salary_min: fc.integer({ min: 100000, max: 200000 }),
            salary_max: fc.integer({ min: 1, max: 50000 }),
          }),
          async (invalidData) => {
            class TestDto {
              @IsRFC5322Email()
              email: string;

              @IsValidPassword()
              password: string;

              @IsPhoneNumber()
              phone_number: string;

              salary_min: number;

              @IsSalaryRangeValid()
              salary_max: number;
            }

            const dto = new TestDto();
            dto.email = invalidData.email;
            dto.password = invalidData.password;
            dto.phone_number = invalidData.phone_number;
            dto.salary_min = invalidData.salary_min;
            dto.salary_max = invalidData.salary_max;

            const errors = await validate(dto);
            
            // Should have multiple validation errors
            expect(errors.length).toBeGreaterThan(0);
            
            // Each error should have consistent structure
            for (const error of errors) {
              expect(error).toHaveProperty('property');
              expect(error).toHaveProperty('constraints');
              expect(error).toHaveProperty('value');
              
              // Verify property is one of the expected fields
              expect(['email', 'password', 'phone_number', 'salary_max']).toContain(error.property);
              
              // Verify constraints is an object with messages
              expect(typeof error.constraints).toBe('object');
              expect(error.constraints).not.toBeNull();
              
              const messages = Object.values(error.constraints || {});
              expect(messages.length).toBeGreaterThan(0);
              
              // All messages should be non-empty strings
              for (const message of messages) {
                expect(typeof message).toBe('string');
                expect((message as string).length).toBeGreaterThan(0);
              }
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should provide descriptive error messages for all validation failures (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            invalidEmail: fc.string().filter(s => !s.includes('@')),
            shortPassword: fc.string({ maxLength: 7 }),
            invalidPhone: fc.string().filter(s => /[a-zA-Z]/.test(s)),
          }),
          async (testData) => {
            // Test email validation
            class EmailDto {
              @IsRFC5322Email()
              email: string;
            }
            const emailDto = new EmailDto();
            emailDto.email = testData.invalidEmail;
            const emailErrors = await validate(emailDto);
            
            expect(emailErrors.length).toBeGreaterThan(0);
            expect(emailErrors[0].constraints).toBeDefined();
            const emailMessage = Object.values(emailErrors[0].constraints!)[0];
            expect(typeof emailMessage).toBe('string');
            expect((emailMessage as string).length).toBeGreaterThan(0);

            // Test password validation
            class PasswordDto {
              @IsValidPassword()
              password: string;
            }
            const passwordDto = new PasswordDto();
            passwordDto.password = testData.shortPassword;
            const passwordErrors = await validate(passwordDto);
            
            expect(passwordErrors.length).toBeGreaterThan(0);
            expect(passwordErrors[0].constraints).toBeDefined();
            const passwordMessage = Object.values(passwordErrors[0].constraints!)[0];
            expect(typeof passwordMessage).toBe('string');
            expect((passwordMessage as string).length).toBeGreaterThan(0);
            expect((passwordMessage as string).toLowerCase()).toContain('8');

            // Test phone validation
            class PhoneDto {
              @IsPhoneNumber()
              phone_number: string;
            }
            const phoneDto = new PhoneDto();
            phoneDto.phone_number = testData.invalidPhone;
            const phoneErrors = await validate(phoneDto);
            
            expect(phoneErrors.length).toBeGreaterThan(0);
            expect(phoneErrors[0].constraints).toBeDefined();
            const phoneMessage = Object.values(phoneErrors[0].constraints!)[0];
            expect(typeof phoneMessage).toBe('string');
            expect((phoneMessage as string).length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should maintain error format consistency across different error types (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              type: fc.constantFrom('email', 'password', 'phone', 'salary'),
              value: fc.oneof(
                fc.string(),
                fc.integer(),
                fc.constant(null),
                fc.constant(undefined),
              ),
            }),
            { minLength: 1, maxLength: 4 },
          ),
          async (testCases) => {
            for (const testCase of testCases) {
              let dto: any;
              let errors: any[];

              if (testCase.type === 'email') {
                class TestDto {
                  @IsRFC5322Email()
                  email: any;
                }
                dto = new TestDto();
                dto.email = testCase.value;
                errors = await validate(dto);
              } else if (testCase.type === 'password') {
                class TestDto {
                  @IsValidPassword()
                  password: any;
                }
                dto = new TestDto();
                dto.password = testCase.value;
                errors = await validate(dto);
              } else if (testCase.type === 'phone') {
                class TestDto {
                  @IsPhoneNumber()
                  phone_number: any;
                }
                dto = new TestDto();
                dto.phone_number = testCase.value;
                errors = await validate(dto);
              } else {
                class TestDto {
                  salary_min: number;
                  @IsSalaryRangeValid()
                  salary_max: any;
                }
                dto = new TestDto();
                dto.salary_min = 100000;
                dto.salary_max = testCase.value;
                errors = await validate(dto);
              }

              // All errors should have consistent structure
              for (const error of errors) {
                expect(error).toHaveProperty('property');
                expect(error).toHaveProperty('constraints');
                expect(error).toHaveProperty('value');
                
                // Property should be a non-empty string
                expect(typeof error.property).toBe('string');
                expect(error.property.length).toBeGreaterThan(0);
                
                // Constraints should be an object
                expect(typeof error.constraints).toBe('object');
                
                // Value should match what was provided
                expect(error.value).toBe(testCase.value);
              }
            }
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
