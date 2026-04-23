# JobConnect MVP - Design Document

## Overview

JobConnect is a full-stack recruitment platform MVP built with modern web technologies. The system connects three user types (Candidates, Recruiters, Admins) through a unified platform enabling job discovery, application management, and hiring workflow automation.

**Technology Stack:**
- **Frontend:** Next.js 14+ with React, TypeScript, React Query for data fetching
- **Backend:** NestJS with modular architecture, Controllers, Services, DTOs
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT (JSON Web Tokens) with Passport.js strategy
- **Security:** bcrypt for password hashing, role-based access control (RBAC)

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Pages: Auth, Profile, Jobs, Applications, Admin Dashboard│   │
│  │ Components: Forms, Cards, Filters, Tables               │   │
│  │ State: React Query, Context (Auth)                      │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (NestJS)                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Modules: Auth, User, Candidate, Recruiter, Job, etc.    │   │
│  │ Guards: JwtAuthGuard, RolesGuard                         │   │
│  │ Middleware: Error handling, Logging, Rate limiting       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ SQL
┌─────────────────────────────────────────────────────────────────┐
│                  Database (PostgreSQL)                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Tables: User, Candidate, Recruiter, Job, Application... │   │
│  │ Indexes: email, role, job_status, application_status    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Authentication Flow

```
User Input (Email/Password)
         ↓
    [Login Endpoint]
         ↓
  Verify Email Exists
         ↓
  Compare Password Hash (bcrypt)
         ↓
  Generate JWT Tokens (Access + Refresh)
         ↓
  Return Tokens + User Info
         ↓
  [Client stores tokens]
         ↓
  [Subsequent requests include Access Token]
         ↓
  [JwtAuthGuard validates token]
         ↓
  [RolesGuard checks user role]
         ↓
  [Request processed or rejected]
```

### Job Application Workflow

```
Candidate Views Jobs
         ↓
  [Filter by City/Skill/Tag]
         ↓
  [View Job Details + Skill Match %]
         ↓
  [Submit Application with CV]
         ↓
  [Application created with APPLIED status]
         ↓
Recruiter Reviews Applications
         ↓
  [Update status: REVIEWING/ACCEPTED/REJECTED]
         ↓
  [Candidate receives notification]
         ↓
  [Application history updated]
```

## Components and Interfaces

### Backend Module Structure

```
src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── decorators/
│   │   ├── public.decorator.ts
│   │   └── roles.decorator.ts
│   └── dto/
│       ├── register.dto.ts
│       ├── login.dto.ts
│       └── refresh-token.dto.ts
├── modules/
│   ├── user/
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.module.ts
│   │   └── dto/
│   │       ├── create-user.dto.ts
│   │       └── update-user.dto.ts
│   ├── candidate/
│   │   ├── candidate.controller.ts
│   │   ├── candidate.service.ts
│   │   ├── candidate.module.ts
│   │   └── dto/
│   │       ├── create-candidate.dto.ts
│   │       └── update-candidate.dto.ts
│   ├── recruiter/
│   │   ├── recruiter.controller.ts
│   │   ├── recruiter.service.ts
│   │   ├── recruiter.module.ts
│   │   └── dto/
│   │       ├── create-recruiter.dto.ts
│   │       └── update-recruiter.dto.ts
│   ├── company/
│   │   ├── company.controller.ts
│   │   ├── company.service.ts
│   │   ├── company.module.ts
│   │   └── dto/
│   │       ├── create-company.dto.ts
│   │       └── update-company.dto.ts
│   ├── job/
│   │   ├── job.controller.ts
│   │   ├── job.service.ts
│   │   ├── job.module.ts
│   │   └── dto/
│   │       ├── create-job.dto.ts
│   │       ├── update-job.dto.ts
│   │       └── filter-job.dto.ts
│   ├── application/
│   │   ├── application.controller.ts
│   │   ├── application.service.ts
│   │   ├── application.module.ts
│   │   └── dto/
│   │       ├── create-application.dto.ts
│   │       └── update-application-status.dto.ts
│   ├── cv/
│   │   ├── cv.controller.ts
│   │   ├── cv.service.ts
│   │   ├── cv.module.ts
│   │   └── dto/
│   │       └── upload-cv.dto.ts
│   ├── admin/
│   │   ├── admin.controller.ts
│   │   ├── admin.service.ts
│   │   ├── admin.module.ts
│   │   └── dto/
│   │       └── analytics.dto.ts
│   └── prisma/
│       ├── prisma.module.ts
│       └── prisma.service.ts
├── common/
│   ├── exceptions/
│   │   └── custom-exception.filter.ts
│   ├── interceptors/
│   │   └── response.interceptor.ts
│   └── utils/
│       └── pagination.util.ts
└── app.module.ts
```

