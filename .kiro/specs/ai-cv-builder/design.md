# Design Document: AI CV Builder

## 1. Overview

### 1.1 Feature Summary

The AI CV Builder is a wizard-based feature that enables candidates to create professional CVs using AI-generated content. The system collects user information through a 3-step wizard (Info, Experience, Skills), then leverages OpenAI GPT-4/GPT-3.5 to generate professional summaries, job descriptions, and bullet points.

### 1.2 Design Goals

- **Simplicity**: Intuitive 3-step wizard flow with clear progress indication
- **Quality**: AI-generated content that is professional, ATS-optimized, and contextually relevant
- **Performance**: CV generation completed within 10 seconds (p95)
- **Reliability**: Graceful error handling with retry logic for AI service failures
- **Scalability**: Stateless API design supporting horizontal scaling

### 1.3 Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| AI Service | OpenAI GPT-4/GPT-3.5-turbo | User requirement, industry-leading quality |
| Generation Mode | Batch (after all steps) | Simpler implementation, better context for AI |
| Data Persistence | No database storage | User requirement, generate-and-display only |
| Frontend Framework | Next.js + React + TypeScript | Existing tech stack |
| Backend Framework | NestJS + Prisma + PostgreSQL | Existing tech stack |
| State Management | React Context + localStorage | Session persistence without backend |
| AI Client Library | openai npm package | Official SDK with TypeScript support |

### 1.4 Out of Scope

- Real-time AI suggestions during input
- CV parsing from uploaded files
- LinkedIn import
- Database persistence of generated CVs
- Multi-language support (Vietnamese only in MVP)

---

## 2. Architecture

### 2.1 High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend - Next.js"
        UI[Wizard UI Components]
        State[React Context State]
        LocalStorage[localStorage]
        UI --> State
        State --> LocalStorage
    end
    
    subgraph "Backend - NestJS"
        API[CV Controller]
        Service[CV Service]
        AIService[OpenAI Service]
        Validator[DTO Validators]
        
        API --> Validator
        API --> Service
        Service --> AIService
    end
    
    subgraph "External Services"
        OpenAI[OpenAI API<br/>GPT-4/GPT-3.5]
    end
    
    subgraph "Infrastructure"
        Auth[JWT Auth Guard]
        RateLimit[Rate Limiter]
        Logger[Winston Logger]
    end
    
    UI -->|POST /api/cv/generate| API
    API --> Auth
    API --> RateLimit
    AIService -->|API Call| OpenAI
    Service --> Logger
    
    style OpenAI fill:#10a37f
    style UI fill:#0070f3
    style API fill:#e535ab
```

### 2.2 Component Architecture

#### Frontend Components

```
cv-builder/
├── ai/
│   ├── page.tsx                    # Main wizard container
│   ├── components/
│   │   ├── WizardProgress.tsx      # Step indicator (1/3, 2/3, 3/3)
│   │   ├── StepInfo.tsx            # Step 1: Industry, Job Title, Level, Template
│   │   ├── StepExperience.tsx      # Step 2: Work experiences
│   │   ├── StepSkills.tsx          # Step 3: Skills and strengths
│   │   ├── StepGenerate.tsx        # Step 4: Summary and generate button
│   │   ├── ExperienceForm.tsx      # Dynamic experience entry form
│   │   ├── SkillsInput.tsx         # Tag-based skills input
│   │   └── LoadingOverlay.tsx      # AI generation loading state
│   ├── context/
│   │   └── CVBuilderContext.tsx    # Global state management
│   ├── hooks/
│   │   ├── useCVBuilder.ts         # Custom hook for wizard logic
│   │   └── useLocalStorage.ts      # Persist state to localStorage
│   ├── types/
│   │   └── cv-builder.types.ts     # TypeScript interfaces
│   └── utils/
│       ├── validation.ts           # Form validation logic
│       └── api.ts                  # API client functions
```

#### Backend Modules

```
backend/src/modules/
├── cv/
│   ├── cv.controller.ts            # Existing CV endpoints
│   ├── cv.service.ts               # Existing CV service
│   ├── cv.module.ts                # Module definition
│   └── dto/
│       ├── create-cv.dto.ts        # Existing DTO
│       ├── generate-cv.dto.ts      # NEW: AI generation request
│       └── generated-cv.dto.ts     # NEW: AI generation response
├── ai/                             # NEW MODULE
│   ├── ai.module.ts                # AI module definition
│   ├── ai.service.ts               # OpenAI integration service
│   ├── prompt.service.ts           # Prompt engineering service
│   └── dto/
│       ├── ai-request.dto.ts       # AI service request
│       └── ai-response.dto.ts      # AI service response
└── common/
    ├── guards/
    │   └── rate-limit.guard.ts     # NEW: Rate limiting guard
    └── interceptors/
        └── logging.interceptor.ts  # Request/response logging
```

### 2.3 Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant LocalStorage
    participant Backend
    participant OpenAI
    
    User->>Frontend: Fill Step 1 (Info)
    Frontend->>LocalStorage: Save state
    User->>Frontend: Fill Step 2 (Experience)
    Frontend->>LocalStorage: Save state
    User->>Frontend: Fill Step 3 (Skills)
    Frontend->>LocalStorage: Save state
    User->>Frontend: Click "Generate CV"
    Frontend->>Frontend: Validate all data
    Frontend->>Backend: POST /api/cv/generate
    Backend->>Backend: Validate DTO
    Backend->>Backend: Build AI prompts
    Backend->>OpenAI: Chat Completion API
    OpenAI-->>Backend: Generated content
    Backend->>Backend: Format response
    Backend-->>Frontend: Generated CV data
    Frontend->>Frontend: Display preview
    Frontend->>LocalStorage: Clear wizard state
    User->>Frontend: Edit/Download CV
```

### 2.4 Security Architecture

```mermaid
graph LR
    Request[HTTP Request] --> CORS[CORS Middleware]
    CORS --> JWT[JWT Auth Guard]
    JWT --> Role[Role Guard]
    Role --> RateLimit[Rate Limit Guard]
    RateLimit --> Validation[DTO Validation]
    Validation --> Sanitize[Input Sanitization]
    Sanitize --> Controller[Controller]
    
    style JWT fill:#ff6b6b
    style RateLimit fill:#ffd93d
    style Validation fill:#6bcf7f
```

**Security Layers:**

1. **CORS**: Restrict origins to frontend domain
2. **JWT Authentication**: Verify user identity
3. **Role Authorization**: Ensure user is CANDIDATE role
4. **Rate Limiting**: 10 requests/minute per user
5. **Input Validation**: class-validator decorators
6. **Input Sanitization**: Strip HTML, prevent injection
7. **API Key Security**: OpenAI key in environment variables

---

## 3. Components and Interfaces

### 3.1 Frontend Components

#### 3.1.1 WizardProgress Component

**Purpose**: Display current step and allow navigation

**Props**:
```typescript
interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
  completedSteps: number[];
}
```

**Behavior**:
- Visual indicator showing 1/3, 2/3, 3/3
- Clickable steps if already completed
- Disabled future steps

#### 3.1.2 StepInfo Component

**Purpose**: Collect basic information (Step 1)

**State**:
```typescript
interface InfoState {
  industry: Industry;
  jobTitle: string;
  level: ExperienceLevel;
  templateId: number;
  uploadedCV?: File;
}
```

**Validation**:
- `jobTitle` required (min 2 chars, max 100 chars)
- `industry` required (enum validation)
- `level` required (enum validation)
- `templateId` required (1-3)

#### 3.1.3 StepExperience Component

**Purpose**: Collect work experiences (Step 2)

**State**:
```typescript
interface ExperienceState {
  experiences: Experience[];
}

interface Experience {
  id: string;
  company: string;
  position: string;
  workType: WorkType;
  startDate: string; // MM/YYYY
  endDate?: string; // MM/YYYY
  isCurrently: boolean;
  description: string;
  achievements: string;
  softSkills: string[];
}
```

