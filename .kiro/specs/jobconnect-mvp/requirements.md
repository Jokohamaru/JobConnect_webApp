# JobConnect MVP Requirements Document

## Introduction

JobConnect is a full-stack recruitment platform MVP designed to connect Candidates, Recruiters, and Admins in a unified ecosystem. The platform enables Recruiters to post job opportunities and manage applications, Candidates to discover jobs and submit applications with their CVs, and Admins to oversee platform operations. The MVP focuses on core workflows: user authentication with role-based access control, profile management for each user type, job posting and discovery, and application management with status tracking.

## Glossary

- **System**: The JobConnect platform (frontend, backend, and database)
- **User**: Any person registered on the platform (Candidate, Recruiter, or Admin)
- **Candidate**: A user seeking employment opportunities
- **Recruiter**: A user representing a company who posts jobs and reviews applications
- **Admin**: A platform administrator with system-wide oversight and management capabilities
- **Role**: A classification determining user permissions and available features (Candidate, Recruiter, Admin)
- **RBAC**: Role-Based Access Control system that restricts features based on user role
- **JWT**: JSON Web Token used for stateless authentication
- **Company**: An organization represented by Recruiters that posts job opportunities
- **Job**: A position posted by a Recruiter with requirements and details
- **Application**: A Candidate's submission to a Job, including their CV
- **CV**: A Candidate's curriculum vitae document containing qualifications and experience
- **Skill**: A technical or professional competency required for or possessed by a user
- **Tag**: A categorical label for jobs (e.g., "Remote", "Full-time", "Startup")
- **City**: A geographic location used for job filtering and candidate location
- **Application Status**: The current state of an application (APPLIED, REVIEWING, ACCEPTED, REJECTED)
- **Password Hash**: A cryptographically secure representation of a user's password
- **Access Token**: A JWT token granting authenticated access to protected resources
- **Refresh Token**: A JWT token used to obtain new Access Tokens without re-authentication

## Requirements

### Requirement 1: User Registration with Role Selection

**User Story:** As a new user, I want to register on the platform with a specific role, so that I can access role-appropriate features and workflows.

#### Acceptance Criteria

1. WHEN a user submits a registration request with email, password, full name, and role (Candidate, Recruiter, or Admin), THE System SHALL validate all required fields are present and properly formatted
2. WHEN the email address is already registered, THE System SHALL return a 409 Conflict error with message "Email already registered"
3. WHEN the password is less than 8 characters, THE System SHALL return a 400 Bad Request error with message "Password must be at least 8 characters"
4. WHEN registration is successful, THE System SHALL hash the password using bcrypt with salt rounds of 10 and store the User record with role, email, hashed password, and full name
5. WHEN registration is successful, THE System SHALL return a 201 Created response with User ID and email (password excluded)
6. WHEN a Recruiter registers, THE System SHALL create an associated Recruiter profile record
7. WHEN a Candidate registers, THE System SHALL create an associated Candidate profile record
8. WHEN an Admin registers, THE System SHALL create an associated Admin profile record

### Requirement 2: User Login with JWT Authentication

**User Story:** As a registered user, I want to log in with my credentials, so that I can access my personalized dashboard and features.

#### Acceptance Criteria

1. WHEN a user submits login credentials (email and password), THE System SHALL verify the email exists in the database
2. IF the email does not exist, THEN THE System SHALL return a 401 Unauthorized error with message "Invalid credentials"
3. WHEN the email exists, THE System SHALL compare the provided password against the stored password hash using bcrypt
4. IF the password does not match, THEN THE System SHALL return a 401 Unauthorized error with message "Invalid credentials"
5. WHEN credentials are valid, THE System SHALL generate an Access Token (JWT) with 15-minute expiration and a Refresh Token (JWT) with 7-day expiration
6. WHEN credentials are valid, THE System SHALL return a 200 OK response containing Access Token, Refresh Token, User ID, email, role, and full name
7. WHEN a user logs in, THE System SHALL record the login timestamp in the User record

### Requirement 3: Token Refresh Mechanism

**User Story:** As an authenticated user, I want to refresh my Access Token using my Refresh Token, so that I can maintain my session without re-entering credentials.

#### Acceptance Criteria

1. WHEN a user submits a valid Refresh Token, THE System SHALL verify the token signature and expiration
2. IF the Refresh Token is invalid or expired, THEN THE System SHALL return a 401 Unauthorized error with message "Invalid or expired refresh token"
3. WHEN the Refresh Token is valid, THE System SHALL generate a new Access Token with 15-minute expiration
4. WHEN the Refresh Token is valid, THE System SHALL return a 200 OK response containing the new Access Token