### API Endpoints

#### Authentication Endpoints
- `POST /auth/register` - Register new user with role
- `POST /auth/login` - Login with email/password
- `POST /auth/refresh` - Refresh access token

#### User Endpoints
- `GET /users/me` - Get authenticated user profile
- `PATCH /users/me` - Update user profile
- `GET /users/:id` - Get user by ID (admin only)
- `GET /users` - List all users (admin only)

#### Candidate Endpoints
- `GET /candidates/me` - Get candidate profile
- `PATCH /candidates/me` - Update candidate profile
- `GET /candidates/:id` - Get candidate by ID
- `POST /candidates/me/skills` - Add skills to profile
- `DELETE /candidates/me/skills/:skillId` - Remove skill

#### CV Endpoints
- `POST /candidates/me/cvs` - Upload CV
- `GET /candidates/me/cvs` - List candidate CVs
- `DELETE /candidates/me/cvs/:cvId` - Delete CV
- `PATCH /candidates/me/cvs/:cvId/default` - Set default CV

#### Recruiter Endpoints
- `GET /recruiters/me` - Get recruiter profile
- `PATCH /recruiters/me` - Update recruiter profile

#### Company Endpoints
- `POST /companies` - Create company
- `GET /companies/:id` - Get company details
- `PATCH /companies/:id` - Update company
- `GET /companies/:id/jobs` - List company jobs

#### Job Endpoints
- `POST /jobs` - Create job posting
- `GET /jobs` - List jobs with filtering
- `GET /jobs/:id` - Get job details
- `PATCH /jobs/:id` - Update job
- `DELETE /jobs/:id` - Close/delete job

#### Application Endpoints
- `POST /applications` - Submit application
- `GET /applications` - List user applications
- `GET /applications/:id` - Get application details
- `PATCH /applications/:id/status` - Update application status
- `DELETE /applications/:id` - Withdraw application (soft delete)

#### Admin Endpoints
- `GET /admin/users` - List all users
- `GET /admin/users?role=CANDIDATE` - Filter users by role
- `GET /admin/analytics` - Get platform analytics

## Data Models

### Enums

```typescript
enum UserRole {
  CANDIDATE = 'CANDIDATE'
  RECRUITER = 'RECRUITER'
  ADMIN = 'ADMIN'
}

enum ApplicationStatus {
  APPLIED = 'APPLIED'
  REVIEWING = 'REVIEWING'
  ACCEPTED = 'ACCEPTED'
  REJECTED = 'REJECTED'
}

enum JobStatus {
  ACTIVE = 'ACTIVE'
  CLOSED = 'CLOSED'
}

enum CVStatus {
  ACTIVE = 'ACTIVE'
  ARCHIVED = 'ARCHIVED'
}

enum CompanyType {
  STARTUP = 'STARTUP'
  SMALL_BUSINESS = 'SMALL_BUSINESS'
  MEDIUM_ENTERPRISE = 'MEDIUM_ENTERPRISE'
  LARGE_ENTERPRISE = 'LARGE_ENTERPRISE'
}
```

### Prisma Schema