**Validation**:
- At least 1 experience required
- `company` required (max 100 chars)
- `position` required (max 100 chars)
- `startDate` required (MM/YYYY format)
- `endDate` required if `isCurrently` is false
- `description` max 1000 chars
- `achievements` max 800 chars

#### 3.1.4 StepSkills Component

**Purpose**: Collect skills and strengths (Step 3)

**State**:
```typescript
interface SkillsState {
  skills: Skill[];
  strengths: string[];
}

interface Skill {
  name: string;
  category: 'hard' | 'soft' | 'language';
  level: 'basic' | 'intermediate' | 'advanced';
}
```

**Validation**:
- At least 3 skills required
- Max 50 skills
- Max 6 strengths
- Skill name max 50 chars

#### 3.1.5 CVBuilderContext

**Purpose**: Global state management for wizard

**Context Value**:
```typescript
interface CVBuilderContextValue {
  // State
  currentStep: number;
  info: InfoState;
  experience: ExperienceState;
  skills: SkillsState;
  isGenerating: boolean;
  generatedCV: GeneratedCV | null;
  error: string | null;
  
  // Actions
  setCurrentStep: (step: number) => void;
  updateInfo: (info: Partial<InfoState>) => void;
  updateExperience: (experience: Partial<ExperienceState>) => void;
  updateSkills: (skills: Partial<SkillsState>) => void;
  generateCV: () => Promise<void>;
  resetWizard: () => void;
  
  // Validation
  validateStep: (step: number) => boolean;
  canProceed: (step: number) => boolean;
}
```

### 3.2 Backend Services

#### 3.2.1 CVController

**New Endpoint**: `POST /api/cv/generate`

**Purpose**: Generate CV content using AI

**Request**:
```typescript
class GenerateCVDto {
  @IsString()
  @IsNotEmpty()
  industry: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  jobTitle: string;

  @IsString()
  @IsNotEmpty()
  level: string;

  @IsNumber()
  @Min(1)
  @Max(3)
  templateId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  experiences: ExperienceDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillDto)
  @ArrayMinSize(3)
  @ArrayMaxSize(50)
  skills: SkillDto[];

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(6)
  strengths: string[];
}
```

**Response**:
```typescript
class GeneratedCVDto {
  summary: string;
  experiences: GeneratedExperience[];
  skills: GroupedSkills;
  strengths: string[];
  metadata: {
    generatedAt: Date;
    model: string;
    tokensUsed: number;
  };
}

class GeneratedExperience {
  company: string;
  position: string;
  duration: string;
  description: string[]; // bullet points
  achievements: string[]; // refined achievements
}

class GroupedSkills {
  hard: string[];
  soft: string[];
  languages: string[];
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Missing/invalid JWT
- `403 Forbidden`: Not a candidate role
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: AI service failure
- `503 Service Unavailable`: OpenAI API down

#### 3.2.2 AIService

**Purpose**: Encapsulate OpenAI API integration

**Methods**:

```typescript
class AIService {
  /**
   * Generate professional CV summary
   */
  async generateSummary(input: SummaryInput): Promise<string>;
  
  /**
   * Generate job description bullet points
   */
  async generateJobDescription(input: JobDescriptionInput): Promise<string[]>;
  
  /**
   * Refine achievement statements
   */
  async refineAchievements(input: AchievementInput): Promise<string[]>;
  
  /**
   * Generate complete CV content (orchestrator)
   */
  async generateCVContent(input: GenerateCVDto): Promise<GeneratedCVDto>;
}
```

**Configuration**:
```typescript
interface AIServiceConfig {
  apiKey: string;
  model: 'gpt-4' | 'gpt-3.5-turbo';
  maxTokens: number;
  temperature: number;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
}
```

#### 3.2.3 PromptService

**Purpose**: Manage AI prompts with best practices

**Methods**:
```typescript
class PromptService {
  /**
   * Build summary generation prompt
   */
  buildSummaryPrompt(input: SummaryInput): ChatCompletionMessage[];
  
  /**
   * Build job description prompt
   */
  buildJobDescriptionPrompt(input: JobDescriptionInput): ChatCompletionMessage[];
  
  /**
   * Build achievement refinement prompt
   */
  buildAchievementPrompt(input: AchievementInput): ChatCompletionMessage[];
}
```

**Prompt Structure**:
```typescript
interface PromptTemplate {
  system: string; // Role and instructions
  user: string; // User input with context
  examples?: Array<{ // Few-shot examples
    input: string;
    output: string;
  }>;
}
```

---

## 4. Data Models

### 4.1 Frontend TypeScript Interfaces

```typescript
// Enums
enum Industry {
  IT = 'IT',
  MARKETING = 'MARKETING',
  BUSINESS = 'BUSINESS',
  DESIGN = 'DESIGN',
  EDUCATION = 'EDUCATION',
  FINANCE = 'FINANCE',
  HR = 'HR',
  OTHER = 'OTHER',
}

enum ExperienceLevel {
  FRESHER = 'FRESHER',
  LESS_THAN_1_YEAR = 'LESS_THAN_1_YEAR',
  ONE_TO_THREE_YEARS = 'ONE_TO_THREE_YEARS',
  THREE_TO_FIVE_YEARS = 'THREE_TO_FIVE_YEARS',
  SENIOR = 'SENIOR',
}

enum WorkType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
}

enum SkillCategory {
  HARD = 'hard',
  SOFT = 'soft',
  LANGUAGE = 'language',
}

enum SkillLevel {
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

// Wizard State
interface CVBuilderState {
  currentStep: number;
  info: InfoState;
  experience: ExperienceState;
  skills: SkillsState;
  isGenerating: boolean;
  generatedCV: GeneratedCV | null;
  error: string | null;
}

interface InfoState {
  industry: Industry;
  jobTitle: string;
  level: ExperienceLevel;
  templateId: number;
  uploadedCV?: File;
}

interface ExperienceState {
  experiences: Experience[];
}

interface Experience {
  id: string;
  company: string;
  position: string;
  workType: WorkType;
  startDate: string; // MM/YYYY
  endDate?: string; // MM/YYYY
  isCurrently: boolean;
  description: string;
  achievements: string;
  softSkills: string[];
}

interface SkillsState {
  skills: Skill[];
  strengths: string[];
}

interface Skill {
  name: string;
  category: SkillCategory;
  level: SkillLevel;
}

// Generated CV
interface GeneratedCV {
  summary: string;
  experiences: GeneratedExperience[];
  skills: GroupedSkills;
  strengths: string[];
  metadata: CVMetadata;
}

interface GeneratedExperience {
  company: string;
  position: string;
  duration: string;
  description: string[];
  achievements: string[];
}

interface GroupedSkills {
  hard: string[];
  soft: string[];
  languages: string[];
}

interface CVMetadata {
  generatedAt: Date;
  model: string;
  tokensUsed: number;
}
```

### 4.2 Backend DTOs

```typescript
// Request DTOs
export class GenerateCVDto {
  @IsString()
  @IsNotEmpty()
  industry: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  jobTitle: string;

  @IsString()
  @IsNotEmpty()
  level: string;

  @IsNumber()
  @Min(1)
  @Max(3)
  templateId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  experiences: ExperienceDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillDto)
  @ArrayMinSize(3)
  @ArrayMaxSize(50)
  skills: SkillDto[];

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(6)
  strengths: string[];
}

export class ExperienceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  company: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  position: string;

  @IsString()
  @IsNotEmpty()
  workType: string;

  @IsString()
  @Matches(/^\d{2}\/\d{4}$/, {
    message: 'startDate must be in MM/YYYY format',
  })
  startDate: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}\/\d{4}$/, {
    message: 'endDate must be in MM/YYYY format',
  })
  endDate?: string;

  @IsBoolean()
  isCurrently: boolean;

  @IsString()
  @MaxLength(1000)
  description: string;

  @IsString()
  @MaxLength(800)
  achievements: string;

  @IsArray()
  @IsString({ each: true })
  softSkills: string[];
}