### Requirement 4: Role-Based Access Control on Protected Endpoints

**User Story:** As the System, I want to enforce role-based access control, so that users can only access features appropriate to their role.

#### Acceptance Criteria

1. WHEN a request is made to a protected endpoint without an Access Token, THE System SHALL return a 401 Unauthorized error with message "Missing or invalid token"
2. WHEN a request is made with an expired Access Token, THE System SHALL return a 401 Unauthorized error with message "Token expired"
3. WHEN a request is made with a valid Access Token, THE System SHALL extract the role from the token and verify the user has permission for the requested endpoint
4. IF the user's role does not have permission for the endpoint, THEN THE System SHALL return a 403 Forbidden error with message "Insufficient permissions"
5. WHEN a Candidate attempts to access Recruiter-only endpoints (e.g., job creation), THE System SHALL return a 403 Forbidden error
6. WHEN a Recruiter attempts to access Admin-only endpoints (e.g., platform analytics), THE System SHALL return a 403 Forbidden error
7. WHEN a user with appropriate role accesses a protected endpoint, THE System SHALL process the request normally

### Requirement 5: Candidate Profile Management

**User Story:** As a Candidate, I want to create and update my profile with personal information and skills, so that Recruiters can learn about my qualifications.

#### Acceptance Criteria

1. WHEN a Candidate submits a profile update with optional fields (phone number, bio, location, skills), THE System SHALL validate the Candidate role matches the authenticated user
2. WHEN a Candidate submits a profile update, THE System SHALL store the updated information in the Candidate profile record
3. WHEN a Candidate adds skills to their profile, THE System SHALL associate the Skill records with the Candidate profile
4. WHEN a Candidate retrieves their profile, THE System SHALL return all profile fields including associated skills and CV information
5. WHEN a Candidate updates their profile, THE System SHALL return a 200 OK response with the updated profile data
6. WHEN a Candidate attempts to update another Candidate's profile, THE System SHALL return a 403 Forbidden error

### Requirement 6: Candidate CV Management

**User Story:** As a Candidate, I want to upload and manage my CV, so that I can submit it with job applications.

#### Acceptance Criteria

1. WHEN a Candidate uploads a CV file (PDF, DOC, DOCX format), THE System SHALL validate the file format and size (max 5MB)
2. IF the file format is not supported, THEN THE System SHALL return a 400 Bad Request error with message "Unsupported file format"
3. IF the file size exceeds 5MB, THEN THE System SHALL return a 413 Payload Too Large error with message "File size exceeds 5MB limit"
4. WHEN a CV is uploaded successfully, THE System SHALL store the file and create a CV record linked to the Candidate profile
5. WHEN a Candidate retrieves their CVs, THE System SHALL return a list of all CV records with upload timestamps and file names
6. WHEN a Candidate deletes a CV, THE System SHALL remove the CV record and associated file
7. WHEN a Candidate has multiple CVs, THE System SHALL allow marking one as the default CV for applications

### Requirement 7: Recruiter Company Management

**User Story:** As a Recruiter, I want to create and manage company information, so that I can represent my organization on the platform.

#### Acceptance Criteria

1. WHEN a Recruiter submits company information (name, description, website, industry, company type, location), THE System SHALL validate all required fields are present
2. WHEN company information is submitted, THE System SHALL create a Company record linked to the Recruiter profile
3. WHEN a Recruiter updates company information, THE System SHALL validate the Recruiter role matches the authenticated user and the company belongs to them
4. WHEN company information is updated, THE System SHALL store the updated information in the Company record
5. WHEN a Recruiter retrieves company details, THE System SHALL return all company information including associated jobs and application counts
6. WHEN a Recruiter attempts to update another Recruiter's company, THE System SHALL return a 403 Forbidden error

### Requirement 8: Job Creation and Management

**User Story:** As a Recruiter, I want to create and manage job postings, so that I can attract qualified Candidates.

#### Acceptance Criteria