```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  full_name       String
  password_hash   String
  role            UserRole  @default(CANDIDATE)
  is_active       Boolean   @default(true)
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt
  last_login      DateTime?

  candidate       Candidate?
  recruiter       Recruiter?
  admin           Admin?

  @@index([email])
  @@index([role])
  @@map("users")
}

model Candidate {
  id              String    @id @default(cuid())
  user_id         String    @unique
  phone_number    String?
  bio             String?
  location        String?
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt

  user            User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  skills          CandidateSkill[]
  cvs             CV[]
  applications    Application[]

  @@map("candidates")
}

model Recruiter {
  id              String    @id @default(cuid())
  user_id         String    @unique
  company_id      String?
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt

  user            User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  company         Company?  @relation(fields: [company_id], references: [id])

  @@map("recruiters")
}

model Admin {
  id              String    @id @default(cuid())
  user_id         String    @unique
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt

  user            User      @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@map("admins")
}

model Company {
  id              String    @id @default(cuid())
  name            String
  description     String?
  website         String?
  industry        String
  company_type    CompanyType
  location        String
  recruiter_id    String    @unique
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt

  recruiter       Recruiter @relation(fields: [recruiter_id], references: [id], onDelete: Cascade)
  jobs            Job[]

  @@map("companies")
}

model Job {
  id              String    @id @default(cuid())
  company_id      String
  title           String
  description     String
  location        String
  salary_min      Int?
  salary_max      Int?
  job_type        String
  status          JobStatus @default(ACTIVE)
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt

  company         Company   @relation(fields: [company_id], references: [id], onDelete: Cascade)
  skills          JobSkill[]
  tags            JobTag[]
  applications    Application[]

  @@index([company_id])
  @@index([status])
  @@map("jobs")
}

model CV {
  id              String    @id @default(cuid())
  candidate_id    String
  file_name       String
  file_path       String
  is_default      Boolean   @default(false)
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt

  candidate       Candidate @relation(fields: [candidate_id], references: [id], onDelete: Cascade)
  applications    Application[]

  @@index([candidate_id])
  @@map("cvs")
}

model Application {
  id              String    @id @default(cuid())
  candidate_id    String
  job_id          String
  cv_id           String
  status          ApplicationStatus @default(APPLIED)
  deleted_at      DateTime?
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt

  candidate       Candidate @relation(fields: [candidate_id], references: [id], onDelete: Cascade)
  job             Job       @relation(fields: [job_id], references: [id], onDelete: Cascade)
  cv              CV        @relation(fields: [cv_id], references: [id], onDelete: Cascade)

  @@unique([candidate_id, job_id])
  @@index([candidate_id])
  @@index([job_id])
  @@index([status])
  @@map("applications")
}

model Skill {
  id              String    @id @default(cuid())
  name            String    @unique
  created_at      DateTime  @default(now())

  candidates      CandidateSkill[]
  jobs            JobSkill[]

  @@map("skills")
}

model CandidateSkill {
  id              String    @id @default(cuid())
  candidate_id    String
  skill_id        String

  candidate       Candidate @relation(fields: [candidate_id], references: [id], onDelete: Cascade)
  skill           Skill     @relation(fields: [skill_id], references: [id], onDelete: Cascade)

  @@unique([candidate_id, skill_id])
  @@map("candidate_skills")
}

model JobSkill {
  id              String    @id @default(cuid())
  job_id          String
  skill_id        String

  job             Job       @relation(fields: [job_id], references: [id], onDelete: Cascade)
  skill           Skill     @relation(fields: [skill_id], references: [id], onDelete: Cascade)

  @@unique([job_id, skill_id])
  @@map("job_skills")
}

model Tag {
  id              String    @id @default(cuid())
  name            String    @unique
  created_at      DateTime  @default(now())

  jobs            JobTag[]

  @@map("tags")
}

model JobTag {
  id              String    @id @default(cuid())
  job_id          String
  tag_id          String

  job             Job       @relation(fields: [job_id], references: [id], onDelete: Cascade)
  tag             Tag       @relation(fields: [tag_id], references: [id], onDelete: Cascade)

  @@unique([job_id, tag_id])
  @@map("job_tags")
}

model City {
  id              String    @id @default(cuid())
  name            String    @unique
  country         String
  created_at      DateTime  @default(now())

  @@map("cities")
}
```


## DTOs with Validation

### Authentication DTOs

```typescript
// register.dto.ts
export class RegisterDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase, and number'
  })
  password: string;

  @IsString()
  @MinLength(2)
  full_name: string;

  @IsEnum(UserRole)
  role: UserRole;
}

// login.dto.ts
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

// refresh-token.dto.ts
export class RefreshTokenDto {
  @IsString()
  refresh_token: string;
}
```

### User DTOs

```typescript
// create-user.dto.ts
export class CreateUserDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;

  @IsString()
  full_name: string;

  @IsEnum(UserRole)
  role: UserRole;
}

// update-user.dto.ts
export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @MinLength(8)
  password?: string;
}
```

### Candidate DTOs

```typescript
// create-candidate.dto.ts
export class CreateCandidateDto {
  @IsOptional()
  @IsPhoneNumber()
  phone_number?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skill_ids?: string[];
}

// update-candidate.dto.ts
export class UpdateCandidateDto {
  @IsOptional()
  @IsPhoneNumber()
  phone_number?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  location?: string;
}
```

### Company DTOs

```typescript
// create-company.dto.ts
export class CreateCompanyDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsString()
  industry: string;

  @IsEnum(CompanyType)
  company_type: CompanyType;

  @IsString()
  location: string;
}

// update-company.dto.ts
export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsEnum(CompanyType)
  company_type?: CompanyType;

  @IsOptional()
  @IsString()
  location?: string;
}
```

### Job DTOs