export class SkillDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsString()
  @IsIn(['hard', 'soft', 'language'])
  category: string;

  @IsString()
  @IsIn(['basic', 'intermediate', 'advanced'])
  level: string;
}

// Response DTOs
export class GeneratedCVDto {
  summary: string;
  experiences: GeneratedExperienceDto[];
  skills: GroupedSkillsDto;
  strengths: string[];
  metadata: CVMetadataDto;
}

export class GeneratedExperienceDto {
  company: string;
  position: string;
  duration: string;
  description: string[];
  achievements: string[];
}

export class GroupedSkillsDto {
  hard: string[];
  soft: string[];
  languages: string[];
}

export class CVMetadataDto {
  generatedAt: Date;
  model: string;
  tokensUsed: number;
}
```

### 4.3 Database Schema

**Note**: Per requirements, generated CV content is NOT persisted to database. Only metadata is stored if user chooses to save.

**Existing CV Table** (from Prisma schema):
```prisma
model CV {
  id          String      @id @default(uuid())
  title       String
  cvUrl       String      // Link to PDF or preview URL
  cvType      CVType      @default(UPLOADED) // UPLOADED or BUILDER
  cvData      Json?       // Optional: Store raw wizard data
  status      CVStatus    @default(DONE)
  
  candidateId String
  candidate   Candidate   @relation(fields: [candidateId], references: [id])
  
  applications Application[]
  
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  deletedAt   DateTime?

  @@map("cvs")
}

enum CVType {
  UPLOADED
  BUILDER
}

enum CVStatus {
  DONE
  DRAFT
  DELETED
}
```

**Usage for AI CV Builder**:
- `cvType`: Set to `BUILDER`
- `cvUrl`: Link to generated PDF (if user downloads)
- `cvData`: Store wizard input data (optional, for regeneration)
- Generated content is NOT stored in database

### 4.4 localStorage Schema

**Key**: `cv-builder-state`

**Value**:
```typescript
interface LocalStorageState {
  version: string; // Schema version for migration
  timestamp: number; // Last updated timestamp
  data: CVBuilderState;
  expiresAt: number; // Auto-clear after 24 hours
}
```

**Storage Strategy**:
- Save on every step completion
- Clear after successful generation
- Auto-expire after 24 hours
- Validate schema version on load

---

## 5. AI Integration

### 5.1 OpenAI Configuration

**Model Selection**:
- **Primary**: GPT-4 (higher quality, slower, more expensive)
- **Fallback**: GPT-3.5-turbo (faster, cheaper, good quality)
- **Strategy**: Use GPT-3.5-turbo for MVP, upgrade to GPT-4 based on user feedback

**Configuration**:
```typescript
const openAIConfig = {
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID, // Optional
  model: 'gpt-3.5-turbo', // or 'gpt-4'
  maxTokens: 1500, // Limit response length
  temperature: 0.7, // Balance creativity and consistency
  topP: 1,
  frequencyPenalty: 0.3, // Reduce repetition
  presencePenalty: 0.3, // Encourage diversity
  timeout: 30000, // 30 seconds
};
```

### 5.2 Prompt Engineering

#### 5.2.1 Professional Summary Prompt

**System Message**:
```
You are an expert CV writer specializing in creating compelling professional summaries. Your summaries are:
- Concise (2-3 sentences, 100-150 words)
- Achievement-focused
- ATS-optimized with relevant keywords
- Tailored to the target role and industry
- Written in third person, professional tone
```

**User Message Template**:
```
Generate a professional summary for a CV with the following details:

Industry: {industry}
Target Role: {jobTitle}
Experience Level: {level}
Key Skills: {topSkills}
Recent Experience: {latestExperience}

Requirements:
- Highlight relevant skills and achievements
- Include industry-specific keywords
- Emphasize career progression
- Keep it concise and impactful
```

**Example Output**:
```
Experienced Software Engineer with 5+ years in full-stack development, specializing in React, Node.js, and cloud architecture. Proven track record of delivering scalable web applications serving 1M+ users, with expertise in microservices and CI/CD pipelines. Passionate about clean code, performance optimization, and mentoring junior developers.
```

#### 5.2.2 Job Description Prompt

**System Message**:
```
You are an expert CV writer specializing in crafting impactful job descriptions. Your descriptions:
- Use strong action verbs (Led, Developed, Implemented, Optimized)
- Quantify achievements with metrics when possible
- Follow the STAR method (Situation, Task, Action, Result)
- Are concise (3-5 bullet points per role)
- Are ATS-optimized with relevant keywords
```

**User Message Template**:
```
Generate professional bullet points for this work experience:

Company: {company}
Position: {position}
Duration: {duration}
Industry: {industry}
Description: {userDescription}
Achievements: {userAchievements}

Requirements:
- Create 3-5 impactful bullet points
- Start each with a strong action verb
- Include metrics and quantifiable results where possible
- Highlight technical skills and tools used
- Emphasize impact and value delivered
```

**Example Output**:
```
- Led development of microservices architecture serving 500K+ daily active users, reducing API response time by 40%
- Implemented CI/CD pipeline using Jenkins and Docker, decreasing deployment time from 2 hours to 15 minutes
- Mentored team of 5 junior developers, conducting code reviews and technical training sessions
- Optimized database queries and caching strategies, improving application performance by 60%
- Collaborated with product and design teams to deliver 15+ features in agile sprints
```

#### 5.2.3 Achievement Refinement Prompt

**System Message**:
```
You are an expert CV writer specializing in refining achievement statements. You transform vague statements into powerful, quantifiable achievements using the STAR method.
```

**User Message Template**:
```
Refine these achievement statements to be more impactful:

{userAchievements}

Requirements:
- Make them specific and quantifiable
- Add metrics if missing (use realistic estimates)
- Use strong action verbs
- Emphasize business impact
- Keep each achievement to 1-2 lines
```

**Example Input**:
```
- Improved website performance
- Worked on team projects
- Fixed bugs
```

**Example Output**:
```
- Optimized website performance by implementing lazy loading and code splitting, reducing page load time by 50%
- Collaborated with cross-functional team of 8 members to deliver 3 major product releases on schedule
- Resolved 100+ critical bugs through systematic debugging and root cause analysis, improving application stability by 30%
```

### 5.3 Token Optimization

**Strategies**:

1. **Prompt Compression**: Remove unnecessary words while maintaining clarity
2. **Response Limits**: Set `max_tokens` to prevent excessive output
3. **Batch Processing**: Combine multiple requests where possible
4. **Caching**: Cache common prompts and responses (future enhancement)

**Token Budget**:
```typescript
const tokenBudget = {
  summary: {
    prompt: ~300 tokens,
    response: ~200 tokens,
    total: ~500 tokens
  },
  jobDescription: {
    prompt: ~400 tokens per experience,
    response: ~300 tokens per experience,
    total: ~700 tokens per experience
  },
  achievements: {
    prompt: ~200 tokens,
    response: ~150 tokens,
    total: ~350 tokens
  }
};

// Total for typical CV (3 experiences):
// Summary: 500 tokens
// 3 Job Descriptions: 2100 tokens
// Achievements: 350 tokens
// Total: ~3000 tokens (~$0.003 with GPT-3.5-turbo)
```

### 5.4 Error Handling and Retry Logic

**Error Types**:

1. **Rate Limit (429)**: Exponential backoff retry
2. **Timeout**: Retry with increased timeout
3. **Invalid Response**: Retry with modified prompt
4. **Content Filter**: Return user input with minimal formatting
5. **API Down (503)**: Return graceful error message

**Retry Strategy**:
```typescript
class RetryStrategy {
  maxRetries = 3;
  baseDelay = 1000; // 1 second
  maxDelay = 10000; // 10 seconds
  
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    errorHandler?: (error: Error, attempt: number) => boolean
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Check if should retry
        if (errorHandler && !errorHandler(error, attempt)) {
          throw error;
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
          this.baseDelay * Math.pow(2, attempt - 1),
          this.maxDelay
        );
        
