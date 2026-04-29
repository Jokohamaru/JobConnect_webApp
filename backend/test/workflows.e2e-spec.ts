import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { CustomExceptionFilter } from '../src/common/filters/custom-exception.filter';
import * as bcrypt from 'bcrypt';

/**
 * Integration tests for end-to-end workflows
 * Tests complete user journeys through the application
 * 
 * Task 10.3: Write integration tests for workflows
 * - Test registration → login → profile update flow
 * - Test job creation → job listing → application submission flow
 * - Test application submission → status update → history retrieval flow
 * - Test recruiter dashboard → application review → status change flow
 * 
 * Validates: All requirements
 */
describe('Workflows (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply the same configuration as main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    app.useGlobalFilters(new CustomExceptionFilter());

    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // Close database connections
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prisma.applications.deleteMany();
    await prisma.job_skills.deleteMany();
    await prisma.job_tags.deleteMany();
    await prisma.jobs.deleteMany();
    await prisma.companies.deleteMany();
    await prisma.cvs.deleteMany();
    await prisma.candidate_skills.deleteMany();
    await prisma.candidates.deleteMany();
    await prisma.recruiters.deleteMany();
    await prisma.admins.deleteMany();
    await prisma.users.deleteMany();
    await prisma.skills.deleteMany();
    await prisma.tags.deleteMany();
  });

  /**
   * Workflow 1: Registration → Login → Profile Update
   * 
   * This test verifies the complete user onboarding flow:
   * 1. User registers with role (Candidate)
   * 2. User logs in with credentials
   * 3. User updates their profile information
   * 4. User retrieves updated profile to verify changes
   */
  describe('Workflow 1: Registration → Login → Profile Update', () => {
    it('should complete candidate registration, login, and profile update flow', async () => {
      // Step 1: Register as candidate
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'candidate@example.com',
          password: 'Password123',
          full_name: 'John Candidate',
          role: 'CANDIDATE',
        })
        .expect(201);

      expect(registerResponse.body.data).toHaveProperty('id');
      expect(registerResponse.body.data.email).toBe('candidate@example.com');
      expect(registerResponse.body.data.role).toBe('CANDIDATE');

      // Step 2: Login with credentials
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'candidate@example.com',
          password: 'Password123',
        })
        .expect(200);

      expect(loginResponse.body.data).toHaveProperty('access_token');
      expect(loginResponse.body.data).toHaveProperty('refresh_token');
      expect(loginResponse.body.data.user.email).toBe('candidate@example.com');

      const token = loginResponse.body.data.access_token;

      // Step 3: Update candidate profile
      const updateResponse = await request(app.getHttpServer())
        .patch('/candidates/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          phone_number: '1234567890',
          bio: 'Experienced software developer with 5 years in web development',
          location: 'New York, NY',
        })
        .expect(200);

      expect(updateResponse.body.data.phone_number).toBe('1234567890');
      expect(updateResponse.body.data.bio).toContain('software developer');
      expect(updateResponse.body.data.location).toBe('New York, NY');

      // Step 4: Retrieve profile to verify changes persisted
      const profileResponse = await request(app.getHttpServer())
        .get('/candidates/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(profileResponse.body.data.phone_number).toBe('1234567890');
      expect(profileResponse.body.data.bio).toContain('software developer');
      expect(profileResponse.body.data.location).toBe('New York, NY');
      expect(profileResponse.body.data.users.email).toBe('candidate@example.com');
    });

    it('should complete recruiter registration, login, and profile update flow', async () => {
      // Step 1: Register as recruiter
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'recruiter@example.com',
          password: 'Password123',
          full_name: 'Jane Recruiter',
          role: 'RECRUITER',
        })
        .expect(201);

      expect(registerResponse.body.data.role).toBe('RECRUITER');

      // Step 2: Login
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'recruiter@example.com',
          password: 'Password123',
        })
        .expect(200);

      const token = loginResponse.body.data.access_token;

      // Step 3: Create company profile
      const companyResponse = await request(app.getHttpServer())
        .post('/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Tech Innovations Inc',
          description: 'Leading technology company',
          website: 'https://techinnovations.com',
          industry: 'Technology',
          company_type: 'STARTUP',
          location: 'San Francisco, CA',
        })
        .expect(201);

      expect(companyResponse.body.data.name).toBe('Tech Innovations Inc');
      expect(companyResponse.body.data.industry).toBe('Technology');

      // Step 4: Retrieve recruiter profile with company
      const profileResponse = await request(app.getHttpServer())
        .get('/recruiters/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(profileResponse.body.data).toBeDefined();
      expect(profileResponse.body.data.companies).toBeDefined();
      expect(profileResponse.body.data.companies.name).toBe('Tech Innovations Inc');
    });
  });

  /**
   * Workflow 2: Job Creation → Job Listing → Application Submission
   * 
   * This test verifies the job posting and application flow:
   * 1. Recruiter creates a job posting with skills
   * 2. Job appears in public job listings
   * 3. Candidate searches/filters jobs
   * 4. Candidate submits application with CV
   */
  describe('Workflow 2: Job Creation → Job Listing → Application Submission', () => {
    it('should complete job creation, listing, and application submission flow', async () => {
      // Setup: Create recruiter with company
      const recruiterRegister = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'recruiter@example.com',
          password: 'Password123',
          full_name: 'Jane Recruiter',
          role: 'RECRUITER',
        })
        .expect(201);

      const recruiterLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'recruiter@example.com',
          password: 'Password123',
        })
        .expect(200);

      const recruiterToken = recruiterLogin.body.data.access_token;

      const company = await request(app.getHttpServer())
        .post('/companies')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          name: 'Tech Corp',
          description: 'Technology company',
          industry: 'Technology',
          company_type: 'STARTUP',
          location: 'San Francisco',
        })
        .expect(201);

      // Create skills for the job
      const skill1 = await prisma.skills.create({
        data: { 
          id: `skill-${Date.now()}-1`,
          name: 'JavaScript' 
        },
      });
      const skill2 = await prisma.skills.create({
        data: { 
          id: `skill-${Date.now()}-2`,
          name: 'React' 
        },
      });
      const skill3 = await prisma.skills.create({
        data: { 
          id: `skill-${Date.now()}-3`,
          name: 'Node.js' 
        },
      });

      // Step 1: Recruiter creates job posting
      const jobResponse = await request(app.getHttpServer())
        .post('/jobs')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          title: 'Senior Full Stack Developer',
          description: 'We are looking for an experienced full stack developer to join our team. Must have strong JavaScript skills.',
          location: 'San Francisco',
          salary_min: 120000,
          salary_max: 180000,
          job_type: 'Full-time',
          skill_ids: [skill1.id, skill2.id, skill3.id],
        })
        .expect(201);

      expect(jobResponse.body.data.title).toBe('Senior Full Stack Developer');
      expect(jobResponse.body.data.status).toBe('ACTIVE');
      const jobId = jobResponse.body.data.id;

      // Step 2: Job appears in public listings (need auth token due to guard)
      const listResponse = await request(app.getHttpServer())
        .get('/jobs')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .expect(200);

      expect(listResponse.body.data.length).toBeGreaterThan(0);
      const listedJob = listResponse.body.data.find((j: any) => j.id === jobId);
      expect(listedJob).toBeDefined();
      expect(listedJob.title).toBe('Senior Full Stack Developer');

      // Step 3: Filter jobs by location
      const filterResponse = await request(app.getHttpServer())
        .get('/jobs')
        .query({ city: 'San Francisco' })
        .set('Authorization', `Bearer ${recruiterToken}`)
        .expect(200);

      expect(filterResponse.body.data.length).toBeGreaterThan(0);
      expect(filterResponse.body.data[0].location).toBe('San Francisco');

      // Setup: Create candidate with CV
      const candidateRegister = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'candidate@example.com',
          password: 'Password123',
          full_name: 'John Candidate',
          role: 'CANDIDATE',
        })
        .expect(201);

      const candidateLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'candidate@example.com',
          password: 'Password123',
        })
        .expect(200);

      const candidateToken = candidateLogin.body.data.access_token;

      // Get candidate ID
      const candidateUser = await prisma.users.findUnique({
        where: { email: 'candidate@example.com' },
      });
      const candidate = await prisma.candidates.findUnique({
        where: { user_id: candidateUser.id },
      });

      // Create CV
      const cv = await prisma.cvs.create({
        data: {
          id: `cv-${Date.now()}-2`,
          candidate_id: candidate.id,
          file_name: 'resume.pdf',
          file_path: '/uploads/resume.pdf',
          is_default: true,
          updated_at: new Date(),
        },
      });

      // Step 4: Candidate submits application
      const applicationResponse = await request(app.getHttpServer())
        .post('/applications')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          job_id: jobId,
          cv_id: cv.id,
        })
        .expect(201);

      expect(applicationResponse.body.data.status).toBe('APPLIED');
      expect(applicationResponse.body.data.job_id).toBe(jobId);
      expect(applicationResponse.body.data.cv_id).toBe(cv.id);
    });
  });

  /**
   * Workflow 3: Application Submission → Status Update → History Retrieval
   * 
   * This test verifies the application lifecycle:
   * 1. Candidate submits application
   * 2. Application appears in candidate's history
   * 3. Recruiter updates application status
   * 4. Updated status appears in candidate's history
   */
  describe('Workflow 3: Application Submission → Status Update → History Retrieval', () => {
    it('should complete application submission, status update, and history retrieval flow', async () => {
      // Setup: Create recruiter with company and job
      const recruiterUser = await prisma.users.create({
        data: {
          id: `user-${Date.now()}-recruiter`,
          email: 'recruiter@example.com',
          full_name: 'Jane Recruiter',
          password_hash: await bcrypt.hash('Password123', 10),
          role: 'RECRUITER',
          updated_at: new Date(),
        },
      });

      const recruiter = await prisma.recruiters.create({
        data: {
          id: `rec-${Date.now()}`,
          user_id: recruiterUser.id,
          updated_at: new Date(),
        },
      });

      const company = await prisma.companies.create({
        data: {
          id: `company-${Date.now()}`,
          name: 'Tech Corp',
          industry: 'Technology',
          company_type: 'STARTUP',
          location: 'San Francisco',
          recruiter_id: recruiter.id,
          updated_at: new Date(),
        },
      });

      const job = await prisma.jobs.create({
        data: {
          id: `job-${Date.now()}`,
          company_id: company.id,
          title: 'Software Engineer',
          description: 'Great opportunity',
          location: 'San Francisco',
          job_type: 'Full-time',
          status: 'ACTIVE',
          updated_at: new Date(),
        },
      });

      // Setup: Create candidate with CV
      const candidateRegister = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'candidate@example.com',
          password: 'Password123',
          full_name: 'John Candidate',
          role: 'CANDIDATE',
        })
        .expect(201);

      const candidateLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'candidate@example.com',
          password: 'Password123',
        })
        .expect(200);

      const candidateToken = candidateLogin.body.data.access_token;

      const candidateUser = await prisma.users.findUnique({
        where: { email: 'candidate@example.com' },
      });
      const candidate = await prisma.candidates.findUnique({
        where: { user_id: candidateUser.id },
      });

      const cv = await prisma.cvs.create({
        data: {
          id: `cv-${Date.now()}-1`,
          candidate_id: candidate.id,
          file_name: 'resume.pdf',
          file_path: '/uploads/resume.pdf',
          is_default: true,
          updated_at: new Date(),
        },
      });

      // Step 1: Candidate submits application
      const applicationResponse = await request(app.getHttpServer())
        .post('/applications')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          job_id: job.id,
          cv_id: cv.id,
        })
        .expect(201);

      expect(applicationResponse.body.data.status).toBe('APPLIED');
      const applicationId = applicationResponse.body.data.id;

      // Step 2: Application appears in candidate's history
      const historyResponse1 = await request(app.getHttpServer())
        .get('/applications')
        .set('Authorization', `Bearer ${candidateToken}`)
        .expect(200);

      expect(historyResponse1.body.data.length).toBe(1);
      expect(historyResponse1.body.data[0].id).toBe(applicationId);
      expect(historyResponse1.body.data[0].status).toBe('APPLIED');
      expect(historyResponse1.body.data[0].jobs).toBeDefined();
      expect(historyResponse1.body.data[0].jobs.title).toBe('Software Engineer');

      // Login as recruiter
      const recruiterLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'recruiter@example.com',
          password: 'Password123',
        })
        .expect(200);

      const recruiterToken = recruiterLogin.body.data.access_token;

      // Step 3: Recruiter updates application status to REVIEWING
      const updateResponse1 = await request(app.getHttpServer())
        .patch(`/applications/${applicationId}/status`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          status: 'REVIEWING',
        })
        .expect(200);

      expect(updateResponse1.body.data.status).toBe('REVIEWING');

      // Step 4: Updated status appears in candidate's history
      const historyResponse2 = await request(app.getHttpServer())
        .get('/applications')
        .set('Authorization', `Bearer ${candidateToken}`)
        .expect(200);

      expect(historyResponse2.body.data[0].status).toBe('REVIEWING');

      // Step 5: Recruiter updates status to ACCEPTED
      const updateResponse2 = await request(app.getHttpServer())
        .patch(`/applications/${applicationId}/status`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          status: 'ACCEPTED',
        })
        .expect(200);

      expect(updateResponse2.body.data.status).toBe('ACCEPTED');

      // Step 6: Final status appears in candidate's history
      const historyResponse3 = await request(app.getHttpServer())
        .get('/applications')
        .set('Authorization', `Bearer ${candidateToken}`)
        .expect(200);

      expect(historyResponse3.body.data[0].status).toBe('ACCEPTED');

      // Step 7: Filter history by status
      const filteredHistory = await request(app.getHttpServer())
        .get('/applications')
        .query({ status: 'ACCEPTED' })
        .set('Authorization', `Bearer ${candidateToken}`)
        .expect(200);

      expect(filteredHistory.body.data.length).toBe(1);
      expect(filteredHistory.body.data[0].status).toBe('ACCEPTED');
    });
  });

  /**
   * Workflow 4: Recruiter Dashboard → Application Review → Status Change
   * 
   * This test verifies the recruiter's application management flow:
   * 1. Multiple candidates apply to recruiter's jobs
   * 2. Recruiter views all applications in dashboard
   * 3. Recruiter filters applications by job and status
   * 4. Recruiter reviews and changes application statuses
   */
  describe('Workflow 4: Recruiter Dashboard → Application Review → Status Change', () => {
    it('should complete recruiter dashboard, review, and status change flow', async () => {
      // Setup: Create recruiter with company and multiple jobs
      const recruiterUser = await prisma.users.create({
        data: {
          id: `user-${Date.now()}-recruiter-2`,
          email: 'recruiter@example.com',
          full_name: 'Jane Recruiter',
          password_hash: await bcrypt.hash('Password123', 10),
          role: 'RECRUITER',
          updated_at: new Date(),
        },
      });

      const recruiter = await prisma.recruiters.create({
        data: {
          id: `rec-${Date.now()}-2`,
          user_id: recruiterUser.id,
          updated_at: new Date(),
        },
      });

      const company = await prisma.companies.create({
        data: {
          id: `company-${Date.now()}-2`,
          name: 'Tech Corp',
          industry: 'Technology',
          company_type: 'STARTUP',
          location: 'San Francisco',
          recruiter_id: recruiter.id,
          updated_at: new Date(),
        },
      });

      const job1 = await prisma.jobs.create({
        data: {
          id: `job-${Date.now()}-1`,
          company_id: company.id,
          title: 'Senior Developer',
          description: 'Senior position',
          location: 'San Francisco',
          job_type: 'Full-time',
          status: 'ACTIVE',
          updated_at: new Date(),
        },
      });

      const job2 = await prisma.jobs.create({
        data: {
          id: `job-${Date.now()}-2`,
          company_id: company.id,
          title: 'Junior Developer',
          description: 'Junior position',
          location: 'San Francisco',
          job_type: 'Full-time',
          status: 'ACTIVE',
          updated_at: new Date(),
        },
      });

      // Setup: Create multiple candidates with applications
      const candidate1User = await prisma.users.create({
        data: {
          id: `user-${Date.now()}-candidate-1`,
          email: 'candidate1@example.com',
          full_name: 'John Candidate',
          password_hash: await bcrypt.hash('Password123', 10),
          role: 'CANDIDATE',
          updated_at: new Date(),
        },
      });

      const candidate1 = await prisma.candidates.create({
        data: {
          id: `cand-${Date.now()}-1`,
          user_id: candidate1User.id,
          updated_at: new Date(),
        },
      });

      const cv1 = await prisma.cvs.create({
        data: {
          id: `cv-${Date.now()}-1`,
          candidate_id: candidate1.id,
          file_name: 'resume1.pdf',
          file_path: '/uploads/resume1.pdf',
          is_default: true,
          updated_at: new Date(),
        },
      });

      const candidate2User = await prisma.users.create({
        data: {
          id: `user-${Date.now()}-candidate-2`,
          email: 'candidate2@example.com',
          full_name: 'Jane Candidate',
          password_hash: await bcrypt.hash('Password123', 10),
          role: 'CANDIDATE',
          updated_at: new Date(),
        },
      });

      const candidate2 = await prisma.candidates.create({
        data: {
          id: `cand-${Date.now()}-2`,
          user_id: candidate2User.id,
          updated_at: new Date(),
        },
      });

      const cv2 = await prisma.cvs.create({
        data: {
          id: `cv-${Date.now()}-2`,
          candidate_id: candidate2.id,
          file_name: 'resume2.pdf',
          file_path: '/uploads/resume2.pdf',
          is_default: true,
          updated_at: new Date(),
        },
      });

      // Create applications
      const app1 = await prisma.applications.create({
        data: {
          id: `app-${Date.now()}-1`,
          candidate_id: candidate1.id,
          job_id: job1.id,
          cv_id: cv1.id,
          status: 'APPLIED',
          updated_at: new Date(),
        },
      });

      const app2 = await prisma.applications.create({
        data: {
          id: `app-${Date.now()}-2`,
          candidate_id: candidate2.id,
          job_id: job1.id,
          cv_id: cv2.id,
          status: 'APPLIED',
          updated_at: new Date(),
        },
      });

      const app3 = await prisma.applications.create({
        data: {
          id: `app-${Date.now()}-3`,
          candidate_id: candidate1.id,
          job_id: job2.id,
          cv_id: cv1.id,
          status: 'APPLIED',
          updated_at: new Date(),
        },
      });

      // Login as recruiter
      const recruiterLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'recruiter@example.com',
          password: 'Password123',
        })
        .expect(200);

      const recruiterToken = recruiterLogin.body.data.access_token;

      // Step 1: Recruiter views all applications in dashboard
      const dashboardResponse = await request(app.getHttpServer())
        .get('/applications')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .expect(200);

      expect(dashboardResponse.body.data.length).toBe(3);
      expect(dashboardResponse.body.data.every((app: any) => app.status === 'APPLIED')).toBe(true);

      // Step 2: Filter applications by specific job
      const job1AppsResponse = await request(app.getHttpServer())
        .get('/applications')
        .query({ job_id: job1.id })
        .set('Authorization', `Bearer ${recruiterToken}`)
        .expect(200);

      expect(job1AppsResponse.body.data.length).toBe(2);
      expect(job1AppsResponse.body.data.every((app: any) => app.job_id === job1.id)).toBe(true);

      // Step 3: Review first application and change status to REVIEWING
      const reviewResponse1 = await request(app.getHttpServer())
        .patch(`/applications/${app1.id}/status`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          status: 'REVIEWING',
        })
        .expect(200);

      expect(reviewResponse1.body.data.status).toBe('REVIEWING');

      // Step 4: Filter by status to see only reviewing applications
      const reviewingAppsResponse = await request(app.getHttpServer())
        .get('/applications')
        .query({ status: 'REVIEWING' })
        .set('Authorization', `Bearer ${recruiterToken}`)
        .expect(200);

      expect(reviewingAppsResponse.body.data.length).toBe(1);
      expect(reviewingAppsResponse.body.data[0].id).toBe(app1.id);
      expect(reviewingAppsResponse.body.data[0].status).toBe('REVIEWING');

      // Step 5: Accept one application
      const acceptResponse = await request(app.getHttpServer())
        .patch(`/applications/${app1.id}/status`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          status: 'ACCEPTED',
        })
        .expect(200);

      expect(acceptResponse.body.data.status).toBe('ACCEPTED');

      // Step 6: Reject another application
      const rejectResponse = await request(app.getHttpServer())
        .patch(`/applications/${app2.id}/status`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          status: 'REJECTED',
        })
        .expect(200);

      expect(rejectResponse.body.data.status).toBe('REJECTED');

      // Step 7: View final dashboard with mixed statuses
      const finalDashboardResponse = await request(app.getHttpServer())
        .get('/applications')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .expect(200);

      expect(finalDashboardResponse.body.data.length).toBe(3);
      
      const statuses = finalDashboardResponse.body.data.map((app: any) => app.status);
      expect(statuses).toContain('ACCEPTED');
      expect(statuses).toContain('REJECTED');
      expect(statuses).toContain('APPLIED');

      // Step 8: Verify accepted applications filter
      const acceptedAppsResponse = await request(app.getHttpServer())
        .get('/applications')
        .query({ status: 'ACCEPTED' })
        .set('Authorization', `Bearer ${recruiterToken}`)
        .expect(200);

      expect(acceptedAppsResponse.body.data.length).toBe(1);
      expect(acceptedAppsResponse.body.data[0].status).toBe('ACCEPTED');
      expect(acceptedAppsResponse.body.data[0].candidates).toBeDefined();
      expect(acceptedAppsResponse.body.data[0].jobs).toBeDefined();
      expect(acceptedAppsResponse.body.data[0].cvs).toBeDefined();
    });
  });
});