```typescript
// create-job.dto.ts
export class CreateJobDto {
  @IsString()
  @MinLength(5)
  title: string;

  @IsString()
  @MinLength(20)
  description: string;

  @IsString()
  location: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salary_min?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salary_max?: number;

  @IsString()
  job_type: string;

  @IsArray()
  @IsString({ each: true })
  skill_ids: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tag_ids?: string[];
}

// update-job.dto.ts
export class UpdateJobDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  salary_min?: number;

  @IsOptional()
  @IsNumber()
  salary_max?: number;

  @IsOptional()
  @IsString()
  job_type?: string;

  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;
}

// filter-job.dto.ts
export class FilterJobDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skill_ids?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tag_ids?: string[];

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  per_page?: number = 20;
}
```

### Application DTOs

```typescript
// create-application.dto.ts
export class CreateApplicationDto {
  @IsString()
  job_id: string;

  @IsString()
  cv_id: string;
}

// update-application-status.dto.ts
export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;
}
```

### CV DTOs

```typescript
// upload-cv.dto.ts
export class UploadCvDto {
  @IsString()
  file_name: string;

  @IsString()
  file_path: string;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}
```

## Security & Guards

### JWT Strategy

```typescript
// jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  validate(payload: any) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
```

### JWT Auth Guard

```typescript
// jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or missing token');
    }
    return user;
  }
}
```

### Roles Guard

```typescript
// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return requiredRoles.includes(user.role);
  }
}
```

### Decorators

```typescript
// public.decorator.ts
export const Public = () => SetMetadata('isPublic', true);

// roles.decorator.ts
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
```

## Error Handling

### Custom Exception Filter

```typescript
// custom-exception.filter.ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = 500;
    let message = 'Internal server error';
    let error = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = (exceptionResponse as any).message || exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      error,
    });
  }
}
```

### Error Response Format

```typescript
interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string;
  error?: any;
}
```

## Testing Strategy

### Unit Testing Approach

Unit tests focus on specific examples, edge cases, and error conditions:

- **Authentication:** Valid/invalid credentials, token generation, refresh logic
- **Validation:** Email format, password strength, file size limits
- **Authorization:** Role-based access, permission checks
- **Business Logic:** Application status transitions, skill matching
- **Error Handling:** Missing fields, duplicate emails, invalid transitions

### Property-Based Testing Approach

Property-based tests verify universal properties across all inputs using a PBT library (e.g., fast-check for TypeScript):

- **Invariants:** User role never changes after creation, application status transitions follow rules
- **Round-trip Properties:** Serialization/deserialization, password hashing verification
- **Idempotence:** Marking CV as default multiple times produces same result
- **Metamorphic:** Filtered job count ≤ total job count

### Testing Configuration

- **Unit Tests:** Jest with @nestjs/testing
- **Property Tests:** fast-check with minimum 100 iterations per property
- **Coverage Target:** >80% for critical paths (auth, application, validation)
- **Test Organization:** One test file per module/service

### Test Tag Format

Each property-based test includes a comment referencing the design property:

