# Implementation Plan: JobConnect MVP

## Overview

This implementation plan breaks down the JobConnect MVP into discrete, sequential coding tasks organized into 10 phases. Each task builds on previous work, with property-based tests validating correctness properties and unit tests covering edge cases. The backend uses NestJS with TypeScript, PostgreSQL with Prisma ORM, and JWT authentication. The frontend uses Next.js with React Query and TypeScript.

## Phase 1: Project Setup & Database

- [ ] 1.1 Initialize Prisma schema with all entities and enums
  - Create prisma/schema.prisma with User, Candidate, Recruiter, Admin, Company, Job, CV, Application, Skill, Tag, City models
  - Define all enums: UserRole, ApplicationStatus, JobStatus, CVStatus, CompanyType
  - Set up relationships and indexes as per design document
  - _Requirements: 17.1-17.12_

- [ ] 1.2 Create and run initial database migration
  - Run `prisma migrate dev --name init` to create migration
  - Verify all tables created with correct columns and constraints
  - _Requirements: 17.1-17.12_

- [ ] 1.3 Create seed data for testing
  - Create prisma/seed.ts with sample users (candidate, recruiter, admin)
  - Add sample companies, jobs, skills, tags, and cities
  - Run seed data to populate test database
  - _Requirements: 17.1-17.12_

- [ ]* 1.4 Write property tests for database schema integrity
  - **Property 1: Email uniqueness is enforced**
  - **Validates: Requirements 1.2**

## Phase 2: Authentication & Security

- [ ] 2.1 Create JWT strategy and Passport configuration
  - Implement src/auth/strategies/jwt.strategy.ts with JWT extraction and validation
  - Configure JWT secret from environment variables
  - _Requirements: 2.5, 2.6, 21.1, 21.4, 21.5_

- [ ] 2.2 Create auth guards and decorators
  - Implement src/auth/guards/jwt-auth.guard.ts for token validation
  - Implement src/auth/guards/roles.guard.ts for role-based access
  - Create src/auth/decorators/public.decorator.ts for public endpoints
  - Create src/auth/decorators/roles.decorator.ts for role requirements
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [ ] 2.3 Implement auth DTOs with validation
  - Create src/auth/dto/register.dto.ts with email, password, full_name, role validation
  - Create src/auth/dto/login.dto.ts with email and password validation
  - Create src/auth/dto/refresh-token.dto.ts with refresh_token validation
  - Use class-validator decorators for all validations
  - _Requirements: 1.1, 1.3, 2.1, 19.1, 19.2_

- [ ] 2.4 Implement auth service (register, login, refresh)
  - Create src/auth/auth.service.ts with register method
  - Implement password hashing with bcrypt (10 salt rounds)
  - Implement login method with credential verification
  - Implement token generation (access + refresh tokens)
  - Implement refresh token endpoint
  - _Requirements: 1.1-1.8, 2.1-2.7, 3.1-3.4_

- [ ]* 2.5 Write property tests for authentication
  - **Property 2: Password hashing round trip**
  - **Property 3: Registration creates role-specific profile**
  - **Property 4: Login token generation**
  - **Property 5: Login timestamp recording**
  - **Property 6: Token refresh generates new access token**
  - **Property 7: Expired token rejection**
  - **Validates: Requirements 1.4, 2.5, 2.6, 2.7, 3.3, 3.4, 4.2, 20.1, 20.2, 21.1, 21.3, 21.4, 21.5, 21.6_

- [ ] 2.6 Implement rate limiting for auth endpoints
  - Create src/common/middleware/rate-limit.middleware.ts
  - Track failed login attempts per email address
  - Lock account after 5 failed attempts within 15 minutes
  - Return 429 Too Many Requests on lockout
  - Reset counter on successful login
  - _Requirements: 30.1, 30.2, 30.3, 30.4_

- [ ]* 2.7 Write unit tests for rate limiting
  - Test failed attempt tracking
  - Test account lockout after 5 attempts
  - Test counter reset on success
  - _Requirements: 30.1-30.5_

- [ ] 2.8 Checkpoint - Ensure all auth tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 3: Core User Management

- [ ] 3.1 Create User module with CRUD operations
  - Create src/modules/user/user.controller.ts with endpoints: GET /users/me, PATCH /users/me, GET /users/:id, GET /users
  - Create src/modules/user/user.service.ts with CRUD methods
  - Create src/modules/user/dto/create-user.dto.ts and update-user.dto.ts
  - Implement user profile retrieval with role-specific data
  - _Requirements: 15.1-15.4, 16.1-16.5_

- [ ]* 3.2 Write property tests for user management
  - **Property 36: User profile retrieval includes role-specific data**
  - **Property 37: Email update uniqueness check**
  - **Property 38: Password update hashing**
  - **Validates: Requirements 15.1-15.4, 16.2, 16.3, 16.5, 20.3, 20.4_