1. WHEN a Recruiter submits a job posting with required fields (title, description, location, salary range, job type, required skills, tags), THE System SHALL validate all required fields are present and properly formatted
2. WHEN a job posting is submitted, THE System SHALL create a Job record linked to the Company and set status to ACTIVE
3. WHEN a job is created, THE System SHALL associate the provided Skill records with the Job
4. WHEN a job is created, THE System SHALL associate the provided Tag records with the Job
5. WHEN a Recruiter updates a job posting, THE System SHALL validate the Recruiter owns the associated Company
6. WHEN a Recruiter updates a job posting, THE System SHALL store the updated information in the Job record
7. WHEN a Recruiter closes a job posting, THE System SHALL set the Job status to CLOSED and prevent new applications
8. WHEN a Recruiter retrieves their jobs, THE System SHALL return a list of all Job records for their Company with application counts

### Requirement 9: Job Discovery with Filtering

**User Story:** As a Candidate, I want to search and filter job postings, so that I can find opportunities matching my preferences.

#### Acceptance Criteria

1. WHEN a Candidate requests a list of jobs without filters, THE System SHALL return all ACTIVE jobs with pagination (default 20 per page)
2. WHEN a Candidate filters jobs by City, THE System SHALL return only jobs located in the specified City
3. WHEN a Candidate filters jobs by Skill, THE System SHALL return only jobs requiring the specified Skill
4. WHEN a Candidate filters jobs by Tag, THE System SHALL return only jobs with the specified Tag
5. WHEN a Candidate applies multiple filters (City AND Skill AND Tag), THE System SHALL return jobs matching ALL specified criteria
6. WHEN a Candidate searches jobs by keyword in title or description, THE System SHALL return matching jobs using case-insensitive search
7. WHEN a Candidate requests jobs with pagination, THE System SHALL return the requested page with total count and has_next_page indicator
8. WHEN a Candidate retrieves job details, THE System SHALL return all job information including Company details, required Skills, and Tags

### Requirement 10: Job Application Submission

**User Story:** As a Candidate, I want to submit an application to a job posting with my CV, so that I can express interest in the position.

#### Acceptance Criteria

1. WHEN a Candidate submits an application to a Job with a selected CV, THE System SHALL validate the Job is ACTIVE and the Candidate has not already applied
2. IF the Job is CLOSED, THEN THE System SHALL return a 400 Bad Request error with message "Job is no longer accepting applications"
3. IF the Candidate has already applied to the Job, THEN THE System SHALL return a 409 Conflict error with message "You have already applied to this job"
4. WHEN an application is submitted, THE System SHALL create an Application record with status APPLIED and link it to the Candidate, Job, and selected CV
5. WHEN an application is submitted, THE System SHALL record the application timestamp
6. WHEN an application is submitted successfully, THE System SHALL return a 201 Created response with Application ID and status
7. WHEN a Candidate retrieves their applications, THE System SHALL return a list of all Application records with Job details and current status

### Requirement 11: Application Status Management

**User Story:** As a Recruiter, I want to review and update application statuses, so that I can manage the hiring workflow.

#### Acceptance Criteria

1. WHEN a Recruiter requests applications for their Company's jobs, THE System SHALL return all Application records for those jobs with Candidate information and CV details
2. WHEN a Recruiter updates an Application status from APPLIED to REVIEWING, THE System SHALL validate the Recruiter owns the associated Job's Company
3. WHEN a Recruiter updates an Application status to ACCEPTED, THE System SHALL validate the status transition is valid (APPLIED or REVIEWING to ACCEPTED)
4. WHEN a Recruiter updates an Application status to REJECTED, THE System SHALL validate the status transition is valid (APPLIED or REVIEWING to REJECTED)
5. IF an invalid status transition is attempted, THEN THE System SHALL return a 400 Bad Request error with message "Invalid status transition"
6. WHEN an Application status is updated, THE System SHALL record the update timestamp and store the new status
7. WHEN an Application status is updated, THE System SHALL return a 200 OK response with the updated Application record

### Requirement 12: Application Status Transitions

**User Story:** As the System, I want to enforce valid application status transitions, so that the hiring workflow remains consistent.

#### Acceptance Criteria

1. THE Application_Status_Manager SHALL allow transitions: APPLIED → REVIEWING, APPLIED → REJECTED, REVIEWING → ACCEPTED, REVIEWING → REJECTED
2. THE Application_Status_Manager SHALL prevent transitions: ACCEPTED → any state, REJECTED → any state
3. WHEN an invalid transition is attempted, THE System SHALL return a 400 Bad Request error with message "Cannot transition from [current_status] to [requested_status]"

### Requirement 13: Candidate Application History

**User Story:** As a Candidate, I want to view my application history with status updates, so that I can track my job search progress.

#### Acceptance Criteria