        // Add jitter to prevent thundering herd
        const jitter = Math.random() * 0.3 * delay;
        await this.sleep(delay + jitter);
      }
    }
    
    throw lastError;
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

**Error Response Format**:
```typescript
interface AIErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    retryable: boolean;
    retryAfter?: number; // seconds
  };
}
```

### 5.5 Rate Limiting

**OpenAI Rate Limits** (Tier 1):
- GPT-3.5-turbo: 3,500 RPM, 90,000 TPM
- GPT-4: 500 RPM, 10,000 TPM

**Application Rate Limits**:
- Per User: 10 requests/minute
- Per IP: 50 requests/minute
- Global: 100 requests/minute

**Implementation**:
```typescript
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly limiter = new Map<string, RateLimitInfo>();
  
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;
    const key = userId || request.ip;
    
    const limit = this.limiter.get(key) || {
      count: 0,
      resetAt: Date.now() + 60000
    };
    
    if (Date.now() > limit.resetAt) {
      limit.count = 0;
      limit.resetAt = Date.now() + 60000;
    }
    
    if (limit.count >= 10) {
      throw new HttpException(
        'Rate limit exceeded. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS
      );
    }
    
    limit.count++;
    this.limiter.set(key, limit);
    
    return true;
  }
}
```

### 5.6 Cost Management

**Pricing** (as of 2024):
- GPT-3.5-turbo: $0.0005/1K input tokens, $0.0015/1K output tokens
- GPT-4: $0.03/1K input tokens, $0.06/1K output tokens

**Cost per CV Generation**:
- GPT-3.5-turbo: ~$0.003 per CV
- GPT-4: ~$0.12 per CV

**Monthly Budget**:
- Budget: $100/month
- GPT-3.5-turbo: ~33,000 CVs/month
- GPT-4: ~800 CVs/month

**Cost Optimization**:
1. Use GPT-3.5-turbo as default
2. Implement caching for common patterns
3. Monitor token usage per request
4. Set hard limits per user (5 CVs/month for free tier)
5. Alert when approaching budget limits

---

## 6. Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following testable properties. Several properties were combined to eliminate redundancy:

**Combined Properties:**
- File upload validation (1.5 and 3.6) → Single property for file validation
- State persistence without API calls (1.7, 2.7, 3.7) → Covered by integration tests, not PBT
- Input validation and sanitization (4.9, 4.10) → Combined into comprehensive validation property

**Properties Suitable for PBT:**
The following properties test pure functions and business logic that can be verified across many generated inputs:

### Property 1: File Upload Validation

*For any* file input, the validation function SHALL correctly accept PDF or DOCX files under 5MB and reject all other files (wrong type, too large, or missing).

**Validates: Requirements US-1.5, US-3.6**

**Test Strategy**: Generate random files with varying types, sizes, and content. Verify that:
- PDF files under 5MB are accepted
- DOCX files under 5MB are accepted
- Files over 5MB are rejected
- Non-PDF/DOCX files are rejected
- Null/undefined files are rejected

### Property 2: Required Field Validation

*For any* form state in Step 1, the validation function SHALL return false if jobTitle is empty or whitespace-only, and true if jobTitle contains at least one non-whitespace character.

**Validates: Requirements US-1.6**

**Test Strategy**: Generate random form states with varying jobTitle values (empty string, whitespace, valid text, special characters). Verify validation correctly identifies invalid states.

### Property 3: Conditional End Date Validation

*For any* experience entry, when isCurrently is true, the validation function SHALL pass regardless of endDate value; when isCurrently is false, validation SHALL require a valid endDate in MM/YYYY format.

**Validates: Requirements US-2.3**

**Test Strategy**: Generate random experience entries with varying isCurrently and endDate combinations. Verify validation logic correctly handles both cases.

### Property 4: Skills Grouping

*For any* array of skills with category labels, the grouping function SHALL correctly separate skills into exactly three groups (hard, soft, language) with no skills lost or duplicated.

**Validates: Requirements US-3.3**

**Test Strategy**: Generate random skill arrays with varying categories and verify:
- All skills are present in output
- No skills are duplicated
- Each skill appears in correct category
- All three categories exist in output (even if empty)

### Property 5: API Request Transformation

*For any* valid wizard state (passing all validation), the API request builder SHALL produce a GenerateCVDto object containing all required fields with correct data types and formats.

**Validates: Requirements US-4.2**

**Test Strategy**: Generate random valid wizard states and verify the transformed API request:
- Contains all required fields (industry, jobTitle, level, templateId, experiences, skills, strengths)
- All fields have correct data types
- Date formats are preserved (MM/YYYY)
- Arrays have correct lengths (experiences 1-10, skills 3-50, strengths 0-6)

### Property 6: Input Sanitization

*For any* input string containing HTML tags, script tags, or SQL injection patterns, the sanitization function SHALL remove or escape dangerous content while preserving safe text.

**Validates: Requirements US-4.10, NFR-6**

**Test Strategy**: Generate random strings with varying dangerous content (HTML tags, script tags, SQL keywords, special characters). Verify sanitization:
- Removes <script> tags
- Escapes HTML entities
- Removes SQL injection patterns
- Preserves safe text content
- Handles edge cases (nested tags, malformed HTML)

### Property 7: Prompt Structure Validation

*For any* valid GenerateCVDto input, the prompt builder SHALL produce a valid OpenAI ChatCompletionMessage array with system and user messages, proper formatting, and all required context.

**Validates: Requirements US-4.11, FR-7.2**

**Test Strategy**: Generate random valid inputs and verify prompt structure:
- Array contains at least 2 messages (system, user)
- System message has role="system" and non-empty content
- User message has role="user" and includes all input context
- Messages are properly formatted JSON
- No sensitive data is leaked in prompts

### Property 8: Response Formatting

*For any* valid OpenAI API response, the response formatter SHALL produce a GeneratedCVDto with all required fields (summary, experiences, skills, strengths, metadata) properly structured.

**Validates: Requirements US-4.12**

**Test Strategy**: Generate random valid OpenAI responses (mocked) and verify formatting:
- Output contains all required fields
- Summary is non-empty string
- Experiences array matches input length
- Each experience has description array (3-5 items) and achievements array (1-3 items)
- Skills are grouped into three categories
- Metadata contains generatedAt, model, tokensUsed

### Property 9: Error Response Mapping

*For any* OpenAI error type (rate limit, timeout, invalid response, content filter), the error handler SHALL return an appropriate HTTP status code and user-friendly error message.

**Validates: Requirements US-4.13, NFR-11**

**Test Strategy**: Generate random OpenAI errors and verify error mapping:
- Rate limit (429) → 429 with retry-after header
- Timeout → 500 with "Service temporarily unavailable"
- Invalid response → 500 with "Failed to generate content"
- Content filter → 400 with "Content violates policy"
- Unknown errors → 500 with generic message

### Property 10: Date Format Preservation

*For any* experience with valid startDate and endDate in MM/YYYY format, the round-trip through API request and response SHALL preserve the exact date format.

**Validates: Requirements FR-8.2**

**Test Strategy**: Generate random dates in MM/YYYY format, send through API transformation, and verify:
- Format is preserved exactly (MM/YYYY)
- No timezone conversions occur
- Leading zeros are maintained
- Invalid dates are rejected

---

## 7. Error Handling

### 7.1 Frontend Error Handling

#### 7.1.1 Validation Errors

**Trigger**: User attempts to proceed with invalid data

**Handling**:
```typescript
interface ValidationError {
  field: string;
  message: string;
  type: 'required' | 'format' | 'length' | 'range';
}

// Display inline error messages
<Input
  error={errors.jobTitle}
  helperText={errors.jobTitle?.message}
/>
```