- [ ] 3.3 Create Candidate module with profile management
  - Create src/modules/candidate/candidate.controller.ts with endpoints: GET /candidates/me, PATCH /candidates/me, GET /candidates/:id
  - Create src/modules/candidate/candidate.service.ts with profile methods
  - Create src/modules/candidate/dto/create-candidate.dto.ts and update-candidate.dto.ts
  - Implement candidate profile retrieval with skills and CVs
  - _Requirements: 5.1-5.6_

- [ ]* 3.4 Write property tests for candidate profile
  - **Property 9: Candidate profile update authorization**
  - **Property 10: Candidate profile persistence**
  - **Validates: Requirements 5.1, 5.2, 5.4, 5.6_

- [ ] 3.5 Create Recruiter module with profile management
  - Create src/modules/recruiter/recruiter.controller.ts with endpoints: GET /recruiters/me, PATCH /recruiters/me
  - Create src/modules/recruiter/recruiter.service.ts with profile methods
  - Create src/modules/recruiter/dto/create-recruiter.dto.ts and update-recruiter.dto.ts
  - _Requirements: 7.1-7.6_

- [ ] 3.6 Create Admin module with user management
  - Create src/modules/admin/admin.controller.ts with endpoints: GET /admin/users, GET /admin/analytics
  - Create src/modules/admin/admin.service.ts with user listing and analytics methods
  - Implement user filtering by role
  - Implement analytics aggregation
  - _Requirements: 22.1-22.5, 23.1-23.4_

- [ ]* 3.7 Write property tests for admin features
  - **Property 44: Admin user listing access control**
  - **Property 45: Admin user filtering by role**
  - **Property 46: Admin analytics data aggregation**
  - **Validates: Requirements 22.1, 22.2, 22.4, 22.5, 23.1, 23.2, 23.3_

- [ ] 3.8 Checkpoint - Ensure all user management tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 4: Company & Job Management

- [ ] 4.1 Create Company module with CRUD operations
  - Create src/modules/company/company.controller.ts with endpoints: POST /companies, GET /companies/:id, PATCH /companies/:id, GET /companies/:id/jobs
  - Create src/modules/company/company.service.ts with CRUD methods
  - Create src/modules/company/dto/create-company.dto.ts and update-company.dto.ts
  - Link company to recruiter on creation
  - _Requirements: 7.1-7.6_

- [ ]* 4.2 Write property tests for company management
  - **Property 15: Company creation links to recruiter**
  - **Property 16: Company update authorization**
  - **Validates: Requirements 7.2, 7.3, 7.6_

- [ ] 4.3 Create Job module with CRUD operations
  - Create src/modules/job/job.controller.ts with endpoints: POST /jobs, GET /jobs, GET /jobs/:id, PATCH /jobs/:id, DELETE /jobs/:id
  - Create src/modules/job/job.service.ts with CRUD methods
  - Create src/modules/job/dto/create-job.dto.ts, update-job.dto.ts, filter-job.dto.ts
  - Set initial job status to ACTIVE
  - Associate skills and tags with jobs
  - _Requirements: 8.1-8.8_

- [ ]* 4.4 Write property tests for job management
  - **Property 17: Job creation sets active status**
  - **Property 18: Job skill association**
  - **Property 19: Job tag association**
  - **Validates: Requirements 8.2, 8.3, 8.4_

- [ ] 4.5 Implement job filtering and search
  - Implement filtering by city, skills, tags in job.service.ts
  - Implement keyword search in title and description (case-insensitive)
  - Add pagination support with default 20 items per page
  - _Requirements: 9.1-9.8, 27.1-27.4_

- [ ]* 4.6 Write property tests for job filtering
  - **Property 24: Job filtering by city**
  - **Property 25: Job filtering by skill**
  - **Property 26: Job filtering by tag**
  - **Property 27: Combined job filters use AND logic**
  - **Property 28: Job keyword search case-insensitive**
  - **Property 29: Pagination default page size**
  - **Property 30: Pagination metadata completeness**
  - **Validates: Requirements 9.2-9.7, 27.1-27.4_

- [ ] 4.7 Checkpoint - Ensure all job management tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 5: Application Workflow

- [ ] 5.1 Create Application module with submission logic
  - Create src/modules/application/application.controller.ts with endpoints: POST /applications, GET /applications, GET /applications/:id, PATCH /applications/:id/status, DELETE /applications/:id
  - Create src/modules/application/application.service.ts with submission and status update methods
  - Create src/modules/application/dto/create-application.dto.ts and update-application-status.dto.ts
  - Implement duplicate application prevention (unique constraint on candidate_id, job_id)
  - _Requirements: 10.1-10.7, 11.1-11.7_