1. WHEN a Candidate retrieves their application history, THE System SHALL return all Application records sorted by most recent first
2. WHEN a Candidate retrieves application history, THE System SHALL include Job details, Company information, Application status, and submission timestamp
3. WHEN a Candidate retrieves application history, THE System SHALL include the CV used for each application
4. WHEN a Candidate filters their applications by status, THE System SHALL return only applications with the specified status

### Requirement 14: Recruiter Application Dashboard

**User Story:** As a Recruiter, I want to view all applications for my company's jobs, so that I can manage the hiring process efficiently.

#### Acceptance Criteria

1. WHEN a Recruiter requests their application dashboard, THE System SHALL return all Application records for all jobs posted by their Company
2. WHEN a Recruiter retrieves applications, THE System SHALL include Candidate profile information, CV details, Job information, and Application status
3. WHEN a Recruiter filters applications by Job, THE System SHALL return only applications for the specified Job
4. WHEN a Recruiter filters applications by status, THE System SHALL return only applications with the specified status
5. WHEN a Recruiter retrieves applications, THE System SHALL support pagination with default 20 per page

### Requirement 15: User Profile Retrieval

**User Story:** As a user, I want to retrieve my profile information, so that I can verify my account details.

#### Acceptance Criteria

1. WHEN an authenticated user requests their profile, THE System SHALL return all User information including email, full name, role, and role-specific profile data
2. WHEN a Candidate requests their profile, THE System SHALL include Candidate-specific data (skills, CVs, applications)
3. WHEN a Recruiter requests their profile, THE System SHALL include Recruiter-specific data (Company information, posted jobs)
4. WHEN an Admin requests their profile, THE System SHALL include Admin-specific data (platform access level)

### Requirement 16: User Profile Update

**User Story:** As a user, I want to update my profile information, so that I can keep my account details current.

#### Acceptance Criteria

1. WHEN a user submits a profile update with email, full name, or password, THE System SHALL validate the authenticated user matches the profile being updated
2. WHEN a user updates their email, THE System SHALL verify the new email is not already registered
3. WHEN a user updates their password, THE System SHALL validate the new password is at least 8 characters and hash it using bcrypt
4. WHEN a user updates their profile, THE System SHALL store the updated information in the User record
5. WHEN a user updates their profile successfully, THE System SHALL return a 200 OK response with the updated User information (password excluded)

### Requirement 17: Database Schema Integrity

**User Story:** As the System, I want to maintain database schema integrity, so that data relationships remain consistent.

#### Acceptance Criteria

1. THE Database_Schema SHALL define a User table with columns: id (UUID primary key), email (unique), password_hash, full_name, role (enum: CANDIDATE, RECRUITER, ADMIN), created_at, updated_at, last_login
2. THE Database_Schema SHALL define a Candidate table with columns: id (UUID primary key), user_id (foreign key to User), phone_number (optional), bio (optional), location (optional), created_at, updated_at
3. THE Database_Schema SHALL define a Recruiter table with columns: id (UUID primary key), user_id (foreign key to User), company_id (foreign key to Company), created_at, updated_at
4. THE Database_Schema SHALL define a Company table with columns: id (UUID primary key), name, description, website (optional), industry, company_type, location, recruiter_id (foreign key to Recruiter), created_at, updated_at
5. THE Database_Schema SHALL define a Job table with columns: id (UUID primary key), company_id (foreign key to Company), title, description, location, salary_min, salary_max, job_type, status (enum: ACTIVE, CLOSED), created_at, updated_at
6. THE Database_Schema SHALL define a CV table with columns: id (UUID primary key), candidate_id (foreign key to Candidate), file_name, file_path, is_default, created_at, updated_at
7. THE Database_Schema SHALL define an Application table with columns: id (UUID primary key), candidate_id (foreign key to Candidate), job_id (foreign key to Job), cv_id (foreign key to CV), status (enum: APPLIED, REVIEWING, ACCEPTED, REJECTED), created_at, updated_at
8. THE Database_Schema SHALL define a Skill table with columns: id (UUID primary key), name (unique), created_at
9. THE Database_Schema SHALL define a Tag table with columns: id (UUID primary key), name (unique), created_at
10. THE Database_Schema SHALL define a City table with columns: id (UUID primary key), name (unique), country, created_at
11. THE Database_Schema SHALL define junction tables: Candidate_Skill (candidate_id, skill_id), Job_Skill (job_id, skill_id), Job_Tag (job_id, tag_id)
12. THE Database_Schema SHALL enforce foreign key constraints with appropriate cascade delete policies