**User Experience**:
- Inline error messages below fields
- Red border on invalid fields
- Disable "Next" button until valid
- Clear errors on field change

#### 7.1.2 API Errors

**Trigger**: Backend returns error response

**Handling**:
```typescript
try {
  const response = await generateCV(data);
  setGeneratedCV(response);
} catch (error) {
  if (error.status === 429) {
    setError('Too many requests. Please try again in a few minutes.');
  } else if (error.status === 500) {
    setError('Failed to generate CV. Please try again.');
  } else {
    setError('An unexpected error occurred. Please try again.');
  }
}
```

**User Experience**:
- Toast notification with error message
- "Retry" button for retryable errors
- "Contact Support" link for persistent errors
- Error logged to monitoring service

#### 7.1.3 Network Errors

**Trigger**: Network request fails

**Handling**:
```typescript
const generateCV = async (data: CVBuilderState) => {
  try {
    const response = await fetch('/api/cv/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(30000), // 30s timeout
    });
    
    if (!response.ok) {
      throw new APIError(response.status, await response.json());
    }
    
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
};
```

**User Experience**:
- Timeout after 30 seconds
- Clear error message
- Automatic retry option
- Offline detection

### 7.2 Backend Error Handling

#### 7.2.1 Validation Errors (400)

**Trigger**: Invalid request data

**Response**:
```typescript
{
  "statusCode": 400,
  "message": [
    "jobTitle must be longer than or equal to 2 characters",
    "experiences must contain at least 1 elements"
  ],
  "error": "Bad Request"
}
```

**Handling**:
- class-validator automatic validation
- Return all validation errors
- Log validation failures

#### 7.2.2 Authentication Errors (401, 403)

**Trigger**: Missing/invalid JWT or wrong role

