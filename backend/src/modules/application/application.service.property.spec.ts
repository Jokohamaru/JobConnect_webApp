import { Test, TestingModule } from '@nestjs/testing';
import * as fc from 'fast-check';
import { ApplicationService } from './application.service';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationStatus } from '@prisma/client';
import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';

/**
 * Property-Based Tests for Application Service
 * 
 * **Validates: Requirements 8.7, 10.1-10.5**
 * 
 * These tests verify application submission properties using fast-check with minimum 100 iterations.
 */
describe('ApplicationService - Property-Based Tests', () => {
  let applicationService: ApplicationService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationService,
        {
          provide: PrismaService,
          useValue: {
            candidates: {
              findUnique: jest.fn(),
            },
            jobs: {
              findUnique: jest.fn(),
            },
            cvs: {
              findUnique: jest.fn(),
            },
            applications: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
              findMany: jest.fn(),
            },
            recruiters: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    applicationService = module.get<ApplicationService>(ApplicationService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 20: Closed Job Prevents Applications
   * 
   * For any Job with status CLOSED, attempting to submit an application SHALL fail
   * with 400 Bad Request error "Job is no longer accepting applications".
   * 
   * **Validates: Requirements 8.7, 10.2**
   */
  describe('Property 20: Closed job prevents applications', () => {
    it('should reject applications to closed jobs (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }), // userId
          fc.string({ minLength: 1, maxLength: 50 }), // jobId
          fc.string({ minLength: 1, maxLength: 50 }), // cvId
          fc.string({ minLength: 1, maxLength: 50 }), // candidateId
          async (userId, jobId, cvId, candidateId) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            // Mock candidate exists
            const mockCandidate = {
              id: candidateId,
              user_id: userId,
              phone_number: null,
              bio: null,
              location: null,
              created_at: new Date(),
              updated_at: new Date(),
            };

            // Mock job with CLOSED status
            const mockJob = {
              id: jobId,
              company_id: 'company-123',
              title: 'Test Job',
              description: 'Test Description',
              location: 'Test Location',
              salary_min: 50000,
              salary_max: 100000,
              job_type: 'FULL_TIME',
              status: 'CLOSED', // Job is CLOSED
              created_at: new Date(),
              updated_at: new Date(),
            };

            jest.spyOn(prismaService.candidates, 'findUnique').mockResolvedValue(mockCandidate);
            jest.spyOn(prismaService.jobs, 'findUnique').mockResolvedValue(mockJob);

            // Attempt to create application
            await expect(
              applicationService.createApplication(userId, {
                job_id: jobId,
                cv_id: cvId,
              }),
            ).rejects.toThrow(BadRequestException);

            await expect(
              applicationService.createApplication(userId, {
                job_id: jobId,
                cv_id: cvId,
              }),
            ).rejects.toThrow('Job is no longer accepting applications');

            // Verify application was not created
            expect(prismaService.applications.create).not.toHaveBeenCalled();
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should accept applications to active jobs (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }), // userId
          fc.string({ minLength: 1, maxLength: 50 }), // jobId
          fc.string({ minLength: 1, maxLength: 50 }), // cvId
          fc.string({ minLength: 1, maxLength: 50 }), // candidateId
          async (userId, jobId, cvId, candidateId) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            // Mock candidate exists
            const mockCandidate = {
              id: candidateId,
              user_id: userId,
              phone_number: null,
              bio: null,
              location: null,
              created_at: new Date(),
              updated_at: new Date(),
            };

            // Mock job with ACTIVE status
            const mockJob = {
              id: jobId,
              company_id: 'company-123',
              title: 'Test Job',
              description: 'Test Description',
              location: 'Test Location',
              salary_min: 50000,
              salary_max: 100000,
              job_type: 'FULL_TIME',
              status: 'ACTIVE', // Job is ACTIVE
              created_at: new Date(),
              updated_at: new Date(),
            };

            // Mock CV exists and belongs to candidate
            const mockCv = {
              id: cvId,
              candidate_id: candidateId,
              file_name: 'test-cv.pdf',
              file_path: '/uploads/test-cv.pdf',
              is_default: false,
              created_at: new Date(),
              updated_at: new Date(),
            };

            // Mock no existing application
            jest.spyOn(prismaService.candidates, 'findUnique').mockResolvedValue(mockCandidate);
            jest.spyOn(prismaService.jobs, 'findUnique').mockResolvedValue(mockJob);
            jest.spyOn(prismaService.cvs, 'findUnique').mockResolvedValue(mockCv);
            jest.spyOn(prismaService.applications, 'findUnique').mockResolvedValue(null);

            // Mock application creation
            const mockApplication = {
              id: 'app-123',
              candidate_id: candidateId,
              job_id: jobId,
              cv_id: cvId,
              status: ApplicationStatus.APPLIED,
              deleted_at: null,
              created_at: new Date(),
              updated_at: new Date(),
              jobs: mockJob,
              cvs: mockCv,
              candidates: {
                ...mockCandidate,
                users: {
                  id: userId,
                  email: 'test@example.com',
                  full_name: 'Test User',
                },
              },
            };

            jest.spyOn(prismaService.applications, 'create').mockResolvedValue(mockApplication);

            // Should not throw
            const result = await applicationService.createApplication(userId, {
              job_id: jobId,
              cv_id: cvId,
            });

            expect(result).toBeDefined();
            expect(prismaService.applications.create).toHaveBeenCalled();
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 21: Duplicate Application Prevention
   * 
   * For any Candidate-Job pair, if an Application already exists, attempting to submit
   * another application for the same pair SHALL fail with 409 Conflict error
   * "You have already applied to this job".
   * 
   * **Validates: Requirements 10.1, 10.3**
   */
  describe('Property 21: Duplicate application prevention', () => {
    it('should reject duplicate applications (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }), // userId
          fc.string({ minLength: 1, maxLength: 50 }), // jobId
          fc.string({ minLength: 1, maxLength: 50 }), // cvId
          fc.string({ minLength: 1, maxLength: 50 }), // candidateId
          async (userId, jobId, cvId, candidateId) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            // Mock candidate exists
            const mockCandidate = {
              id: candidateId,
              user_id: userId,
              phone_number: null,
              bio: null,
              location: null,
              created_at: new Date(),
              updated_at: new Date(),
            };

            // Mock job with ACTIVE status
            const mockJob = {
              id: jobId,
              company_id: 'company-123',
              title: 'Test Job',
              description: 'Test Description',
              location: 'Test Location',
              salary_min: 50000,
              salary_max: 100000,
              job_type: 'FULL_TIME',
              status: 'ACTIVE',
              created_at: new Date(),
              updated_at: new Date(),
            };

            // Mock CV exists and belongs to candidate
            const mockCv = {
              id: cvId,
              candidate_id: candidateId,
              file_name: 'test-cv.pdf',
              file_path: '/uploads/test-cv.pdf',
              is_default: false,
              created_at: new Date(),
              updated_at: new Date(),
            };

            // Mock existing application (duplicate)
            const existingApplication = {
              id: 'existing-app-123',
              candidate_id: candidateId,
              job_id: jobId,
              cv_id: 'some-cv-id',
              status: ApplicationStatus.APPLIED,
              deleted_at: null,
              created_at: new Date(),
              updated_at: new Date(),
            };

            jest.spyOn(prismaService.candidates, 'findUnique').mockResolvedValue(mockCandidate);
            jest.spyOn(prismaService.jobs, 'findUnique').mockResolvedValue(mockJob);
            jest.spyOn(prismaService.cvs, 'findUnique').mockResolvedValue(mockCv);
            jest.spyOn(prismaService.applications, 'findUnique').mockResolvedValue(existingApplication);

            // Attempt to create duplicate application
            await expect(
              applicationService.createApplication(userId, {
                job_id: jobId,
                cv_id: cvId,
              }),
            ).rejects.toThrow(ConflictException);

            await expect(
              applicationService.createApplication(userId, {
                job_id: jobId,
                cv_id: cvId,
              }),
            ).rejects.toThrow('You have already applied to this job');

            // Verify application was not created
            expect(prismaService.applications.create).not.toHaveBeenCalled();
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should allow first application for candidate-job pair (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }), // userId
          fc.string({ minLength: 1, maxLength: 50 }), // jobId
          fc.string({ minLength: 1, maxLength: 50 }), // cvId
          fc.string({ minLength: 1, maxLength: 50 }), // candidateId
          async (userId, jobId, cvId, candidateId) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            // Mock candidate exists
            const mockCandidate = {
              id: candidateId,
              user_id: userId,
              phone_number: null,
              bio: null,
              location: null,
              created_at: new Date(),
              updated_at: new Date(),
            };

            // Mock job with ACTIVE status
            const mockJob = {
              id: jobId,
              company_id: 'company-123',
              title: 'Test Job',
              description: 'Test Description',
              location: 'Test Location',
              salary_min: 50000,
              salary_max: 100000,
              job_type: 'FULL_TIME',
              status: 'ACTIVE',
              created_at: new Date(),
              updated_at: new Date(),
            };

            // Mock CV exists and belongs to candidate
            const mockCv = {
              id: cvId,
              candidate_id: candidateId,
              file_name: 'test-cv.pdf',
              file_path: '/uploads/test-cv.pdf',
              is_default: false,
              created_at: new Date(),
              updated_at: new Date(),
            };

            // Mock no existing application
            jest.spyOn(prismaService.candidates, 'findUnique').mockResolvedValue(mockCandidate);
            jest.spyOn(prismaService.jobs, 'findUnique').mockResolvedValue(mockJob);
            jest.spyOn(prismaService.cvs, 'findUnique').mockResolvedValue(mockCv);
            jest.spyOn(prismaService.applications, 'findUnique').mockResolvedValue(null);

            // Mock application creation
            const mockApplication = {
              id: 'app-123',
              candidate_id: candidateId,
              job_id: jobId,
              cv_id: cvId,
              status: ApplicationStatus.APPLIED,
              deleted_at: null,
              created_at: new Date(),
              updated_at: new Date(),
              jobs: mockJob,
              cvs: mockCv,
              candidates: {
                ...mockCandidate,
                users: {
                  id: userId,
                  email: 'test@example.com',
                  full_name: 'Test User',
                },
              },
            };

            jest.spyOn(prismaService.applications, 'create').mockResolvedValue(mockApplication);

            // Should not throw
            const result = await applicationService.createApplication(userId, {
              job_id: jobId,
              cv_id: cvId,
            });

            expect(result).toBeDefined();
            expect(prismaService.applications.create).toHaveBeenCalled();
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 22: Application Creation with APPLIED Status
   * 
   * For any successful application submission, the created Application record
   * SHALL have status APPLIED.
   * 
   * **Validates: Requirements 10.4**
   */
  describe('Property 22: Application creation with APPLIED status', () => {
    it('should create applications with APPLIED status (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }), // userId
          fc.string({ minLength: 1, maxLength: 50 }), // jobId
          fc.string({ minLength: 1, maxLength: 50 }), // cvId
          fc.string({ minLength: 1, maxLength: 50 }), // candidateId
          async (userId, jobId, cvId, candidateId) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            // Mock candidate exists
            const mockCandidate = {
              id: candidateId,
              user_id: userId,
              phone_number: null,
              bio: null,
              location: null,
              created_at: new Date(),
              updated_at: new Date(),
            };

            // Mock job with ACTIVE status
            const mockJob = {
              id: jobId,
              company_id: 'company-123',
              title: 'Test Job',
              description: 'Test Description',
              location: 'Test Location',
              salary_min: 50000,
              salary_max: 100000,
              job_type: 'FULL_TIME',
              status: 'ACTIVE',
              created_at: new Date(),
              updated_at: new Date(),
            };

            // Mock CV exists and belongs to candidate
            const mockCv = {
              id: cvId,
              candidate_id: candidateId,
              file_name: 'test-cv.pdf',
              file_path: '/uploads/test-cv.pdf',
              is_default: false,
              created_at: new Date(),
              updated_at: new Date(),
            };

            // Mock no existing application
            jest.spyOn(prismaService.candidates, 'findUnique').mockResolvedValue(mockCandidate);
            jest.spyOn(prismaService.jobs, 'findUnique').mockResolvedValue(mockJob);
            jest.spyOn(prismaService.cvs, 'findUnique').mockResolvedValue(mockCv);
            jest.spyOn(prismaService.applications, 'findUnique').mockResolvedValue(null);

            // Mock application creation
            const mockApplication = {
              id: 'app-123',
              candidate_id: candidateId,
              job_id: jobId,
              cv_id: cvId,
              status: ApplicationStatus.APPLIED,
              deleted_at: null,
              created_at: new Date(),
              updated_at: new Date(),
              jobs: mockJob,
              cvs: mockCv,
              candidates: {
                ...mockCandidate,
                users: {
                  id: userId,
                  email: 'test@example.com',
                  full_name: 'Test User',
                },
              },
            };

            jest.spyOn(prismaService.applications, 'create').mockResolvedValue(mockApplication);

            // Create application
            const result = await applicationService.createApplication(userId, {
              job_id: jobId,
              cv_id: cvId,
            });

            // Verify status is APPLIED
            expect(result.status).toBe(ApplicationStatus.APPLIED);

            // Verify create was called with APPLIED status
            expect(prismaService.applications.create).toHaveBeenCalledWith(
              expect.objectContaining({
                data: expect.objectContaining({
                  status: ApplicationStatus.APPLIED,
                }),
              }),
            );
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 23: Application Timestamp Recording
   * 
   * For any submitted Application, the created_at timestamp SHALL be set to the current time.
   * 
   * **Validates: Requirements 10.5**
   */
  describe('Property 23: Application timestamp recording', () => {
    it('should record application timestamp on creation (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }), // userId
          fc.string({ minLength: 1, maxLength: 50 }), // jobId
          fc.string({ minLength: 1, maxLength: 50 }), // cvId
          fc.string({ minLength: 1, maxLength: 50 }), // candidateId
          async (userId, jobId, cvId, candidateId) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            // Mock candidate exists
            const mockCandidate = {
              id: candidateId,
              user_id: userId,
              phone_number: null,
              bio: null,
              location: null,
              created_at: new Date(),
              updated_at: new Date(),
            };

            // Mock job with ACTIVE status
            const mockJob = {
              id: jobId,
              company_id: 'company-123',
              title: 'Test Job',
              description: 'Test Description',
              location: 'Test Location',
              salary_min: 50000,
              salary_max: 100000,
              job_type: 'FULL_TIME',
              status: 'ACTIVE',
              created_at: new Date(),
              updated_at: new Date(),
            };

            // Mock CV exists and belongs to candidate
            const mockCv = {
              id: cvId,
              candidate_id: candidateId,
              file_name: 'test-cv.pdf',
              file_path: '/uploads/test-cv.pdf',
              is_default: false,
              created_at: new Date(),
              updated_at: new Date(),
            };

            // Mock no existing application
            jest.spyOn(prismaService.candidates, 'findUnique').mockResolvedValue(mockCandidate);
            jest.spyOn(prismaService.jobs, 'findUnique').mockResolvedValue(mockJob);
            jest.spyOn(prismaService.cvs, 'findUnique').mockResolvedValue(mockCv);
            jest.spyOn(prismaService.applications, 'findUnique').mockResolvedValue(null);

            // Capture the create call to verify timestamp
            let capturedCreateData: any;
            jest.spyOn(prismaService.applications, 'create').mockImplementation(async (args: any) => {
              capturedCreateData = args.data;
              return {
                id: 'app-123',
                candidate_id: candidateId,
                job_id: jobId,
                cv_id: cvId,
                status: ApplicationStatus.APPLIED,
                deleted_at: null,
                created_at: args.data.created_at,
                updated_at: args.data.updated_at,
                jobs: mockJob,
                cvs: mockCv,
                candidates: {
                  ...mockCandidate,
                  users: {
                    id: userId,
                    email: 'test@example.com',
                    full_name: 'Test User',
                  },
                },
              };
            });

            const beforeCreate = new Date();
            // Add small delay to ensure timestamp difference
            await new Promise(resolve => setTimeout(resolve, 10));
            await applicationService.createApplication(userId, {
              job_id: jobId,
              cv_id: cvId,
            });
            const afterCreate = new Date();

            // Verify create was called with timestamp
            expect(prismaService.applications.create).toHaveBeenCalled();
            expect(capturedCreateData).toBeDefined();
            expect(capturedCreateData.created_at).toBeInstanceOf(Date);
            expect(capturedCreateData.updated_at).toBeInstanceOf(Date);

            // Verify timestamp is recent (between before and after create)
            const createdAt = capturedCreateData.created_at;
            // Allow 100ms tolerance for timing variations
            expect(createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime() - 100);
            expect(createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime() + 100);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 31: Application Status Transition Validation
   * 
   * For any Application status update, the transition SHALL be allowed only if it matches
   * one of: APPLIED→REVIEWING, APPLIED→REJECTED, REVIEWING→ACCEPTED, REVIEWING→REJECTED.
   * All other transitions SHALL fail with 400 Bad Request.
   * 
   * **Validates: Requirements 11.3, 11.4, 11.5, 12.1, 12.2, 12.3**
   */
  describe('Property 31: Application status transition validation', () => {
    // Valid transitions
    const validTransitions: Array<[ApplicationStatus, ApplicationStatus]> = [
      [ApplicationStatus.APPLIED, ApplicationStatus.REVIEWING],
      [ApplicationStatus.APPLIED, ApplicationStatus.REJECTED],
      [ApplicationStatus.REVIEWING, ApplicationStatus.ACCEPTED],
      [ApplicationStatus.REVIEWING, ApplicationStatus.REJECTED],
    ];

    // Invalid transitions (all other combinations)
    const invalidTransitions: Array<[ApplicationStatus, ApplicationStatus]> = [
      [ApplicationStatus.APPLIED, ApplicationStatus.ACCEPTED],
      [ApplicationStatus.APPLIED, ApplicationStatus.APPLIED],
      [ApplicationStatus.REVIEWING, ApplicationStatus.REVIEWING],
      [ApplicationStatus.REVIEWING, ApplicationStatus.APPLIED],
      [ApplicationStatus.ACCEPTED, ApplicationStatus.APPLIED],
      [ApplicationStatus.ACCEPTED, ApplicationStatus.REVIEWING],
      [ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED],
      [ApplicationStatus.ACCEPTED, ApplicationStatus.ACCEPTED],
      [ApplicationStatus.REJECTED, ApplicationStatus.APPLIED],
      [ApplicationStatus.REJECTED, ApplicationStatus.REVIEWING],
      [ApplicationStatus.REJECTED, ApplicationStatus.ACCEPTED],
      [ApplicationStatus.REJECTED, ApplicationStatus.REJECTED],
    ];

    it('should allow valid status transitions (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }), // recruiterId
          fc.string({ minLength: 1, maxLength: 50 }), // applicationId
          fc.constantFrom(...validTransitions), // Pick from valid transitions
          async (recruiterId, applicationId, [currentStatus, newStatus]) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            // Mock application with current status
            const mockApplication = {
              id: applicationId,
              candidate_id: 'candidate-123',
              job_id: 'job-123',
              cv_id: 'cv-123',
              status: currentStatus,
              deleted_at: null,
              created_at: new Date(),
              updated_at: new Date(),
              jobs: {
                id: 'job-123',
                company_id: 'company-123',
                title: 'Test Job',
                description: 'Test Description',
                location: 'Test Location',
                salary_min: 50000,
                salary_max: 100000,
                job_type: 'FULL_TIME',
                status: 'ACTIVE',
                created_at: new Date(),
                updated_at: new Date(),
                companies: {
                  id: 'company-123',
                  name: 'Test Company',
                  description: 'Test Description',
                  website: 'https://test.com',
                  industry: 'Tech',
                  company_type: 'STARTUP',
                  location: 'Test Location',
                  recruiter_id: 'recruiter-123',
                  created_at: new Date(),
                  updated_at: new Date(),
                  recruiters: {
                    id: 'recruiter-123',
                    user_id: recruiterId,
                    company_id: 'company-123',
                    created_at: new Date(),
                    updated_at: new Date(),
                  },
                },
              },
            };

            // Mock updated application
            const mockUpdatedApplication = {
              ...mockApplication,
              status: newStatus,
              updated_at: new Date(),
              candidates: {
                id: 'candidate-123',
                user_id: 'user-123',
                phone_number: null,
                bio: null,
                location: null,
                created_at: new Date(),
                updated_at: new Date(),
                users: {
                  id: 'user-123',
                  email: 'test@example.com',
                  full_name: 'Test User',
                },
              },
              cvs: {
                id: 'cv-123',
                candidate_id: 'candidate-123',
                file_name: 'test-cv.pdf',
                file_path: '/uploads/test-cv.pdf',
                is_default: false,
                created_at: new Date(),
                updated_at: new Date(),
              },
            };

            jest.spyOn(prismaService.applications, 'findUnique').mockResolvedValue(mockApplication);
            jest.spyOn(prismaService.applications, 'update').mockResolvedValue(mockUpdatedApplication);

            // Should not throw for valid transitions
            const result = await applicationService.updateApplicationStatus(
              recruiterId,
              applicationId,
              { status: newStatus },
            );

            expect(result).toBeDefined();
            expect(result.status).toBe(newStatus);
            expect(prismaService.applications.update).toHaveBeenCalled();
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should reject invalid status transitions (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }), // recruiterId
          fc.string({ minLength: 1, maxLength: 50 }), // applicationId
          fc.constantFrom(...invalidTransitions), // Pick from invalid transitions
          async (recruiterId, applicationId, [currentStatus, newStatus]) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            // Mock application with current status
            const mockApplication = {
              id: applicationId,
              candidate_id: 'candidate-123',
              job_id: 'job-123',
              cv_id: 'cv-123',
              status: currentStatus,
              deleted_at: null,
              created_at: new Date(),
              updated_at: new Date(),
              jobs: {
                id: 'job-123',
                company_id: 'company-123',
                title: 'Test Job',
                description: 'Test Description',
                location: 'Test Location',
                salary_min: 50000,
                salary_max: 100000,
                job_type: 'FULL_TIME',
                status: 'ACTIVE',
                created_at: new Date(),
                updated_at: new Date(),
                companies: {
                  id: 'company-123',
                  name: 'Test Company',
                  description: 'Test Description',
                  website: 'https://test.com',
                  industry: 'Tech',
                  company_type: 'STARTUP',
                  location: 'Test Location',
                  recruiter_id: 'recruiter-123',
                  created_at: new Date(),
                  updated_at: new Date(),
                  recruiters: {
                    id: 'recruiter-123',
                    user_id: recruiterId,
                    company_id: 'company-123',
                    created_at: new Date(),
                    updated_at: new Date(),
                  },
                },
              },
            };

            jest.spyOn(prismaService.applications, 'findUnique').mockResolvedValue(mockApplication);

            // Should throw BadRequestException for invalid transitions
            await expect(
              applicationService.updateApplicationStatus(
                recruiterId,
                applicationId,
                { status: newStatus },
              ),
            ).rejects.toThrow(BadRequestException);

            await expect(
              applicationService.updateApplicationStatus(
                recruiterId,
                applicationId,
                { status: newStatus },
              ),
            ).rejects.toThrow(`Cannot transition from ${currentStatus} to ${newStatus}`);

            // Verify update was not called
            expect(prismaService.applications.update).not.toHaveBeenCalled();
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 32: Application Status Update Authorization
   * 
   * For any Application status update request, if the authenticated Recruiter owns
   * the Job's Company, the update SHALL succeed; otherwise, it SHALL fail with 403 Forbidden.
   * 
   * **Validates: Requirements 11.2**
   */
  describe('Property 32: Application status update authorization', () => {
    it('should allow status update by authorized recruiter (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }), // recruiterId
          fc.string({ minLength: 1, maxLength: 50 }), // applicationId
          fc.constantFrom(
            ApplicationStatus.APPLIED,
            ApplicationStatus.REVIEWING,
          ), // Current status
          async (recruiterId, applicationId, currentStatus) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            // Determine valid new status based on current status
            const newStatus =
              currentStatus === ApplicationStatus.APPLIED
                ? ApplicationStatus.REVIEWING
                : ApplicationStatus.ACCEPTED;

            // Mock application where recruiter owns the company
            const mockApplication = {
              id: applicationId,
              candidate_id: 'candidate-123',
              job_id: 'job-123',
              cv_id: 'cv-123',
              status: currentStatus,
              deleted_at: null,
              created_at: new Date(),
              updated_at: new Date(),
              jobs: {
                id: 'job-123',
                company_id: 'company-123',
                title: 'Test Job',
                description: 'Test Description',
                location: 'Test Location',
                salary_min: 50000,
                salary_max: 100000,
                job_type: 'FULL_TIME',
                status: 'ACTIVE',
                created_at: new Date(),
                updated_at: new Date(),
                companies: {
                  id: 'company-123',
                  name: 'Test Company',
                  description: 'Test Description',
                  website: 'https://test.com',
                  industry: 'Tech',
                  company_type: 'STARTUP',
                  location: 'Test Location',
                  recruiter_id: 'recruiter-123',
                  created_at: new Date(),
                  updated_at: new Date(),
                  recruiters: {
                    id: 'recruiter-123',
                    user_id: recruiterId, // Matches authenticated user
                    company_id: 'company-123',
                    created_at: new Date(),
                    updated_at: new Date(),
                  },
                },
              },
            };

            // Mock updated application
            const mockUpdatedApplication = {
              ...mockApplication,
              status: newStatus,
              updated_at: new Date(),
              candidates: {
                id: 'candidate-123',
                user_id: 'user-123',
                phone_number: null,
                bio: null,
                location: null,
                created_at: new Date(),
                updated_at: new Date(),
                users: {
                  id: 'user-123',
                  email: 'test@example.com',
                  full_name: 'Test User',
                },
              },
              cvs: {
                id: 'cv-123',
                candidate_id: 'candidate-123',
                file_name: 'test-cv.pdf',
                file_path: '/uploads/test-cv.pdf',
                is_default: false,
                created_at: new Date(),
                updated_at: new Date(),
              },
            };

            jest.spyOn(prismaService.applications, 'findUnique').mockResolvedValue(mockApplication);
            jest.spyOn(prismaService.applications, 'update').mockResolvedValue(mockUpdatedApplication);

            // Should succeed for authorized recruiter
            const result = await applicationService.updateApplicationStatus(
              recruiterId,
              applicationId,
              { status: newStatus },
            );

            expect(result).toBeDefined();
            expect(result.status).toBe(newStatus);
            expect(prismaService.applications.update).toHaveBeenCalled();
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should reject status update by unauthorized recruiter (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }), // unauthorizedRecruiterId
          fc.string({ minLength: 1, maxLength: 50 }), // applicationId
          fc.string({ minLength: 1, maxLength: 50 }), // actualRecruiterId (different from unauthorized)
          fc.constantFrom(
            ApplicationStatus.APPLIED,
            ApplicationStatus.REVIEWING,
          ), // Current status
          async (unauthorizedRecruiterId, applicationId, actualRecruiterId, currentStatus) => {
            // Ensure the recruiter IDs are different
            fc.pre(unauthorizedRecruiterId !== actualRecruiterId);

            // Clear all mocks before each iteration
            jest.clearAllMocks();

            // Determine valid new status based on current status
            const newStatus =
              currentStatus === ApplicationStatus.APPLIED
                ? ApplicationStatus.REVIEWING
                : ApplicationStatus.ACCEPTED;

            // Mock application where a different recruiter owns the company
            const mockApplication = {
              id: applicationId,
              candidate_id: 'candidate-123',
              job_id: 'job-123',
              cv_id: 'cv-123',
              status: currentStatus,
              deleted_at: null,
              created_at: new Date(),
              updated_at: new Date(),
              jobs: {
                id: 'job-123',
                company_id: 'company-123',
                title: 'Test Job',
                description: 'Test Description',
                location: 'Test Location',
                salary_min: 50000,
                salary_max: 100000,
                job_type: 'FULL_TIME',
                status: 'ACTIVE',
                created_at: new Date(),
                updated_at: new Date(),
                companies: {
                  id: 'company-123',
                  name: 'Test Company',
                  description: 'Test Description',
                  website: 'https://test.com',
                  industry: 'Tech',
                  company_type: 'STARTUP',
                  location: 'Test Location',
                  recruiter_id: 'recruiter-123',
                  created_at: new Date(),
                  updated_at: new Date(),
                  recruiters: {
                    id: 'recruiter-123',
                    user_id: actualRecruiterId, // Different from authenticated user
                    company_id: 'company-123',
                    created_at: new Date(),
                    updated_at: new Date(),
                  },
                },
              },
            };

            jest.spyOn(prismaService.applications, 'findUnique').mockResolvedValue(mockApplication);

            // Should throw ForbiddenException for unauthorized recruiter
            await expect(
              applicationService.updateApplicationStatus(
                unauthorizedRecruiterId,
                applicationId,
                { status: newStatus },
              ),
            ).rejects.toThrow(ForbiddenException);

            await expect(
              applicationService.updateApplicationStatus(
                unauthorizedRecruiterId,
                applicationId,
                { status: newStatus },
              ),
            ).rejects.toThrow('You do not have permission to update this application');

            // Verify update was not called
            expect(prismaService.applications.update).not.toHaveBeenCalled();
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 33: Application History Sorting
   * 
   * For any Candidate's application history, applications SHALL be sorted by
   * created_at in descending order (most recent first).
   * 
   * **Validates: Requirements 13.1**
   */
  describe('Property 33: Application history sorting', () => {
    it('should return applications sorted by created_at DESC (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }), // userId
          fc.string({ minLength: 1, maxLength: 50 }), // candidateId
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1, maxLength: 50 }),
              jobId: fc.string({ minLength: 1, maxLength: 50 }),
              cvId: fc.string({ minLength: 1, maxLength: 50 }),
              createdAt: fc.date({ 
                min: new Date('2020-01-01T00:00:00.000Z'), 
                max: new Date('2025-12-31T23:59:59.999Z'),
                noInvalidDate: true,
              }),
            }),
            { minLength: 2, maxLength: 10 }, // At least 2 applications to verify sorting
          ),
          async (userId, candidateId, applicationData) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            // Mock candidate exists
            const mockCandidate = {
              id: candidateId,
              user_id: userId,
              phone_number: null,
              bio: null,
              location: null,
              created_at: new Date(),
              updated_at: new Date(),
            };

            // Create mock applications with the generated dates
            const mockApplications = applicationData.map((data) => ({
              id: data.id,
              candidate_id: candidateId,
              job_id: data.jobId,
              cv_id: data.cvId,
              status: ApplicationStatus.APPLIED,
              deleted_at: null,
              created_at: data.createdAt,
              updated_at: data.createdAt,
              jobs: {
                id: data.jobId,
                company_id: 'company-123',
                title: 'Test Job',
                description: 'Test Description',
                location: 'Test Location',
                salary_min: 50000,
                salary_max: 100000,
                job_type: 'FULL_TIME',
                status: 'ACTIVE',
                created_at: new Date(),
                updated_at: new Date(),
                companies: {
                  id: 'company-123',
                  name: 'Test Company',
                  description: 'Test Description',
                  website: 'https://test.com',
                  industry: 'Tech',
                  company_type: 'STARTUP',
                  location: 'Test Location',
                  recruiter_id: 'recruiter-123',
                  created_at: new Date(),
                  updated_at: new Date(),
                },
              },
              cvs: {
                id: data.cvId,
                candidate_id: candidateId,
                file_name: 'test-cv.pdf',
                file_path: '/uploads/test-cv.pdf',
                is_default: false,
                created_at: new Date(),
                updated_at: new Date(),
              },
            }));

            // Sort applications by created_at DESC (most recent first)
            const sortedApplications = [...mockApplications].sort(
              (a, b) => b.created_at.getTime() - a.created_at.getTime(),
            );

            jest.spyOn(prismaService.candidates, 'findUnique').mockResolvedValue(mockCandidate);
            jest.spyOn(prismaService.applications, 'count').mockResolvedValue(mockApplications.length);
            jest.spyOn(prismaService.applications, 'findMany').mockResolvedValue(sortedApplications);

            // Get applications
            const result = await applicationService.getApplications(userId, 'CANDIDATE');

            // Verify applications are sorted by created_at DESC
            expect(result.data).toBeDefined();
            expect(result.data.length).toBe(mockApplications.length);

            // Verify each application is older than or equal to the previous one
            for (let i = 0; i < result.data.length - 1; i++) {
              const currentDate = result.data[i].created_at.getTime();
              const nextDate = result.data[i + 1].created_at.getTime();
              expect(currentDate).toBeGreaterThanOrEqual(nextDate);
            }

            // Verify findMany was called with correct orderBy
            expect(prismaService.applications.findMany).toHaveBeenCalledWith(
              expect.objectContaining({
                orderBy: {
                  created_at: 'desc',
                },
              }),
            );
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 34: Application History Filtering by Status
   * 
   * For any Candidate's application history filtered by status S, all returned
   * applications SHALL have status S.
   * 
   * **Validates: Requirements 13.4**
   */
  describe('Property 34: Application history filtering by status', () => {
    it('should return only applications with specified status (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }), // userId
          fc.string({ minLength: 1, maxLength: 50 }), // candidateId
          fc.constantFrom(
            ApplicationStatus.APPLIED,
            ApplicationStatus.REVIEWING,
            ApplicationStatus.ACCEPTED,
            ApplicationStatus.REJECTED,
          ), // Filter status
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1, maxLength: 50 }),
              jobId: fc.string({ minLength: 1, maxLength: 50 }),
              cvId: fc.string({ minLength: 1, maxLength: 50 }),
              status: fc.constantFrom(
                ApplicationStatus.APPLIED,
                ApplicationStatus.REVIEWING,
                ApplicationStatus.ACCEPTED,
                ApplicationStatus.REJECTED,
              ),
            }),
            { minLength: 3, maxLength: 10 }, // Multiple applications with different statuses
          ),
          async (userId, candidateId, filterStatus, applicationData) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            // Mock candidate exists
            const mockCandidate = {
              id: candidateId,
              user_id: userId,
              phone_number: null,
              bio: null,
              location: null,
              created_at: new Date(),
              updated_at: new Date(),
            };

            // Create mock applications
            const allApplications = applicationData.map((data) => ({
              id: data.id,
              candidate_id: candidateId,
              job_id: data.jobId,
              cv_id: data.cvId,
              status: data.status,
              deleted_at: null,
              created_at: new Date(),
              updated_at: new Date(),
              jobs: {
                id: data.jobId,
                company_id: 'company-123',
                title: 'Test Job',
                description: 'Test Description',
                location: 'Test Location',
                salary_min: 50000,
                salary_max: 100000,
                job_type: 'FULL_TIME',
                status: 'ACTIVE',
                created_at: new Date(),
                updated_at: new Date(),
                companies: {
                  id: 'company-123',
                  name: 'Test Company',
                  description: 'Test Description',
                  website: 'https://test.com',
                  industry: 'Tech',
                  company_type: 'STARTUP',
                  location: 'Test Location',
                  recruiter_id: 'recruiter-123',
                  created_at: new Date(),
                  updated_at: new Date(),
                },
              },
              cvs: {
                id: data.cvId,
                candidate_id: candidateId,
                file_name: 'test-cv.pdf',
                file_path: '/uploads/test-cv.pdf',
                is_default: false,
                created_at: new Date(),
                updated_at: new Date(),
              },
            }));

            // Filter applications by status
            const filteredApplications = allApplications.filter(
              (app) => app.status === filterStatus,
            );

            jest.spyOn(prismaService.candidates, 'findUnique').mockResolvedValue(mockCandidate);
            jest.spyOn(prismaService.applications, 'count').mockResolvedValue(filteredApplications.length);
            jest.spyOn(prismaService.applications, 'findMany').mockResolvedValue(filteredApplications);

            // Get applications with status filter
            const result = await applicationService.getApplications(
              userId,
              'CANDIDATE',
              filterStatus,
            );

            // Verify all returned applications have the specified status
            expect(result.data).toBeDefined();
            expect(result.data.length).toBe(filteredApplications.length);

            result.data.forEach((application) => {
              expect(application.status).toBe(filterStatus);
            });

            // Verify findMany was called with correct where clause
            expect(prismaService.applications.findMany).toHaveBeenCalledWith(
              expect.objectContaining({
                where: expect.objectContaining({
                  candidate_id: candidateId,
                  status: filterStatus,
                  deleted_at: null,
                }),
              }),
            );
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 35: Recruiter Dashboard Scope
   * 
   * For any Recruiter requesting their application dashboard, only applications
   * for jobs posted by their Company SHALL be returned.
   * 
   * **Validates: Requirements 14.1**
   */
  describe('Property 35: Recruiter dashboard scope', () => {
    it('should return only applications for recruiter company jobs (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }), // recruiterId
          fc.string({ minLength: 1, maxLength: 50 }), // companyId
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1, maxLength: 50 }),
              jobId: fc.string({ minLength: 1, maxLength: 50 }),
              candidateId: fc.string({ minLength: 1, maxLength: 50 }),
              cvId: fc.string({ minLength: 1, maxLength: 50 }),
              belongsToCompany: fc.boolean(), // Whether this application is for the recruiter's company
            }),
            { minLength: 3, maxLength: 10 }, // Multiple applications
          ),
          async (recruiterId, companyId, applicationData) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            // Mock recruiter with company
            const mockRecruiter = {
              id: 'recruiter-123',
              user_id: recruiterId,
              company_id: companyId,
              created_at: new Date(),
              updated_at: new Date(),
              companies: {
                id: companyId,
                name: 'Test Company',
                description: 'Test Description',
                website: 'https://test.com',
                industry: 'Tech',
                company_type: 'STARTUP',
                location: 'Test Location',
                recruiter_id: 'recruiter-123',
                created_at: new Date(),
                updated_at: new Date(),
              },
            };

            // Create mock applications
            const allApplications = applicationData.map((data) => ({
              id: data.id,
              candidate_id: data.candidateId,
              job_id: data.jobId,
              cv_id: data.cvId,
              status: ApplicationStatus.APPLIED,
              deleted_at: null,
              created_at: new Date(),
              updated_at: new Date(),
              jobs: {
                id: data.jobId,
                company_id: data.belongsToCompany ? companyId : 'other-company-' + data.jobId,
                title: 'Test Job',
                description: 'Test Description',
                location: 'Test Location',
                salary_min: 50000,
                salary_max: 100000,
                job_type: 'FULL_TIME',
                status: 'ACTIVE',
                created_at: new Date(),
                updated_at: new Date(),
              },
              candidates: {
                id: data.candidateId,
                user_id: 'user-' + data.candidateId,
                phone_number: null,
                bio: null,
                location: null,
                created_at: new Date(),
                updated_at: new Date(),
                users: {
                  id: 'user-' + data.candidateId,
                  email: 'test@example.com',
                  full_name: 'Test User',
                },
              },
              cvs: {
                id: data.cvId,
                candidate_id: data.candidateId,
                file_name: 'test-cv.pdf',
                file_path: '/uploads/test-cv.pdf',
                is_default: false,
                created_at: new Date(),
                updated_at: new Date(),
              },
            }));

            // Filter applications to only those belonging to the recruiter's company
            const companyApplications = allApplications.filter((app) =>
              app.jobs.company_id === companyId,
            );

            jest.spyOn(prismaService.recruiters, 'findUnique').mockResolvedValue(mockRecruiter);
            jest.spyOn(prismaService.applications, 'count').mockResolvedValue(companyApplications.length);
            jest.spyOn(prismaService.applications, 'findMany').mockResolvedValue(companyApplications);

            // Get applications for recruiter
            const result = await applicationService.getApplications(recruiterId, 'RECRUITER');

            // Verify all returned applications are for the recruiter's company jobs
            expect(result.data).toBeDefined();
            expect(result.data.length).toBe(companyApplications.length);

            result.data.forEach((application) => {
              expect(application.jobs.company_id).toBe(companyId);
            });

            // Verify findMany was called with correct where clause
            expect(prismaService.applications.findMany).toHaveBeenCalledWith(
              expect.objectContaining({
                where: expect.objectContaining({
                  jobs: {
                    company_id: companyId,
                  },
                  deleted_at: null,
                }),
              }),
            );
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should return empty list for recruiter without company (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }), // recruiterId
          async (recruiterId) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            // Mock recruiter without company
            const mockRecruiter = {
              id: 'recruiter-123',
              user_id: recruiterId,
              company_id: null,
              created_at: new Date(),
              updated_at: new Date(),
              companies: null,
            };

            jest.spyOn(prismaService.recruiters, 'findUnique').mockResolvedValue(mockRecruiter);

            // Get applications for recruiter without company
            const result = await applicationService.getApplications(recruiterId, 'RECRUITER');

            // Verify empty list is returned
            expect(result.data).toBeDefined();
            expect(result.data).toEqual([]);
            expect(result.pagination.total_count).toBe(0);

            // Verify findMany was not called
            expect(prismaService.applications.findMany).not.toHaveBeenCalled();
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 47: Soft Delete Application Exclusion
   * 
   * For any application list query, applications with a non-null deleted_at timestamp
   * SHALL be excluded from results.
   * 
   * **Validates: Requirements 28.1, 28.2**
   */
  describe('Property 47: Soft delete application exclusion', () => {
    it('should exclude soft-deleted applications from candidate list (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }), // userId
          fc.string({ minLength: 1, maxLength: 50 }), // candidateId
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1, maxLength: 50 }),
              jobId: fc.string({ minLength: 1, maxLength: 50 }),
              cvId: fc.string({ minLength: 1, maxLength: 50 }),
              isDeleted: fc.boolean(), // Whether this application is soft-deleted
            }),
            { minLength: 3, maxLength: 10 }, // Multiple applications with mix of deleted/active
          ),
          async (userId, candidateId, applicationData) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            // Mock candidate exists
            const mockCandidate = {
              id: candidateId,
              user_id: userId,
              phone_number: null,
              bio: null,
              location: null,
              created_at: new Date(),
              updated_at: new Date(),
            };

            // Create mock applications with some soft-deleted
            const allApplications = applicationData.map((data) => ({
              id: data.id,
              candidate_id: candidateId,
              job_id: data.jobId,
              cv_id: data.cvId,
              status: ApplicationStatus.APPLIED,
              deleted_at: data.isDeleted ? new Date() : null, // Set deleted_at if soft-deleted
              created_at: new Date(),
              updated_at: new Date(),
              jobs: {
                id: data.jobId,
                company_id: 'company-123',
                title: 'Test Job',
                description: 'Test Description',
                location: 'Test Location',
                salary_min: 50000,
                salary_max: 100000,
                job_type: 'FULL_TIME',
                status: 'ACTIVE',
                created_at: new Date(),
                updated_at: new Date(),
                companies: {
                  id: 'company-123',
                  name: 'Test Company',
                  description: 'Test Description',
                  website: 'https://test.com',
                  industry: 'Tech',
                  company_type: 'STARTUP',
                  location: 'Test Location',
                  recruiter_id: 'recruiter-123',
                  created_at: new Date(),
                  updated_at: new Date(),
                },
              },
              cvs: {
                id: data.cvId,
                candidate_id: candidateId,
                file_name: 'test-cv.pdf',
                file_path: '/uploads/test-cv.pdf',
                is_default: false,
                created_at: new Date(),
                updated_at: new Date(),
              },
            }));

            // Filter to only non-deleted applications (deleted_at is null)
            const activeApplications = allApplications.filter((app) => app.deleted_at === null);

            jest.spyOn(prismaService.candidates, 'findUnique').mockResolvedValue(mockCandidate);
            jest.spyOn(prismaService.applications, 'count').mockResolvedValue(activeApplications.length);
            jest.spyOn(prismaService.applications, 'findMany').mockResolvedValue(activeApplications);

            // Get applications
            const result = await applicationService.getApplications(userId, 'CANDIDATE');

            // Verify only non-deleted applications are returned
            expect(result.data).toBeDefined();
            expect(result.data.length).toBe(activeApplications.length);

            // Verify all returned applications have deleted_at === null
            result.data.forEach((application) => {
              expect(application.deleted_at).toBeNull();
            });

            // Verify findMany was called with deleted_at: null in where clause
            expect(prismaService.applications.findMany).toHaveBeenCalledWith(
              expect.objectContaining({
                where: expect.objectContaining({
                  candidate_id: candidateId,
                  deleted_at: null,
                }),
              }),
            );
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should exclude soft-deleted applications from recruiter dashboard (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }), // recruiterId
          fc.string({ minLength: 1, maxLength: 50 }), // companyId
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1, maxLength: 50 }),
              jobId: fc.string({ minLength: 1, maxLength: 50 }),
              candidateId: fc.string({ minLength: 1, maxLength: 50 }),
              cvId: fc.string({ minLength: 1, maxLength: 50 }),
              isDeleted: fc.boolean(), // Whether this application is soft-deleted
            }),
            { minLength: 3, maxLength: 10 }, // Multiple applications
          ),
          async (recruiterId, companyId, applicationData) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            // Mock recruiter with company
            const mockRecruiter = {
              id: 'recruiter-123',
              user_id: recruiterId,
              company_id: companyId,
              created_at: new Date(),
              updated_at: new Date(),
              companies: {
                id: companyId,
                name: 'Test Company',
                description: 'Test Description',
                website: 'https://test.com',
                industry: 'Tech',
                company_type: 'STARTUP',
                location: 'Test Location',
                recruiter_id: 'recruiter-123',
                created_at: new Date(),
                updated_at: new Date(),
              },
            };

            // Create mock applications with some soft-deleted
            const allApplications = applicationData.map((data) => ({
              id: data.id,
              candidate_id: data.candidateId,
              job_id: data.jobId,
              cv_id: data.cvId,
              status: ApplicationStatus.APPLIED,
              deleted_at: data.isDeleted ? new Date() : null, // Set deleted_at if soft-deleted
              created_at: new Date(),
              updated_at: new Date(),
              jobs: {
                id: data.jobId,
                company_id: companyId,
                title: 'Test Job',
                description: 'Test Description',
                location: 'Test Location',
                salary_min: 50000,
                salary_max: 100000,
                job_type: 'FULL_TIME',
                status: 'ACTIVE',
                created_at: new Date(),
                updated_at: new Date(),
              },
              candidates: {
                id: data.candidateId,
                user_id: 'user-' + data.candidateId,
                phone_number: null,
                bio: null,
                location: null,
                created_at: new Date(),
                updated_at: new Date(),
                users: {
                  id: 'user-' + data.candidateId,
                  email: 'test@example.com',
                  full_name: 'Test User',
                },
              },
              cvs: {
                id: data.cvId,
                candidate_id: data.candidateId,
                file_name: 'test-cv.pdf',
                file_path: '/uploads/test-cv.pdf',
                is_default: false,
                created_at: new Date(),
                updated_at: new Date(),
              },
            }));

            // Filter to only non-deleted applications (deleted_at is null)
            const activeApplications = allApplications.filter((app) => app.deleted_at === null);

            jest.spyOn(prismaService.recruiters, 'findUnique').mockResolvedValue(mockRecruiter);
            jest.spyOn(prismaService.applications, 'count').mockResolvedValue(activeApplications.length);
            jest.spyOn(prismaService.applications, 'findMany').mockResolvedValue(activeApplications);

            // Get applications for recruiter
            const result = await applicationService.getApplications(recruiterId, 'RECRUITER');

            // Verify only non-deleted applications are returned
            expect(result.data).toBeDefined();
            expect(result.data.length).toBe(activeApplications.length);

            // Verify all returned applications have deleted_at === null
            result.data.forEach((application) => {
              expect(application.deleted_at).toBeNull();
            });

            // Verify findMany was called with deleted_at: null in where clause
            expect(prismaService.applications.findMany).toHaveBeenCalledWith(
              expect.objectContaining({
                where: expect.objectContaining({
                  jobs: {
                    company_id: companyId,
                  },
                  deleted_at: null,
                }),
              }),
            );
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should exclude soft-deleted application from getApplicationById (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }), // userId
          fc.string({ minLength: 1, maxLength: 50 }), // applicationId
          fc.string({ minLength: 1, maxLength: 50 }), // candidateId
          async (userId, applicationId, candidateId) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            // Mock candidate exists
            const mockCandidate = {
              id: candidateId,
              user_id: userId,
              phone_number: null,
              bio: null,
              location: null,
              created_at: new Date(),
              updated_at: new Date(),
            };

            // Mock soft-deleted application
            const mockApplication = {
              id: applicationId,
              candidate_id: candidateId,
              job_id: 'job-123',
              cv_id: 'cv-123',
              status: ApplicationStatus.APPLIED,
              deleted_at: new Date(), // Application is soft-deleted
              created_at: new Date(),
              updated_at: new Date(),
              candidates: {
                ...mockCandidate,
                users: {
                  id: userId,
                  email: 'test@example.com',
                  full_name: 'Test User',
                },
              },
              jobs: {
                id: 'job-123',
                company_id: 'company-123',
                title: 'Test Job',
                description: 'Test Description',
                location: 'Test Location',
                salary_min: 50000,
                salary_max: 100000,
                job_type: 'FULL_TIME',
                status: 'ACTIVE',
                created_at: new Date(),
                updated_at: new Date(),
                companies: {
                  id: 'company-123',
                  name: 'Test Company',
                  description: 'Test Description',
                  website: 'https://test.com',
                  industry: 'Tech',
                  company_type: 'STARTUP',
                  location: 'Test Location',
                  recruiter_id: 'recruiter-123',
                  created_at: new Date(),
                  updated_at: new Date(),
                  recruiters: {
                    id: 'recruiter-123',
                    user_id: 'recruiter-user-123',
                    company_id: 'company-123',
                    created_at: new Date(),
                    updated_at: new Date(),
                  },
                },
              },
              cvs: {
                id: 'cv-123',
                candidate_id: candidateId,
                file_name: 'test-cv.pdf',
                file_path: '/uploads/test-cv.pdf',
                is_default: false,
                created_at: new Date(),
                updated_at: new Date(),
              },
            };

            jest.spyOn(prismaService.candidates, 'findUnique').mockResolvedValue(mockCandidate);
            jest.spyOn(prismaService.applications, 'findUnique').mockResolvedValue(mockApplication);

            // Attempt to get soft-deleted application should throw NotFoundException
            await expect(
              applicationService.getApplicationById(userId, 'CANDIDATE', applicationId),
            ).rejects.toThrow('Application not found');

            // Verify findUnique was called
            expect(prismaService.applications.findUnique).toHaveBeenCalledWith(
              expect.objectContaining({
                where: { id: applicationId },
              }),
            );
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should allow duplicate application after soft delete (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }), // userId
          fc.string({ minLength: 1, maxLength: 50 }), // jobId
          fc.string({ minLength: 1, maxLength: 50 }), // cvId
          fc.string({ minLength: 1, maxLength: 50 }), // candidateId
          async (userId, jobId, cvId, candidateId) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            // Mock candidate exists
            const mockCandidate = {
              id: candidateId,
              user_id: userId,
              phone_number: null,
              bio: null,
              location: null,
              created_at: new Date(),
              updated_at: new Date(),
            };

            // Mock job with ACTIVE status
            const mockJob = {
              id: jobId,
              company_id: 'company-123',
              title: 'Test Job',
              description: 'Test Description',
              location: 'Test Location',
              salary_min: 50000,
              salary_max: 100000,
              job_type: 'FULL_TIME',
              status: 'ACTIVE',
              created_at: new Date(),
              updated_at: new Date(),
            };

            // Mock CV exists and belongs to candidate
            const mockCv = {
              id: cvId,
              candidate_id: candidateId,
              file_name: 'test-cv.pdf',
              file_path: '/uploads/test-cv.pdf',
              is_default: false,
              created_at: new Date(),
              updated_at: new Date(),
            };

            // Mock existing soft-deleted application
            const existingApplication = {
              id: 'existing-app-123',
              candidate_id: candidateId,
              job_id: jobId,
              cv_id: 'some-cv-id',
              status: ApplicationStatus.APPLIED,
              deleted_at: new Date(), // Application is soft-deleted
              created_at: new Date(),
              updated_at: new Date(),
            };

            jest.spyOn(prismaService.candidates, 'findUnique').mockResolvedValue(mockCandidate);
            jest.spyOn(prismaService.jobs, 'findUnique').mockResolvedValue(mockJob);
            jest.spyOn(prismaService.cvs, 'findUnique').mockResolvedValue(mockCv);
            jest.spyOn(prismaService.applications, 'findUnique').mockResolvedValue(existingApplication);

            // Mock new application creation
            const mockNewApplication = {
              id: 'new-app-123',
              candidate_id: candidateId,
              job_id: jobId,
              cv_id: cvId,
              status: ApplicationStatus.APPLIED,
              deleted_at: null,
              created_at: new Date(),
              updated_at: new Date(),
              jobs: mockJob,
              cvs: mockCv,
              candidates: {
                ...mockCandidate,
                users: {
                  id: userId,
                  email: 'test@example.com',
                  full_name: 'Test User',
                },
              },
            };

            jest.spyOn(prismaService.applications, 'create').mockResolvedValue(mockNewApplication);

            // Should allow new application since existing one is soft-deleted
            const result = await applicationService.createApplication(userId, {
              job_id: jobId,
              cv_id: cvId,
            });

            expect(result).toBeDefined();
            expect(result.deleted_at).toBeNull();
            expect(prismaService.applications.create).toHaveBeenCalled();
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