### Requirement 18: Error Handling and Validation

**User Story:** As the System, I want to handle errors gracefully, so that users receive clear feedback about issues.

#### Acceptance Criteria

1. WHEN a request contains invalid data, THE System SHALL return a 400 Bad Request error with a descriptive message indicating which field is invalid
2. WHEN a request is missing required fields, THE System SHALL return a 400 Bad Request error listing all missing required fields
3. WHEN a resource is not found, THE System SHALL return a 404 Not Found error with message "Resource not found"
4. WHEN a database operation fails, THE System SHALL return a 500 Internal Server Error with a generic message (detailed error logged server-side)
5. WHEN a request violates a unique constraint, THE System SHALL return a 409 Conflict error with message indicating the constraint violation
6. WHEN an unexpected error occurs, THE System SHALL log the error with full stack trace and return a 500 Internal Server Error

### Requirement 19: Data Validation on Input

**User Story:** As the System, I want to validate all user inputs, so that data integrity is maintained.

#### Acceptance Criteria

1. WHEN an email is provided, THE System SHALL validate it matches the RFC 5322 email format
2. WHEN a password is provided, THE System SHALL validate it is at least 8 characters long
3. WHEN a phone number is provided, THE System SHALL validate it contains only digits and hyphens
4. WHEN a salary range is provided, THE System SHALL validate salary_min is less than or equal to salary_max
5. WHEN a URL is provided (website, file path), THE System SHALL validate it is a properly formatted URL
6. WHEN a file is uploaded, THE System SHALL validate the file extension matches the declared MIME type

### Requirement 20: Secure Password Storage

**User Story:** As the System, I want to store passwords securely, so that user accounts are protected.

#### Acceptance Criteria

1. WHEN a password is stored, THE System SHALL hash it using bcrypt with a minimum of 10 salt rounds
2. WHEN a password is verified, THE System SHALL use bcrypt to compare the provided password against the stored hash
3. THE System SHALL never store plain-text passwords in the database
4. THE System SHALL never return password hashes in API responses

### Requirement 21: JWT Token Security

**User Story:** As the System, I want to secure JWT tokens, so that authentication is tamper-proof.

#### Acceptance Criteria

1. WHEN a JWT token is generated, THE System SHALL sign it using a secure secret key (minimum 32 characters)
2. WHEN a JWT token is received, THE System SHALL verify the signature before accepting it
3. WHEN a JWT token is verified, THE System SHALL check the expiration timestamp
4. THE Access_Token SHALL have an expiration time of 15 minutes
5. THE Refresh_Token SHALL have an expiration time of 7 days
6. WHEN a token expires, THE System SHALL reject it and return a 401 Unauthorized error

### Requirement 22: Admin User Management

**User Story:** As an Admin, I want to view and manage all users on the platform, so that I can oversee platform operations.

#### Acceptance Criteria

1. WHEN an Admin requests a list of all users, THE System SHALL return all User records with role, email, full name, and account status
2. WHEN an Admin filters users by role, THE System SHALL return only users with the specified role
3. WHEN an Admin retrieves user details, THE System SHALL return all user information including role-specific profile data
4. WHEN an Admin attempts to access user management features, THE System SHALL verify the Admin role
5. IF the user is not an Admin, THEN THE System SHALL return a 403 Forbidden error

### Requirement 23: Admin Platform Analytics

**User Story:** As an Admin, I want to view platform analytics, so that I can monitor platform health and growth.

#### Acceptance Criteria

1. WHEN an Admin requests platform analytics, THE System SHALL return total user counts by role (Candidates, Recruiters, Admins)
2. WHEN an Admin requests analytics, THE System SHALL return total job postings count and active job count
3. WHEN an Admin requests analytics, THE System SHALL return total application count and application status distribution
4. WHEN an Admin requests analytics, THE System SHALL return user registration trends (new users per day/week/month)
5. WHEN an Admin requests analytics, THE System SHALL return job posting trends (new jobs per day/week/month)

### Requirement 24: Logging and Audit Trail

**User Story:** As the System, I want to log all significant operations, so that there is an audit trail for security and debugging.

#### Acceptance Criteria

