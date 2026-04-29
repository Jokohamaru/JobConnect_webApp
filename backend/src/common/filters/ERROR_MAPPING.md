# HTTP Status Code Mapping Documentation

This document maps all business logic errors to their appropriate HTTP status codes as per Requirements 25.1-25.6.

## Error Response Format

All error responses follow this consistent format (Requirement 25.4):

```json
{
  "statusCode": number,
  "timestamp": string (ISO 8601 format),
  "path": string,
  "message": string | string[]
}
```

## HTTP Status Code Mapping

### 400 Bad Request - Invalid Input Data

Used when the request contains invalid data or violates business rules.

| Scenario | Message | Location |
|----------|---------|----------|
| Invalid salary range | `salary_min must be less than or equal to salary_max` | `job.service.ts` |
| Recruiter without company posting job | `You must create a company before posting jobs` | `job.service.ts` |
| Closed job application | `Job is no longer accepting applications` | `application.service.ts` |
| Invalid status transition | `Cannot transition from {current} to {new}` | `application.service.ts` |
| Unsupported file format | `Unsupported file format` | `cv.service.ts` |
| Unauthorized CV deletion | `You do not have permission to delete this CV` | `cv.service.ts` |
| Unauthorized CV modification | `You do not have permission to modify this CV` | `cv.service.ts` |
| Missing required fields | Handled by class-validator | DTOs |
| Invalid field format | Handled by class-validator | DTOs |

### 401 Unauthorized - Authentication Errors

Used when authentication fails or tokens are invalid/expired.

| Scenario | Message | Location |
|----------|---------|----------|
| Missing token | `Missing or invalid token` | `jwt-auth.guard.ts` |
| Invalid token | `Missing or invalid token` | `jwt-auth.guard.ts` |
| Expired token | `Token expired` | `jwt.strategy.ts` |
| Invalid credentials | `Invalid credentials` | `auth.service.ts` |
| Invalid refresh token | `Invalid or expired refresh token` | `auth.service.ts` |

### 403 Forbidden - Authorization Errors

Used when the user is authenticated but lacks permission for the requested action.

| Scenario | Message | Location |
|----------|---------|----------|
| Insufficient role permissions | `Insufficient permissions` | `roles.guard.ts` |
| Unauthorized profile update (Candidate) | `You do not have permission to update this profile` | `candidate.service.ts` |
| Unauthorized profile update (Recruiter) | `You do not have permission to update this profile` | `recruiter.service.ts` |
| Unauthorized company update | `You do not have permission to update this company` | `company.service.ts` |
| Unauthorized job update | `You do not have permission to update this job` | `job.service.ts` |
| Unauthorized job deletion | `You do not have permission to delete this job` | `job.service.ts` |
| Unauthorized CV access | `You do not have access to this CV` | `application.service.ts` |
| Unauthorized application view | `You do not have permission to view this application` | `application.service.ts` |
| Unauthorized application update | `You do not have permission to update this application` | `application.service.ts` |
| Invalid role for operation | `Invalid role for accessing applications` | `application.service.ts` |

### 404 Not Found - Resource Not Found

Used when a requested resource does not exist.

| Scenario | Message | Location |
|----------|---------|----------|
| User not found | `User not found` | `user.service.ts` |
| Candidate not found | `Candidate profile not found` / `Candidate not found` | `candidate.service.ts` |
| Recruiter not found | `Recruiter profile not found` / `Recruiter not found` | `recruiter.service.ts` |
| Company not found | `Company not found` | `company.service.ts` |
| Job not found | `Job not found` | `job.service.ts` |
| CV not found | `CV not found` | `cv.service.ts` |
| Application not found | `Application not found` | `application.service.ts` |

### 409 Conflict - Constraint Violations

Used when the request conflicts with existing data or business rules.

| Scenario | Message | Location |
|----------|---------|----------|
| Email already registered | `Email already registered` | `user.service.ts`, `auth.service.ts` |
| Recruiter already has company | `Recruiter already has a company` | `company.service.ts` |
| Duplicate application | `You have already applied to this job` | `application.service.ts` |

### 413 Payload Too Large - File Size Exceeded

Used when uploaded files exceed size limits.

| Scenario | Message | Location |
|----------|---------|----------|
| CV file exceeds 5MB | `File size exceeds 5MB limit` | `cv.service.ts` |

### 500 Internal Server Error - Unexpected Errors

Used for unexpected errors, database failures, and unhandled exceptions.

| Scenario | Message | Location |
|----------|---------|----------|
| Database errors | `Internal server error` | `custom-exception.filter.ts` |
| Unexpected errors | `Internal server error` | `custom-exception.filter.ts` |
| Unknown error types | `Internal server error` | `custom-exception.filter.ts` |

## Implementation Details

### Exception Filter

The `CustomExceptionFilter` (`backend/src/common/filters/custom-exception.filter.ts`) handles all exceptions globally:

1. **HttpException handling**: Extracts status code and message from NestJS HttpException instances
2. **Validation errors**: Handles class-validator errors (array of messages)
3. **Generic errors**: Catches unexpected Error instances and logs stack traces
4. **Unknown errors**: Handles non-Error exceptions

### NestJS Built-in Exceptions Used

The codebase uses the following NestJS built-in exception classes:

- `BadRequestException` (400)
- `UnauthorizedException` (401)
- `ForbiddenException` (403)
- `NotFoundException` (404)
- `ConflictException` (409)
- `PayloadTooLargeException` (413)

All these exceptions extend `HttpException` and are properly handled by the `CustomExceptionFilter`.

### Validation

Input validation is handled by:

1. **class-validator decorators** in DTOs (e.g., `@IsEmail()`, `@MinLength()`, `@IsEnum()`)
2. **ValidationPipe** (configured globally in `main.ts`)
3. **Custom validators** in `backend/src/common/validators/`

Validation errors are automatically transformed to 400 Bad Request responses with detailed field-level error messages.

## Requirements Coverage

This implementation satisfies the following requirements:

- **Requirement 18.1-18.6**: Error handling and validation
- **Requirement 25.1**: Successful requests return 200-201 with JSON body
- **Requirement 25.2**: Resource creation returns 201 Created
- **Requirement 25.3**: Resource deletion returns 204 No Content
- **Requirement 25.4**: Errors return JSON with statusCode, timestamp, path, message
- **Requirement 25.5**: Lists include pagination metadata (handled by services)
- **Requirement 25.6**: Timestamps use ISO 8601 format

## Testing

Comprehensive tests for error handling are located in:

- `backend/src/common/filters/custom-exception.filter.spec.ts` - Unit tests for exception filter
- Integration tests in Phase 8 (Task 8.3) - End-to-end error handling tests

## Notes

- All error messages are consistent with the design document specifications
- Stack traces are logged server-side but never exposed to clients
- The error response format is consistent across all endpoints
- Timestamps are always in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