**Response**:
```typescript
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**Handling**:
- JWT guard rejects invalid tokens
- Role guard rejects non-candidates
- Redirect to login page

#### 7.2.3 Rate Limit Errors (429)

**Trigger**: User exceeds rate limit

**Response**:
```typescript
{
  "statusCode": 429,
  "message": "Rate limit exceeded. Please try again later.",
  "error": "Too Many Requests",
  "retryAfter": 60 // seconds
}
```

**Handling**:
- Rate limit guard tracks requests
- Return retry-after header
- Log rate limit violations

#### 7.2.4 OpenAI API Errors (500, 503)

**Trigger**: OpenAI API failure

**Response**:
```typescript
{
  "statusCode": 500,
  "message": "Failed to generate CV content. Please try again.",
  "error": "Internal Server Error",
  "retryable": true
}
```

**Handling**:
```typescript
async generateCVContent(input: GenerateCVDto): Promise<GeneratedCVDto> {
  try {
    return await this.retryStrategy.executeWithRetry(
      () => this.callOpenAI(input),
      (error, attempt) => {
        // Retry on rate limit or timeout
        if (error.status === 429 || error.code === 'ETIMEDOUT') {
          this.logger.warn(`OpenAI error, retry ${attempt}/3`, error);
          return true;
        }
        // Don't retry on content filter or invalid request
        if (error.status === 400) {
          return false;
        }
        return attempt < 3;
      }
    );
  } catch (error) {
    this.logger.error('OpenAI API failed after retries', error);
    throw new HttpException(
      'Failed to generate CV content. Please try again.',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
```

**Retry Logic**:
- Max 3 retries
- Exponential backoff (1s, 2s, 4s)
- Retry on: 429 (rate limit), timeout, 503 (service unavailable)
- Don't retry on: 400 (bad request), 401 (auth), content filter

#### 7.2.5 Unexpected Errors (500)

**Trigger**: Unhandled exceptions

**Response**:
```typescript
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

**Handling**:
- Global exception filter catches all errors
- Log full error with stack trace
- Return generic error message (don't leak internals)
- Alert monitoring service

### 7.3 Error Logging

**Log Levels**:
- **ERROR**: OpenAI failures, unexpected exceptions
- **WARN**: Rate limits, retries, validation failures
- **INFO**: Successful generations, API calls
- **DEBUG**: Detailed request/response data

**Log Format**:
```typescript
{
  timestamp: '2024-01-15T10:30:00Z',
  level: 'ERROR',
  context: 'AIService',
  message: 'OpenAI API failed',
  userId: 'user-123',
  requestId: 'req-456',
  error: {
    name: 'OpenAIError',
    message: 'Rate limit exceeded',
    status: 429,
    stack: '...'
  },
  metadata: {
    model: 'gpt-3.5-turbo',
    tokensRequested: 1500,
    attempt: 3
  }
}
```

**Monitoring**:
- Error rate alerts (>5% error rate)
- OpenAI API latency alerts (>10s p95)
- Rate limit alerts (user hitting limits)
- Cost alerts (approaching budget)

---

## 8. Testing Strategy

### 8.1 Testing Approach

**Dual Testing Strategy**:
- **Unit Tests**: Specific examples, edge cases, UI components
- **Property-Based Tests**: Universal properties across all inputs
- **Integration Tests**: API endpoints, OpenAI integration (mocked)
- **E2E Tests**: Complete wizard flow

### 8.2 Unit Tests

**Frontend Unit Tests** (Jest + React Testing Library):

```typescript
// Example: StepInfo validation
describe('StepInfo Validation', () => {
  it('should require jobTitle', () => {
    const state = { jobTitle: '', industry: 'IT', level: 'FRESHER', templateId: 1 };
    expect(validateStepInfo(state)).toBe(false);
  });
  
  it('should accept valid jobTitle', () => {
    const state = { jobTitle: 'Software Engineer', industry: 'IT', level: 'FRESHER', templateId: 1 };
    expect(validateStepInfo(state)).toBe(true);
  });
  
  it('should reject whitespace-only jobTitle', () => {
    const state = { jobTitle: '   ', industry: 'IT', level: 'FRESHER', templateId: 1 };
    expect(validateStepInfo(state)).toBe(false);
  });
});
```

**Backend Unit Tests** (Jest):

```typescript
// Example: DTO validation
describe('GenerateCVDto Validation', () => {
  it('should reject empty experiences array', async () => {
    const dto = new GenerateCVDto();
    dto.experiences = [];
    
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('experiences');
  });
  
  it('should reject invalid date format', async () => {
    const dto = new GenerateCVDto();
    dto.experiences = [{
      startDate: '2024-01-15', // Wrong format
      // ... other fields
    }];
    
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'startDate')).toBe(true);
  });
});
```

### 8.3 Property-Based Tests

**Library**: fast-check (TypeScript property-based testing)

**Configuration**:
```typescript
import * as fc from 'fast-check';

const propertyTestConfig = {
  numRuns: 100, // Run each property 100 times
  seed: 42, // Reproducible tests
  verbose: true,
};
```

**Example Property Tests**:

```typescript
// Property 1: File Upload Validation
describe('Property: File Upload Validation', () => {
  it('should correctly validate file type and size', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string(),
          size: fc.integer({ min: 0, max: 10 * 1024 * 1024 }),
          type: fc.constantFrom(
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'text/plain'
          ),
        }),
        (file) => {
          const result = validateFile(file);
          const isPDF = file.type === 'application/pdf';
          const isDOCX = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          const isUnder5MB = file.size <= 5 * 1024 * 1024;
          
          const shouldAccept = (isPDF || isDOCX) && isUnder5MB;
          expect(result.valid).toBe(shouldAccept);
        }
      ),
      propertyTestConfig
    );
  });
});

// Property 4: Skills Grouping
describe('Property: Skills Grouping', () => {
  it('should correctly group skills without loss or duplication', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }),
            category: fc.constantFrom('hard', 'soft', 'language'),
            level: fc.constantFrom('basic', 'intermediate', 'advanced'),
          }),
          { minLength: 0, maxLength: 50 }
        ),
        (skills) => {
          const grouped = groupSkills(skills);
          
          // All skills present
          const totalGrouped = 
            grouped.hard.length + 
            grouped.soft.length + 
            grouped.languages.length;
          expect(totalGrouped).toBe(skills.length);
          
          // No duplicates
          const allGroupedSkills = [
            ...grouped.hard,
            ...grouped.soft,
            ...grouped.languages
          ];
          const uniqueSkills = new Set(allGroupedSkills.map(s => s.name));
          expect(uniqueSkills.size).toBe(skills.length);
          
          // Correct categories
          grouped.hard.forEach(s => expect(s.category).toBe('hard'));
          grouped.soft.forEach(s => expect(s.category).toBe('soft'));
          grouped.languages.forEach(s => expect(s.category).toBe('language'));
        }
      ),
      propertyTestConfig
    );
  });
});

// Property 6: Input Sanitization
describe('Property: Input Sanitization', () => {
  it('should remove dangerous content while preserving safe text', () => {
    fc.assert(
      fc.property(
        fc.string(),
        (input) => {
          const sanitized = sanitizeInput(input);
          
          // No script tags
          expect(sanitized).not.toMatch(/<script/i);
          expect(sanitized).not.toMatch(/<\/script>/i);
          
          // No event handlers
          expect(sanitized).not.toMatch(/on\w+\s*=/i);
          
          // No SQL injection patterns
          expect(sanitized).not.toMatch(/;\s*drop\s+table/i);
          expect(sanitized).not.toMatch(/union\s+select/i);
        }
      ),
      propertyTestConfig
    );
  });
});
```

**Property Test Tags**:
Each property test must include a comment referencing the design property:

```typescript
/**
 * Feature: ai-cv-builder, Property 4: Skills Grouping
 * For any array of skills with category labels, the grouping function SHALL 
 * correctly separate skills into exactly three groups (hard, soft, language) 
 * with no skills lost or duplicated.
 */
describe('Property: Skills Grouping', () => {
  // ... test implementation
});
```

### 8.4 Integration Tests

**Backend Integration Tests**:

```typescript
describe('POST /api/cv/generate (Integration)', () => {
  let app: INestApplication;
  let authToken: string;
  
  beforeAll(async () => {
    // Setup test app with mocked OpenAI
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AIService)
      .useValue(mockAIService)
      .compile();
    
    app = moduleRef.createNestApplication();
    await app.init();
    
    // Get auth token
    authToken = await getTestAuthToken(app);
  });
  
  it('should generate CV with valid input', async () => {
    const validInput = {
      industry: 'IT',
      jobTitle: 'Software Engineer',
      level: 'FRESHER',
      templateId: 1,
      experiences: [/* ... */],
      skills: [/* ... */],
      strengths: ['Leadership'],
    };
    
    const response = await request(app.getHttpServer())
      .post('/api/cv/generate')
      .set('Authorization', `Bearer ${authToken}`)
      .send(validInput)
      .expect(200);
    
    expect(response.body).toHaveProperty('summary');
    expect(response.body).toHaveProperty('experiences');
    expect(response.body).toHaveProperty('skills');
    expect(response.body).toHaveProperty('metadata');
  });
  
  it('should return 400 for invalid input', async () => {
    const invalidInput = {
      industry: 'IT',
      // Missing required fields
    };
    
    await request(app.getHttpServer())
      .post('/api/cv/generate')
      .set('Authorization', `Bearer ${authToken}`)
      .send(invalidInput)
      .expect(400);
  });
  
  it('should return 429 when rate limit exceeded', async () => {
    // Make 11 requests (limit is 10/minute)
    for (let i = 0; i < 11; i++) {
      const response = await request(app.getHttpServer())
        .post('/api/cv/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validInput);
      
      if (i < 10) {
        expect(response.status).toBe(200);
      } else {
        expect(response.status).toBe(429);
      }
    }
  });
});
```

### 8.5 E2E Tests

**Frontend E2E Tests** (Playwright):

```typescript
test('complete CV generation flow', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Navigate to CV builder
  await page.goto('/cv-builder/ai');
  
  // Step 1: Info
  await page.click('[data-industry="IT"]');
  await page.fill('[name="jobTitle"]', 'Software Engineer');
  await page.click('[data-level="FRESHER"]');
  await page.click('[data-template="1"]');
  await page.click('button:has-text("Next")');
  
  // Step 2: Experience
  await page.fill('[name="company"]', 'Tech Corp');
  await page.fill('[name="position"]', 'Junior Developer');
  await page.fill('[name="startDate"]', '01/2023');
  await page.check('[name="isCurrently"]');
  await page.fill('[name="description"]', 'Developed web applications');
  await page.click('button:has-text("Next")');
  
  // Step 3: Skills
  await page.fill('[name="skillInput"]', 'JavaScript');
  await page.press('[name="skillInput"]', 'Enter');
  await page.fill('[name="skillInput"]', 'React');
  await page.press('[name="skillInput"]', 'Enter');
  await page.fill('[name="skillInput"]', 'Node.js');
  await page.press('[name="skillInput"]', 'Enter');
  await page.click('button:has-text("Generate CV")');
  
  // Wait for generation
  await page.waitForSelector('[data-testid="loading"]');
  await page.waitForSelector('[data-testid="cv-preview"]', { timeout: 15000 });
  
  // Verify preview
  await expect(page.locator('[data-testid="cv-summary"]')).toBeVisible();
  await expect(page.locator('[data-testid="cv-experience"]')).toBeVisible();
  await expect(page.locator('[data-testid="cv-skills"]')).toBeVisible();
});
```

### 8.6 Test Coverage Goals

**Coverage Targets**:
- Unit Tests: 80% code coverage
- Property Tests: All 10 properties implemented
- Integration Tests: All API endpoints covered
- E2E Tests: Critical user flows covered

**Coverage by Component**:
- Frontend Components: 80% line coverage
- Backend Services: 90% line coverage
- DTOs and Validators: 100% coverage
- Error Handlers: 100% coverage

---

## 9. Security Considerations

### 9.1 Authentication and Authorization

**JWT Authentication**:
- All API endpoints require valid JWT token
- Token expiration: 24 hours
- Refresh token mechanism for extended sessions
- Token stored in httpOnly cookie (not localStorage)

**Role-Based Access Control**:
```typescript
@Controller('cv')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CVController {
  @Post('generate')
  @Roles(Role.CANDIDATE) // Only candidates can generate CVs
  async generateCV(@Request() req, @Body() dto: GenerateCVDto) {
    // ...
  }
}
```

**Authorization Checks**:
- Verify user is authenticated
- Verify user has CANDIDATE role
- Verify user owns the data they're accessing

### 9.2 Input Validation and Sanitization

**Validation Layers**:

1. **Frontend Validation** (First line of defense):
   - Type checking with TypeScript
   - Form validation with react-hook-form
   - Client-side length limits
   - Format validation (dates, emails)

2. **Backend Validation** (Authoritative):
   - class-validator decorators on DTOs
   - Custom validators for complex rules
   - Whitelist validation (strip unknown properties)

3. **Sanitization** (Before processing):
   - HTML entity encoding
   - Script tag removal
   - SQL injection pattern detection
   - XSS prevention

**Sanitization Implementation**:
```typescript
import * as sanitizeHtml from 'sanitize-html';

export function sanitizeInput(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [], // No HTML tags allowed
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
  });
}

export function sanitizeDTO(dto: any): any {
  if (typeof dto === 'string') {
    return sanitizeInput(dto);
  }
  if (Array.isArray(dto)) {
    return dto.map(sanitizeDTO);
  }
  if (typeof dto === 'object' && dto !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(dto)) {
      sanitized[key] = sanitizeDTO(value);
    }
    return sanitized;
  }
  return dto;
}
```

### 9.3 API Security

**Rate Limiting**:
```typescript
// Per-user rate limit
const userRateLimit = {
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
};

// Global rate limit
const globalRateLimit = {
  windowMs: 60 * 1000,
  max: 100, // 100 requests per minute globally
};
```

**CORS Configuration**:
```typescript
const corsOptions = {
  origin: process.env.FRONTEND_URL, // Only allow frontend domain
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
```

**Request Size Limits**:
```typescript
app.use(express.json({ limit: '1mb' })); // Limit request body size
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
```

### 9.4 OpenAI API Key Security

**Environment Variables**:
```bash
# .env (never commit to git)
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-...
```

**Key Rotation**:
- Rotate API keys every 90 days
- Use separate keys for dev/staging/production
- Monitor key usage for anomalies

**Key Access Control**:
- Store keys in environment variables only
- Never log API keys
- Never send keys to frontend
- Use secret management service (AWS Secrets Manager, HashiCorp Vault)

### 9.5 Data Privacy

**PII Handling**:
- User data (name, email, phone) is already in database
- CV content is NOT stored in database (per requirements)
- Generated content is ephemeral (displayed only)
- No PII sent to OpenAI (only job descriptions, skills)

**Data Minimization**:
- Only send necessary data to OpenAI
- Don't include user identifiers in prompts
- Don't include sensitive personal information

**Logging Privacy**:
```typescript
// DON'T log sensitive data
logger.info('Generating CV', {
  userId: user.id, // OK
  email: user.email, // AVOID
  cvContent: generatedCV, // AVOID
});

// DO log metadata only
logger.info('CV generated successfully', {
  userId: user.id,
  model: 'gpt-3.5-turbo',
  tokensUsed: 1500,
  duration: 3200,
});
```

### 9.6 Dependency Security

**Package Auditing**:
```bash
# Run regularly
npm audit
npm audit fix

# Check for vulnerabilities
npm outdated
```

**Dependency Management**:
- Use exact versions in package.json (no ^ or ~)
- Review dependencies before adding
- Keep dependencies up to date
- Use Dependabot for automated updates

**Known Vulnerabilities**:
- Monitor CVE databases
- Subscribe to security advisories
- Patch critical vulnerabilities immediately

### 9.7 Security Headers

**HTTP Security Headers**:
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // For Next.js
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", process.env.API_URL],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
}));
```

### 9.8 Secure Communication

**HTTPS Only**:
- All communication over HTTPS
- Redirect HTTP to HTTPS
- HSTS header enabled

**Certificate Management**:
- Use valid SSL/TLS certificates
- Auto-renewal with Let's Encrypt
- Monitor certificate expiration

### 9.9 Security Monitoring

**Logging and Alerting**:
- Log all authentication attempts
- Log all authorization failures
- Log all rate limit violations
- Alert on suspicious patterns

**Metrics to Monitor**:
- Failed login attempts per user
- Rate limit violations per user
- API error rates
- Unusual traffic patterns
- OpenAI API key usage

**Incident Response**:
1. Detect: Automated alerts for security events
2. Respond: Investigate and contain
3. Recover: Restore normal operations
4. Learn: Post-mortem and improvements

---

## 10. Performance Optimization

### 10.1 Performance Requirements

**Target Metrics** (from NFR):
- AI generation time: < 10 seconds (p95)
- Page load time: < 2 seconds
- API response time: < 500ms (excluding AI call)
- Support 100 concurrent users

### 10.2 Frontend Performance

#### 10.2.1 Code Splitting

**Next.js Automatic Code Splitting**:
```typescript
// Lazy load heavy components
const CVPreview = dynamic(() => import('./components/CVPreview'), {
  loading: () => <LoadingSkeleton />,
  ssr: false, // Don't render on server
});

// Lazy load wizard steps
const StepExperience = dynamic(() => import('./components/StepExperience'));
const StepSkills = dynamic(() => import('./components/StepSkills'));
```

**Bundle Size Optimization**:
- Tree shaking to remove unused code
- Minimize third-party dependencies
- Use lightweight alternatives (date-fns instead of moment.js)

#### 10.2.2 Asset Optimization

**Image Optimization**:
```typescript
import Image from 'next/image';

<Image
  src="/template-1.png"
  width={300}
  height={400}
  alt="CV Template 1"
  loading="lazy"
  placeholder="blur"
/>
```

**Font Optimization**:
```typescript
// next.config.js
module.exports = {
  optimizeFonts: true,
  // Use system fonts as fallback
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
  },
};
```

#### 10.2.3 State Management Optimization

**Memoization**:
```typescript
// Memoize expensive computations
const validationErrors = useMemo(() => {
  return validateWizardState(wizardState);
}, [wizardState]);