```typescript
// Feature: jobconnect-mvp, Property 1: Application status transitions follow valid rules
test.prop([fc.string(), fc.string()])('valid transitions allowed', (jobId, candidateId) => {
  // Test implementation
});
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Email Uniqueness Enforcement

*For any* two registration requests with the same email address, the second registration attempt SHALL be rejected with a 409 Conflict error, regardless of other field values.

**Validates: Requirements 1.2**

### Property 2: Password Hashing Round Trip

*For any* valid password string, when stored via bcrypt with 10 salt rounds, the stored hash SHALL be verifiable against the original password using bcrypt comparison, and the hash SHALL NOT equal the plaintext password.

**Validates: Requirements 1.4, 20.1, 20.2**

### Property 3: Registration Creates Role-Specific Profile

*For any* user registration with role R (CANDIDATE, RECRUITER, or ADMIN), a corresponding profile record of type R SHALL exist after registration completes.

**Validates: Requirements 1.6, 1.7, 1.8**

### Property 4: Login Token Generation

*For any* valid login with correct credentials, the response SHALL contain both an Access Token with 15-minute expiration and a Refresh Token with 7-day expiration, and both tokens SHALL be valid JWT tokens with correct signature.

**Validates: Requirements 2.5, 2.6, 21.1, 21.4, 21.5**

### Property 5: Login Timestamp Recording

*For any* successful login, the user's last_login timestamp SHALL be updated to the current time.

**Validates: Requirements 2.7**

### Property 6: Token Refresh Generates New Access Token

*For any* valid Refresh Token, calling the refresh endpoint SHALL return a new Access Token with 15-minute expiration that is different from any previously issued Access Token.

**Validates: Requirements 3.3, 3.4**

### Property 7: Expired Token Rejection

*For any* JWT token that has passed its expiration time, attempting to use it in an authenticated request SHALL result in a 401 Unauthorized error.

**Validates: Requirements 4.2, 21.3, 21.6**

### Property 8: Role-Based Access Control Enforcement

*For any* protected endpoint that requires role R, a request from a user with role R SHALL succeed, while a request from a user with any other role SHALL fail with 403 Forbidden.

**Validates: Requirements 4.3, 4.4, 4.5, 4.6, 4.7**

### Property 9: Candidate Profile Update Authorization

*For any* Candidate profile update request, if the authenticated user's ID matches the profile's user_id, the update SHALL succeed; otherwise, it SHALL fail with 403 Forbidden.

**Validates: Requirements 5.1, 5.6**

### Property 10: Candidate Profile Persistence

*For any* Candidate profile update with fields (phone_number, bio, location), the updated values SHALL be persisted and retrievable in subsequent profile queries.

**Validates: Requirements 5.2, 5.4**

### Property 11: Candidate Skill Association

*For any* set of skill IDs added to a Candidate profile, those skills SHALL be associated with the Candidate and retrievable via profile queries.

**Validates: Requirements 5.3, 5.4**

### Property 12: CV File Format Validation

*For any* CV upload, files with extensions in {pdf, doc, docx} SHALL be accepted, while files with other extensions SHALL be rejected with 400 Bad Request.

**Validates: Requirements 6.1, 6.2**

### Property 13: CV File Size Validation

*For any* CV upload, files ≤ 5MB SHALL be accepted, while files > 5MB SHALL be rejected with 413 Payload Too Large.

**Validates: Requirements 6.1, 6.3**

### Property 14: CV Default Marking Idempotence

*For any* Candidate with multiple CVs, marking the same CV as default multiple times SHALL result in the same state (only that CV marked as default).

**Validates: Requirements 6.7**

### Property 15: Company Creation Links to Recruiter

*For any* Company created by a Recruiter, the Company record SHALL be linked to that Recruiter's profile.

**Validates: Requirements 7.2**

### Property 16: Company Update Authorization

*For any* Company update request, if the authenticated Recruiter owns the Company, the update SHALL succeed; otherwise, it SHALL fail with 403 Forbidden.

**Validates: Requirements 7.3, 7.6**

### Property 17: Job Creation Sets Active Status

*For any* Job created by a Recruiter, the Job's initial status SHALL be ACTIVE.

**Validates: Requirements 8.2**

### Property 18: Job Skill Association

*For any* set of skill IDs provided during Job creation, those skills SHALL be associated with the Job and retrievable via job detail queries.

**Validates: Requirements 8.3**

### Property 19: Job Tag Association

*For any* set of tag IDs provided during Job creation, those tags SHALL be associated with the Job and retrievable via job detail queries.

**Validates: Requirements 8.4**

### Property 20: Closed Job Prevents Applications

*For any* Job with status CLOSED, attempting to submit an application SHALL fail with 400 Bad Request error "Job is no longer accepting applications".

**Validates: Requirements 8.7, 10.2**

### Property 21: Duplicate Application Prevention

*For any* Candidate-Job pair, if an Application already exists, attempting to submit another application for the same pair SHALL fail with 409 Conflict error "You have already applied to this job".

**Validates: Requirements 10.1, 10.3**

### Property 22: Application Creation with APPLIED Status

*For any* successful application submission, the created Application record SHALL have status APPLIED.

**Validates: Requirements 10.4**

### Property 23: Application Timestamp Recording

*For any* submitted Application, the created_at timestamp SHALL be set to the current time.

**Validates: Requirements 10.5**

### Property 24: Job Filtering by City

*For any* job list filtered by city C, all returned jobs SHALL have location matching C.

**Validates: Requirements 9.2**

### Property 25: Job Filtering by Skill

*For any* job list filtered by skill S, all returned jobs SHALL have S in their required skills.

**Validates: Requirements 9.3**

### Property 26: Job Filtering by Tag

*For any* job list filtered by tag T, all returned jobs SHALL have T in their tags.

**Validates: Requirements 9.4**

### Property 27: Combined Job Filters Use AND Logic

*For any* job list filtered by city C, skill S, and tag T, all returned jobs SHALL match ALL three criteria (C AND S AND T).

**Validates: Requirements 9.5**

### Property 28: Job Keyword Search Case-Insensitive

*For any* job search with keyword K, jobs with K appearing in title or description (case-insensitive) SHALL be returned.

**Validates: Requirements 9.6**

### Property 29: Pagination Default Page Size

*For any* list endpoint called without pagination parameters, the response SHALL contain at most 20 items.

**Validates: Requirements 9.1, 27.1**

### Property 30: Pagination Metadata Completeness

*For any* paginated list response, the metadata SHALL include current_page, per_page, total_count, total_pages, has_next_page, and has_previous_page.

**Validates: Requirements 9.7, 27.3, 25.5**

### Property 31: Application Status Transition Validation

*For any* Application status update, the transition SHALL be allowed only if it matches one of: APPLIED→REVIEWING, APPLIED→REJECTED, REVIEWING→ACCEPTED, REVIEWING→REJECTED. All other transitions SHALL fail with 400 Bad Request.

**Validates: Requirements 11.3, 11.4, 11.5, 12.1, 12.2, 12.3**

### Property 32: Application Status Update Authorization

*For any* Application status update request, if the authenticated Recruiter owns the Job's Company, the update SHALL succeed; otherwise, it SHALL fail with 403 Forbidden.

**Validates: Requirements 11.2**

### Property 33: Application History Sorting

*For any* Candidate's application history, applications SHALL be sorted by created_at in descending order (most recent first).

**Validates: Requirements 13.1**

### Property 34: Application History Filtering by Status

*For any* Candidate's application history filtered by status S, all returned applications SHALL have status S.

**Validates: Requirements 13.4**

### Property 35: Recruiter Dashboard Scope

*For any* Recruiter requesting their application dashboard, only applications for jobs posted by their Company SHALL be returned.

**Validates: Requirements 14.1**

### Property 36: User Profile Retrieval Includes Role-Specific Data

*For any* authenticated user requesting their profile, the response SHALL include role-specific data: Candidates receive skills/CVs/applications, Recruiters receive Company/jobs, Admins receive access level.

**Validates: Requirements 15.1, 15.2, 15.3, 15.4**

### Property 37: Email Update Uniqueness Check

*For any* user profile update with a new email, if the email is already registered to another user, the update SHALL fail with 409 Conflict.

**Validates: Requirements 16.2**

### Property 38: Password Update Hashing

*For any* user profile update with a new password, the password SHALL be hashed with bcrypt before storage and SHALL NOT be returned in the response.

**Validates: Requirements 16.3, 16.5, 20.3, 20.4**

### Property 39: Error Response Format Consistency

*For any* error response, the JSON body SHALL contain statusCode, timestamp (ISO 8601), path, and message fields.

**Validates: Requirements 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 25.4**

### Property 40: Input Validation for Email Format

*For any* email input, if it does not match RFC 5322 format, the request SHALL fail with 400 Bad Request.

**Validates: Requirements 19.1**

### Property 41: Input Validation for Password Length

*For any* password input, if it is less than 8 characters, the request SHALL fail with 400 Bad Request.

**Validates: Requirements 1.3, 19.2**

### Property 42: Input Validation for Phone Number

*For any* phone number input, if it contains characters other than digits and hyphens, the request SHALL fail with 400 Bad Request.

**Validates: Requirements 19.3**

### Property 43: Input Validation for Salary Range

*For any* job posting with salary_min and salary_max, if salary_min > salary_max, the request SHALL fail with 400 Bad Request.

**Validates: Requirements 19.4**

### Property 44: Admin User Listing Access Control

*For any* request to list all users, if the authenticated user is an Admin, the request SHALL succeed; otherwise, it SHALL fail with 403 Forbidden.

**Validates: Requirements 22.1, 22.4, 22.5**

### Property 45: Admin User Filtering by Role

*For any* admin user listing filtered by role R, all returned users SHALL have role R.

**Validates: Requirements 22.2**

### Property 46: Admin Analytics Data Aggregation

*For any* admin analytics request, the response SHALL include total user counts by role, total job postings, active job count, total application count, and application status distribution.

**Validates: Requirements 23.1, 23.2, 23.3**

### Property 47: Soft Delete Application Exclusion

*For any* application list query, applications with a non-null deleted_at timestamp SHALL be excluded from results.

**Validates: Requirements 28.1, 28.2**

### Property 48: Skill Match Percentage Calculation

*For any* job detail retrieval by a Candidate, the skill_match_percentage SHALL equal (matched_skills_count / total_required_skills_count) * 100, where matched_skills are the intersection of Candidate skills and Job required skills.

**Validates: Requirements 26.3**

### Property 49: Application Indicator in Job Details

*For any* job detail retrieval by a Candidate who has already applied, the response SHALL include an indicator showing the application exists.

**Validates: Requirements 26.4**

### Property 50: Rate Limiting Failed Attempt Tracking

*For any* failed login attempt, the failed attempt counter for that email SHALL increment by 1.

**Validates: Requirements 30.1**

### Property 51: Rate Limiting Account Lockout

*For any* email with 5 failed login attempts within 15 minutes, subsequent login attempts SHALL fail with 429 Too Many Requests error "Account temporarily locked. Try again later."

**Validates: Requirements 30.2, 30.3**

### Property 52: Rate Limiting Counter Reset on Success

*For any* successful login, the failed attempt counter for that email SHALL be reset to 0.

**Validates: Requirements 30.4**


## Error Handling

### HTTP Status Code Mapping

| Scenario | Status Code | Message |
|----------|------------|---------|
| Missing/invalid token | 401 | Missing or invalid token |
| Expired token | 401 | Token expired |
| Invalid credentials | 401 | Invalid credentials |
| Insufficient permissions | 403 | Insufficient permissions |
| Resource not found | 404 | Resource not found |
| Invalid input data | 400 | [Field-specific error message] |
| Missing required fields | 400 | Missing required fields: [field1, field2] |
| Email already registered | 409 | Email already registered |
| Duplicate application | 409 | You have already applied to this job |
| Invalid status transition | 400 | Cannot transition from [current] to [requested] |
| Closed job | 400 | Job is no longer accepting applications |
| Unsupported file format | 400 | Unsupported file format |
| File too large | 413 | File size exceeds 5MB limit |
| Account locked | 429 | Account temporarily locked. Try again later. |
| Database error | 500 | Internal server error |

### Exception Handling Strategy

1. **Validation Exceptions**: Caught by class-validator, transformed to 400 Bad Request
2. **Authentication Exceptions**: Caught by JwtAuthGuard, transformed to 401 Unauthorized
3. **Authorization Exceptions**: Caught by RolesGuard, transformed to 403 Forbidden
4. **Business Logic Exceptions**: Custom exceptions thrown by services, caught by exception filter
5. **Database Exceptions**: Prisma errors caught and transformed to appropriate HTTP status
6. **Unexpected Errors**: Caught by global exception filter, logged, and returned as 500 Internal Server Error

### Logging Strategy

- **Authentication Events**: Login attempts (success/failure), token generation, token refresh
- **Authorization Events**: Permission denied attempts, role mismatches
- **Resource Operations**: Create, update, delete operations with user ID and resource ID
- **Error Events**: All exceptions with full stack trace
- **Audit Trail**: Significant state changes (application status, job closure, etc.)

## Testing Strategy

### Unit Testing Approach

Unit tests verify specific examples, edge cases, and error conditions using Jest:

**Authentication Module:**
- Valid registration with all roles
- Duplicate email rejection
- Password validation (length, complexity)
- Password hashing verification
- Valid login with correct credentials
- Invalid login (wrong password, non-existent email)
- Token generation with correct expiration
- Token refresh with valid/invalid tokens
- Failed login attempt tracking
- Account lockout after 5 failed attempts

**Candidate Module:**
- Profile creation and retrieval
- Profile update with authorization checks
- Skill addition and removal
- CV upload with format/size validation
- CV deletion
- Default CV marking

**Job Module:**
- Job creation with skill/tag association
- Job update with authorization checks
- Job closure preventing applications
- Job filtering by city/skill/tag
- Keyword search functionality
- Pagination with correct metadata

**Application Module:**
- Application submission with duplicate prevention
- Application status transitions (valid/invalid)
- Application history retrieval and filtering
- Recruiter dashboard with correct scope
- Soft delete functionality

**Admin Module:**
- User listing with role filtering
- Analytics data aggregation
- Admin-only access control

### Property-Based Testing Approach

Property-based tests verify universal properties across generated inputs using fast-check:

**Core Properties:**
- Email uniqueness is enforced across all registration attempts
- Password hashing is consistent and verifiable
- Role-specific profiles are created for all user types
- Token expiration is enforced for all token types
- Status transitions follow the state machine rules
- Filtering operations return only matching results
- Pagination metadata is always consistent
- Authorization checks apply uniformly across all roles

**Test Configuration:**
- Minimum 100 iterations per property test
- Generators for: emails, passwords, user roles, job filters, application statuses
- Shrinking enabled to find minimal failing examples
- Timeout: 5 seconds per test

**Test Tagging:**
Each property test includes a comment with the design property reference:

```typescript
// Feature: jobconnect-mvp, Property 31: Application status transitions follow valid rules
test.prop([fc.string(), fc.string(), fc.oneof(
  fc.constant('APPLIED'),
  fc.constant('REVIEWING'),
  fc.constant('ACCEPTED'),
  fc.constant('REJECTED')
)])('valid transitions allowed', (jobId, candidateId, currentStatus) => {
  // Test implementation
});
```

### Integration Testing Approach

Integration tests verify workflows across multiple modules:

- **Registration → Login → Profile Update**: Full user onboarding flow
- **Job Creation → Job Listing → Application Submission**: Job discovery and application flow
- **Application Submission → Status Update → History Retrieval**: Application lifecycle
- **Recruiter Dashboard → Application Review → Status Change**: Recruiter workflow

### Test Coverage Goals

- **Critical Paths**: >90% coverage (authentication, authorization, application workflow)
- **Business Logic**: >85% coverage (filtering, status transitions, validation)
- **Error Handling**: >80% coverage (all error scenarios)
- **Overall**: >80% code coverage

### Test Organization

```
test/
├── unit/
│   ├── auth/
│   │   ├── auth.service.spec.ts
│   │   ├── jwt.strategy.spec.ts
│   │   └── jwt-auth.guard.spec.ts
│   ├── modules/
│   │   ├── user/
│   │   ├── candidate/
│   │   ├── recruiter/
│   │   ├── company/
│   │   ├── job/
│   │   ├── application/
│   │   ├── cv/
│   │   └── admin/
│   └── common/
│       ├── exception.filter.spec.ts
│       └── pagination.util.spec.ts
├── integration/
│   ├── auth.integration.spec.ts
│   ├── job-application.integration.spec.ts
│   ├── recruiter-workflow.integration.spec.ts
│   └── admin-features.integration.spec.ts
└── property/
    ├── auth.property.spec.ts
    ├── job.property.spec.ts
    ├── application.property.spec.ts
    └── validation.property.spec.ts