1. WHEN a user logs in, THE System SHALL log the login event with timestamp, user ID, and IP address
2. WHEN a user creates a resource (job, application, company), THE System SHALL log the creation event with timestamp, user ID, and resource ID
3. WHEN a user updates a resource, THE System SHALL log the update event with timestamp, user ID, resource ID, and changed fields
4. WHEN a user deletes a resource, THE System SHALL log the deletion event with timestamp, user ID, and resource ID
5. WHEN an authentication failure occurs, THE System SHALL log the failed attempt with timestamp, email, and IP address
6. WHEN an authorization failure occurs, THE System SHALL log the failed attempt with timestamp, user ID, attempted endpoint, and user role

### Requirement 25: API Response Consistency

**User Story:** As the System, I want to return consistent API responses, so that clients can reliably parse responses.

#### Acceptance Criteria

1. WHEN a successful request is processed, THE System SHALL return a response with status code 200-201 and a JSON body containing the requested data
2. WHEN a successful request creates a resource, THE System SHALL return status code 201 Created with the created resource data
3. WHEN a successful request deletes a resource, THE System SHALL return status code 204 No Content
4. WHEN an error occurs, THE System SHALL return a JSON response with error code, error message, and optional error details
5. WHEN a list is returned, THE System SHALL include pagination metadata: page, per_page, total_count, has_next_page
6. WHEN a timestamp is returned, THE System SHALL use ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)

### Requirement 26: Candidate-Job Matching Metadata

**User Story:** As a Candidate, I want to see which of my skills match job requirements, so that I can assess my fit for positions.

#### Acceptance Criteria

1. WHEN a Candidate retrieves job details, THE System SHALL include a list of required skills for the job
2. WHEN a Candidate retrieves job details, THE System SHALL include a list of skills the Candidate possesses
3. WHEN a Candidate retrieves job details, THE System SHALL calculate and return the skill match percentage (matched skills / total required skills)
4. WHEN a Candidate has already applied to a job, THE System SHALL indicate this in the job details response

### Requirement 27: Pagination for List Endpoints

**User Story:** As a client, I want to retrieve large lists in manageable pages, so that API responses remain performant.

#### Acceptance Criteria

1. WHEN a list endpoint is called without pagination parameters, THE System SHALL return the first page with default page size of 20 items
2. WHEN a list endpoint is called with page and per_page parameters, THE System SHALL return the requested page with the specified page size (max 100)
3. WHEN a list endpoint returns results, THE System SHALL include pagination metadata: current_page, per_page, total_count, total_pages, has_next_page, has_previous_page
4. WHEN a requested page exceeds total pages, THE System SHALL return an empty list with pagination metadata indicating no results

### Requirement 28: Soft Delete for Applications

**User Story:** As the System, I want to preserve application history, so that audit trails remain intact.

#### Acceptance Criteria

1. WHEN a Candidate withdraws an application, THE System SHALL mark the Application as deleted (soft delete) with a deleted_at timestamp
2. WHEN a Recruiter views applications, THE System SHALL exclude soft-deleted applications from the list
3. WHEN an Admin views audit logs, THE System SHALL include soft-deleted applications with deletion timestamp and reason
4. THE Application table SHALL include a deleted_at column (nullable) to support soft deletes

### Requirement 29: Email Notification Triggers

**User Story:** As the System, I want to send email notifications, so that users stay informed about important events.

#### Acceptance Criteria

1. WHEN a Candidate successfully registers, THE System SHALL send a welcome email with account confirmation link
2. WHEN a Candidate submits an application, THE System SHALL send a confirmation email to the Candidate
3. WHEN a Recruiter receives a new application, THE System SHALL send a notification email to the Recruiter
4. WHEN an Application status changes to ACCEPTED, THE System SHALL send an acceptance notification email to the Candidate
5. WHEN an Application status changes to REJECTED, THE System SHALL send a rejection notification email to the Candidate
6. WHEN a new job is posted, THE System SHALL send a notification email to Candidates with matching skills (optional feature)

### Requirement 30: Rate Limiting on Authentication Endpoints

**User Story:** As the System, I want to prevent brute force attacks, so that user accounts remain secure.

#### Acceptance Criteria

1. WHEN a login attempt fails, THE System SHALL increment a failed attempt counter for the email address
2. WHEN 5 failed login attempts occur within 15 minutes, THE System SHALL temporarily lock the account for 15 minutes
3. WHEN an account is locked, THE System SHALL return a 429 Too Many Requests error with message "Account temporarily locked. Try again later."
4. WHEN a successful login occurs, THE System SHALL reset the failed attempt counter to 0
5. WHEN 15 minutes have passed since the last failed attempt, THE System SHALL reset the failed attempt counter to 0