// Memoize callbacks
const handleStepChange = useCallback((step: number) => {
  setCurrentStep(step);
}, []);
```

**Debouncing**:
```typescript
// Debounce localStorage saves
const debouncedSave = useMemo(
  () => debounce((state) => {
    localStorage.setItem('cv-builder-state', JSON.stringify(state));
  }, 500),
  []
);
```

#### 10.2.4 Rendering Optimization

**Virtual Scrolling** (for long lists):
```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={400}
  itemCount={skills.length}
  itemSize={50}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <SkillItem skill={skills[index]} />
    </div>
  )}
</FixedSizeList>
```

### 10.3 Backend Performance

#### 10.3.1 OpenAI API Optimization

**Parallel Requests** (when possible):
```typescript
async generateCVContent(input: GenerateCVDto): Promise<GeneratedCVDto> {
  // Generate summary and job descriptions in parallel
  const [summary, ...experienceDescriptions] = await Promise.all([
    this.generateSummary(input),
    ...input.experiences.map(exp => this.generateJobDescription(exp)),
  ]);
  
  return {
    summary,
    experiences: experienceDescriptions,
    // ...
  };
}
```

**Token Optimization**:
- Use GPT-3.5-turbo (faster, cheaper) instead of GPT-4
- Set max_tokens to limit response length
- Compress prompts without losing context
- Cache common responses (future enhancement)

**Streaming Responses** (future enhancement):
```typescript
// Stream AI responses to frontend
async generateCVStream(input: GenerateCVDto): AsyncGenerator<string> {
  const stream = await this.openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: this.buildPrompt(input),
    stream: true,
  });
  
  for await (const chunk of stream) {
    yield chunk.choices[0]?.delta?.content || '';
  }
}
```

#### 10.3.2 Database Optimization

**Note**: Generated CV content is NOT stored in database per requirements. This section applies if user chooses to save CV metadata.

**Indexing**:
```sql
-- Index on candidateId for fast lookups
CREATE INDEX idx_cvs_candidate_id ON cvs(candidate_id);

-- Index on createdAt for sorting
CREATE INDEX idx_cvs_created_at ON cvs(created_at DESC);

-- Composite index for common queries
CREATE INDEX idx_cvs_candidate_created ON cvs(candidate_id, created_at DESC);
```

**Query Optimization**:
```typescript
// Use select to fetch only needed fields
const cvs = await this.prisma.cV.findMany({
  where: { candidateId, deletedAt: null },
  select: {
    id: true,
    title: true,
    cvUrl: true,
    cvType: true,
    createdAt: true,
    // Don't fetch cvData (large JSON field)
  },
  orderBy: { createdAt: 'desc' },
  take: 10, // Limit results
});
```

#### 10.3.3 Caching Strategy

**Response Caching** (future enhancement):
```typescript
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@Controller('cv')
@UseInterceptors(CacheInterceptor)
export class CVController {
  @Get('templates')
  @CacheTTL(3600) // Cache for 1 hour
  async getTemplates() {
    return this.cvService.getTemplates();
  }
}
```

**OpenAI Response Caching** (future enhancement):
```typescript
// Cache common prompts and responses
const cacheKey = `cv:${hash(input)}`;
const cached = await this.cache.get(cacheKey);

if (cached) {
  return cached;
}

const generated = await this.openai.generate(input);
await this.cache.set(cacheKey, generated, 3600); // 1 hour TTL