```

### Running Tests

```bash
# Unit tests
npm run test

# Unit tests with coverage
npm run test:cov

# Integration tests
npm run test:integration

# Property-based tests
npm run test:property

# All tests
npm run test:all
```

## Frontend Architecture

### API Client Utilities

```typescript
// lib/api-client.ts
export const apiClient = {
  async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const token = localStorage.getItem('accessToken');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Handle token refresh or redirect to login
      }
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  },

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  },

  post<T>(endpoint: string, data: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  patch<T>(endpoint: string, data: any) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  },
};
```

### React Query Hooks

```typescript
// hooks/useAuth.ts
export const useAuth = () => {
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: () => apiClient.get('/users/me'),
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginDto) =>
      apiClient.post('/auth/login', credentials),
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.access_token);
      localStorage.setItem('refreshToken', data.refresh_token);
    },
  });

  return { user, isLoading, login: loginMutation.mutate };
};

// hooks/useJobs.ts
export const useJobs = (filters?: FilterJobDto) => {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => apiClient.get('/jobs', { params: filters }),
  });
};

// hooks/useApplications.ts
export const useApplications = () => {
  return useQuery({
    queryKey: ['applications'],
    queryFn: () => apiClient.get('/applications'),
  });
};
```

### Authentication Context

```typescript
// context/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterDto) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', response.access_token);
    setUser(response.user);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Component Structure