- [ ]* 5.2 Write property tests for application submission
  - **Property 20: Closed job prevents applications**
  - **Property 21: Duplicate application prevention**
  - **Property 22: Application creation with APPLIED status**
  - **Property 23: Application timestamp recording**
  - **Validates: Requirements 8.7, 10.1-10.5_

- [ ] 5.3 Implement application status transitions
  - Create status transition validator in application.service.ts
  - Allow: APPLIED→REVIEWING, APPLIED→REJECTED, REVIEWING→ACCEPTED, REVIEWING→REJECTED
  - Prevent: ACCEPTED→any, REJECTED→any
  - Return 400 Bad Request on invalid transitions
  - _Requirements: 11.2-11.7, 12.1-12.3_

- [ ]* 5.4 Write property tests for status transitions
  - **Property 31: Application status transition validation**
  - **Property 32: Application status update authorization**
  - **Validates: Requirements 11.2-11.5, 12.1-12.3_

- [ ] 5.5 Implement application history and filtering
  - Implement candidate application history retrieval (sorted by created_at DESC)
  - Implement recruiter dashboard (applications for their company's jobs)
  - Add filtering by status
  - Add pagination support
  - _Requirements: 13.1-13.4, 14.1-14.5_

- [ ]* 5.6 Write property tests for application history
  - **Property 33: Application history sorting**
  - **Property 34: Application history filtering by status**
  - **Property 35: Recruiter dashboard scope**
  - **Validates: Requirements 13.1, 13.4, 14.1_

- [ ] 5.7 Implement soft delete for applications
  - Add deleted_at column to Application model (already in schema)
  - Implement soft delete on application withdrawal
  - Exclude soft-deleted applications from list queries
  - _Requirements: 28.1-28.4_

- [ ]* 5.8 Write property tests for soft delete
  - **Property 47: Soft delete application exclusion**
  - **Validates: Requirements 28.1, 28.2_

- [ ] 5.9 Checkpoint - Ensure all application tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 6: CV Management

- [ ] 6.1 Create CV module with upload functionality
  - Create src/modules/cv/cv.controller.ts with endpoints: POST /candidates/me/cvs, GET /candidates/me/cvs, DELETE /candidates/me/cvs/:cvId, PATCH /candidates/me/cvs/:cvId/default
  - Create src/modules/cv/cv.service.ts with upload and management methods
  - Create src/modules/cv/dto/upload-cv.dto.ts
  - _Requirements: 6.1-6.7_

- [ ] 6.2 Implement file validation (format and size)
  - Validate file format: PDF, DOC, DOCX only
  - Validate file size: max 5MB
  - Return 400 Bad Request for unsupported format
  - Return 413 Payload Too Large for oversized files
  - _Requirements: 6.1-6.3_

- [ ]* 6.3 Write property tests for CV validation
  - **Property 12: CV file format validation**
  - **Property 13: CV file size validation**
  - **Validates: Requirements 6.1, 6.2, 6.3_

- [ ] 6.4 Implement CV default marking and deletion
  - Implement marking CV as default (only one default per candidate)
  - Implement CV deletion with file cleanup
  - Ensure idempotence of default marking
  - _Requirements: 6.4-6.7_

- [ ]* 6.5 Write property tests for CV management
  - **Property 14: CV default marking idempotence**
  - **Validates: Requirements 6.7_

- [ ] 6.6 Checkpoint - Ensure all CV tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 7: Advanced Features

- [ ] 7.1 Implement skill matching calculation
  - Create skill matching logic in job.service.ts
  - Calculate skill_match_percentage = (matched_skills / total_required_skills) * 100
  - Include in job detail responses for candidates
  - _Requirements: 26.1-26.4_

- [ ]* 7.2 Write property tests for skill matching
  - **Property 48: Skill match percentage calculation**
  - **Property 49: Application indicator in job details**
  - **Validates: Requirements 26.3, 26.4_

- [ ] 7.3 Create custom exception filter
  - Create src/common/filters/custom-exception.filter.ts
  - Handle HttpException, ValidationException, and generic errors
  - Return consistent error response format with statusCode, timestamp, path, message
  - _Requirements: 18.1-18.6, 25.4_

- [ ]* 7.4 Write unit tests for exception filter
  - Test HTTP exception handling
  - Test validation exception handling
  - Test generic error handling
  - _Requirements: 18.1-18.6_

- [ ] 7.5 Implement comprehensive input validation
  - Create validators for email (RFC 5322), password (8+ chars), phone (digits/hyphens), salary range
  - Apply validators to all DTOs using class-validator
  - Return 400 Bad Request with field-specific error messages
  - _Requirements: 19.1-19.6_

- [ ]* 7.6 Write property tests for input validation
  - **Property 40: Input validation for email format**
  - **Property 41: Input validation for password length**
  - **Property 42: Input validation for phone number**
  - **Property 43: Input validation for salary range**
  - **Validates: Requirements 1.3, 19.1-19.4_

- [ ] 7.7 Implement logging and audit trail
  - Create src/common/interceptors/logging.interceptor.ts
  - Log authentication events (login success/failure, token generation)
  - Log resource operations (create, update, delete)
  - Log authorization failures
  - _Requirements: 24.1-24.6_

- [ ] 7.8 Implement response interceptor for consistency
  - Create src/common/interceptors/response.interceptor.ts
  - Ensure all responses follow consistent format
  - Include pagination metadata for list endpoints
  - Use ISO 8601 format for timestamps
  - _Requirements: 25.1-25.6_

- [ ] 7.9 Checkpoint - Ensure all advanced feature tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 8: Error Handling & Validation

- [ ] 8.1 Create global exception filter
  - Register custom exception filter in app.module.ts
  - Catch all exceptions and transform to appropriate HTTP responses
  - Log all errors with full stack trace
  - _Requirements: 18.1-18.6_

- [ ] 8.2 Implement HTTP status code mapping
  - Map business logic errors to appropriate HTTP status codes
  - Implement error response format: statusCode, timestamp, path, message, error
  - _Requirements: 25.1-25.6_

- [ ]* 8.3 Write integration tests for error handling
  - Test 400 Bad Request for invalid input
  - Test 401 Unauthorized for missing/expired tokens
  - Test 403 Forbidden for insufficient permissions
  - Test 404 Not Found for missing resources
  - Test 409 Conflict for duplicate emails/applications
  - Test 429 Too Many Requests for rate limiting
  - Test 500 Internal Server Error for database failures
  - _Requirements: 18.1-18.6_

- [ ] 8.4 Checkpoint - Ensure all error handling tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 9: Frontend Integration

- [ ] 9.1 Create API client utilities
  - Create lib/api-client.ts with request, get, post, patch, delete methods
  - Implement token management (read from localStorage)
  - Implement automatic token refresh on 401
  - _Requirements: 2.5, 2.6, 3.3, 3.4_

- [ ] 9.2 Implement React Query hooks
  - Create hooks/useAuth.ts for authentication
  - Create hooks/useJobs.ts for job listing and filtering
  - Create hooks/useApplications.ts for application management
  - Create hooks/useCandidateProfile.ts for candidate profile
  - Create hooks/useRecruiterProfile.ts for recruiter profile
  - _Requirements: 5.1-5.6, 8.1-8.8, 9.1-9.8, 10.1-10.7_

- [ ] 9.3 Build authentication context
  - Create context/AuthContext.tsx with user state and auth methods
  - Implement login, logout, register methods
  - Implement token persistence
  - _Requirements: 1.1-1.8, 2.1-2.7, 3.1-3.4_

- [ ] 9.4 Create component structure
  - Create auth components: LoginForm, RegisterForm, ProtectedRoute
  - Create profile components: CandidateProfile, RecruiterProfile, CVUpload
  - Create job components: JobList, JobCard, JobFilters, JobDetails
  - Create application components: ApplicationForm, ApplicationList, ApplicationCard, ApplicationStatus
  - Create admin components: UserManagement, Analytics, UserTable
  - _Requirements: All frontend-related requirements_

- [ ] 9.5 Checkpoint - Ensure frontend integration tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 10: Testing & Coverage

- [ ] 10.1 Write comprehensive unit tests for all modules
  - Create test files for: auth, user, candidate, recruiter, company, job, application, cv, admin modules
  - Test all service methods with valid/invalid inputs
  - Test all error scenarios
  - Aim for >85% coverage per module
  - _Requirements: All requirements_

- [ ]* 10.2 Write property-based tests for all properties
  - Implement all 52 properties from design document using fast-check
  - Minimum 100 iterations per property
  - Include shrinking for minimal failing examples
  - _Requirements: All requirements_

- [ ]* 10.3 Write integration tests for workflows
  - Test registration → login → profile update flow
  - Test job creation → job listing → application submission flow
  - Test application submission → status update → history retrieval flow
  - Test recruiter dashboard → application review → status change flow
  - _Requirements: All requirements_

- [ ] 10.4 Achieve >80% code coverage
  - Run coverage report: npm run test:cov
  - Identify uncovered lines and add tests
  - Focus on critical paths (auth, authorization, application workflow)
  - _Requirements: All requirements_

- [ ] 10.5 Final checkpoint - All tests pass with >80% coverage
  - Ensure all tests pass, ask the user if questions arise.
  - Verify code coverage meets >80% target.