return generated;
```

#### 10.3.4 Connection Pooling

**Database Connection Pool**:
```typescript
// Prisma automatically manages connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pool settings
  log: ['query', 'error', 'warn'],
});
```

**HTTP Connection Reuse**:
```typescript
// OpenAI client reuses connections
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 3,
  timeout: 30000,
  // Connection pooling handled by fetch API
});
```

### 10.4 Network Performance

#### 10.4.1 Compression

**Response Compression**:
```typescript
import compression from 'compression';

app.use(compression({
  level: 6, // Compression level (0-9)
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
}));
```

#### 10.4.2 CDN (future enhancement)

**Static Asset Delivery**:
- Serve static assets (images, fonts, CSS) from CDN
- Use CloudFront or Cloudflare
- Enable edge caching
- Reduce latency for global users

### 10.5 Monitoring and Profiling

**Performance Metrics**:
```typescript
// Track API response times
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const request = context.switchToHttp().getRequest();
    
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        logger.info('Request completed', {
          method: request.method,
          url: request.url,
          duration,
        });
        
        // Alert if slow
        if (duration > 5000) {
          logger.warn('Slow request detected', {
            method: request.method,
            url: request.url,
            duration,
          });
        }
      }),
    );
  }
}
```

**Key Metrics to Monitor**:
- API response time (p50, p95, p99)
- OpenAI API latency
- Database query time
- Frontend page load time
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)

**Performance Budgets**:
- JavaScript bundle: < 200KB (gzipped)
- CSS bundle: < 50KB (gzipped)
- Total page weight: < 1MB
- API response time: < 500ms (excluding AI)
- AI generation time: < 10s (p95)

---

## 11. Deployment and Infrastructure

### 11.1 Deployment Architecture

```mermaid
graph TB
    subgraph "Production Environment"
        LB[Load Balancer]
        FE1[Frontend Instance 1]
        FE2[Frontend Instance 2]
        BE1[Backend Instance 1]
        BE2[Backend Instance 2]
        DB[(PostgreSQL)]
        Redis[(Redis Cache)]
        
        LB --> FE1
        LB --> FE2
        FE1 --> BE1
        FE1 --> BE2
        FE2 --> BE1
        FE2 --> BE2
        BE1 --> DB
        BE2 --> DB
        BE1 --> Redis
        BE2 --> Redis
    end
    
    subgraph "External Services"
        OpenAI[OpenAI API]
        BE1 --> OpenAI
        BE2 --> OpenAI
    end
    
    subgraph "Monitoring"
        Logs[CloudWatch Logs]
        Metrics[CloudWatch Metrics]
        Alerts[SNS Alerts]
        
        BE1 --> Logs
        BE2 --> Logs
        Logs --> Metrics
        Metrics --> Alerts
    end
```

### 11.2 Environment Configuration

**Environment Variables**:
```bash
# Backend .env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=...
JWT_EXPIRES_IN=24h
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-...
OPENAI_MODEL=gpt-3.5-turbo
FRONTEND_URL=https://app.example.com
REDIS_URL=redis://localhost:6379

# Frontend .env
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_ENV=production
```

### 11.3 CI/CD Pipeline

**GitHub Actions Workflow**:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run test:e2e

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to AWS
        run: |
          # Build Docker image
          docker build -t backend:latest ./backend
          # Push to ECR
          # Deploy to ECS
          
  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: |
          npm run build
          vercel --prod
```

### 11.4 Scaling Strategy

**Horizontal Scaling**:
- Frontend: Auto-scale based on CPU/memory
- Backend: Auto-scale based on request rate
- Database: Read replicas for read-heavy workloads

**Vertical Scaling**:
- Increase instance size during peak hours
- Use reserved instances for cost savings

**Auto-Scaling Rules**:
```yaml
# Backend auto-scaling
min_instances: 2
max_instances: 10
target_cpu: 70%
target_memory: 80%
scale_up_cooldown: 300s
scale_down_cooldown: 600s
```

### 11.5 Disaster Recovery

**Backup Strategy**:
- Database: Daily automated backups, 30-day retention
- Logs: 90-day retention in CloudWatch
- Configuration: Version controlled in Git

**Recovery Procedures**:
1. Database failure: Restore from latest backup
2. Service outage: Failover to standby region
3. Data corruption: Point-in-time recovery

**RTO/RPO**:
- Recovery Time Objective (RTO): 1 hour
- Recovery Point Objective (RPO): 24 hours

---

## 12. Future Enhancements

### 12.1 Phase 2 Features

**Real-time AI Suggestions**:
- AI suggests improvements as user types
- Inline suggestions for job descriptions
- Grammar and spelling corrections

**CV Parsing**:
- Upload existing CV (PDF/DOCX)
- Extract data using AI
- Pre-fill wizard with extracted data

**LinkedIn Import**:
- OAuth integration with LinkedIn
- Import profile data
- Sync work experience and skills

### 12.2 Phase 3 Features

**Multi-language Support**:
- Vietnamese and English CVs
- Language-specific templates
- Localized AI prompts

**CV Analytics**:
- Track CV views and downloads
- A/B test different templates
- Optimize based on user feedback

**ATS Optimization Score**:
- Analyze CV for ATS compatibility
- Suggest improvements
- Keyword optimization

### 12.3 Technical Improvements

**Caching Layer**:
- Redis for OpenAI response caching
- Reduce API costs
- Improve response times

**Streaming Responses**:
- Stream AI-generated content to frontend
- Show content as it's generated
- Better user experience

**Advanced Prompt Engineering**:
- Few-shot learning with examples
- Fine-tuned models for CV generation
- Industry-specific prompts

**Observability**:
- Distributed tracing with OpenTelemetry
- Real-time dashboards
- Advanced analytics

---

## 13. Appendix

### 13.1 API Endpoint Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/cv/generate | JWT | Generate CV content using AI |
| GET | /api/cv/templates | JWT | Get available CV templates |
| POST | /api/cv | JWT | Save CV metadata (optional) |
| GET | /api/cv | JWT | Get user's CVs |
| GET | /api/cv/:id | JWT | Get specific CV |
| DELETE | /api/cv/:id | JWT | Delete CV |

### 13.2 Technology Stack

**Frontend**:
- Next.js 14
- React 18
- TypeScript 5
- Tailwind CSS
- React Hook Form
- Zod (validation)
- fast-check (property testing)

**Backend**:
- NestJS 10
- Prisma 5
- PostgreSQL 15
- OpenAI Node SDK
- class-validator
- Jest (testing)

**Infrastructure**:
- AWS ECS (containers)
- AWS RDS (database)
- AWS CloudWatch (monitoring)
- Vercel (frontend hosting)
- GitHub Actions (CI/CD)

### 13.3 External Dependencies

**NPM Packages**:
```json
{
  "dependencies": {
    "openai": "^4.20.0",
    "sanitize-html": "^2.11.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1"
  },
  "devDependencies": {
    "fast-check": "^3.15.0",
    "@types/sanitize-html": "^2.9.5"
  }
}
```

### 13.4 Glossary

- **ATS**: Applicant Tracking System - Software used by recruiters to filter CVs
- **DTO**: Data Transfer Object - Object that carries data between processes
- **JWT**: JSON Web Token - Authentication token format
- **PBT**: Property-Based Testing - Testing approach using generated inputs
- **Prompt Engineering**: Crafting effective prompts for AI models
- **Token**: Unit of text processed by AI models (~4 characters)
- **Wizard**: Multi-step form interface

### 13.5 References

**OpenAI Documentation**:
- [Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [Best Practices](https://help.openai.com/en/articles/6654000-best-practices-for-prompt-engineering-with-the-openai-api)
- [Rate Limits](https://platform.openai.com/docs/guides/rate-limits)

**Testing Resources**:
- [fast-check Documentation](https://github.com/dubzzz/fast-check)
- [Property-Based Testing Guide](https://github.com/brexhq/prompt-engineering)

**Security Resources**:
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security](https://docs.nestjs.com/security/authentication)

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-11  
**Status**: Ready for Review  
**Author**: AI Design Agent  
**Reviewers**: Development Team, Product Owner