```
components/
├── auth/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── ProtectedRoute.tsx
├── profile/
│   ├── CandidateProfile.tsx
│   ├── RecruiterProfile.tsx
│   └── CVUpload.tsx
├── jobs/
│   ├── JobList.tsx
│   ├── JobCard.tsx
│   ├── JobFilters.tsx
│   └── JobDetails.tsx
├── applications/
│   ├── ApplicationForm.tsx
│   ├── ApplicationList.tsx
│   ├── ApplicationCard.tsx
│   └── ApplicationStatus.tsx
└── admin/
    ├── UserManagement.tsx
    ├── Analytics.tsx
    └── UserTable.tsx
```

## Key Design Decisions

### 1. JWT-Based Authentication
**Rationale:** Stateless authentication enables horizontal scaling and works well with REST APIs. Refresh tokens provide security by keeping access tokens short-lived.

### 2. Role-Based Access Control (RBAC)
**Rationale:** Simple and effective for MVP with three distinct user types. Easily extensible to permission-based access control later.

### 3. Soft Deletes for Applications
**Rationale:** Preserves audit trail and allows recovery of withdrawn applications. Important for compliance and debugging.

### 4. Prisma ORM
**Rationale:** Type-safe database access, automatic migrations, excellent TypeScript support, and built-in relationship management.

### 5. NestJS Modular Architecture
**Rationale:** Clear separation of concerns, dependency injection, built-in validation, and excellent testing support.

### 6. Property-Based Testing
**Rationale:** Catches edge cases and ensures correctness across all input combinations. Complements unit tests for comprehensive coverage.

### 7. Pagination for List Endpoints
**Rationale:** Prevents performance issues with large datasets and provides consistent API behavior.

### 8. Rate Limiting on Auth Endpoints
**Rationale:** Protects against brute force attacks and improves security posture.

