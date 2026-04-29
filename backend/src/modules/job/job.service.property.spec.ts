import { Test, TestingModule } from '@nestjs/testing';
import * as fc from 'fast-check';
import { JobService } from './job.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Property-Based Tests for Job Service
 * 
 * **Validates: Requirements 8.2, 8.3, 8.4**
 * 
 * These tests verify job management properties using fast-check with minimum 100 iterations.
 */
describe('JobService - Property-Based Tests', () => {
  let jobService: JobService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobService,
        {
          provide: PrismaService,
          useValue: {
            jobs: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
            recruiters: {
              findUnique: jest.fn(),
            },
            candidates: {
              findUnique: jest.fn(),
            },
            job_skills: {
              create: jest.fn(),
            },
            job_tags: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    jobService = module.get<JobService>(JobService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 17: Job Creation Sets Active Status
   * 
   * For any Job created by a Recruiter, the Job's initial status SHALL be ACTIVE.
   * 
   * **Validates: Requirements 8.2**
   */
  describe('Property 17: Job creation sets active status', () => {
    it('should create all jobs with ACTIVE status (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 5, maxLength: 100 }), // title
          fc.string({ minLength: 20, maxLength: 500 }), // description
          fc.string({ minLength: 3, maxLength: 100 }), // location
          fc.constantFrom('Full-time', 'Part-time', 'Contract', 'Internship'), // job_type
          fc.option(fc.integer({ min: 0, max: 500000 }), { nil: undefined }), // salary_min
          fc.option(fc.integer({ min: 0, max: 500000 }), { nil: undefined }), // salary_max
          fc.array(fc.string({ minLength: 12, maxLength: 24 }), { minLength: 0, maxLength: 5 }), // skill_ids
          fc.array(fc.string({ minLength: 12, maxLength: 24 }), { minLength: 0, maxLength: 5 }), // tag_ids
          async (title, description, location, jobType, salaryMin, salaryMax, skillIds, tagIds) => {
            // Skip invalid salary ranges
            if (salaryMin !== undefined && salaryMax !== undefined && salaryMin > salaryMax) {
              return;
            }

            // Clear all mocks before each iteration
            jest.clearAllMocks();

            const userId = 'test-user-id';
            const recruiterId = 'test-recruiter-id';
            const companyId = 'test-company-id';
            const jobId = 'test-job-id';

            // Mock recruiter with company
            const mockRecruiter = {
              id: recruiterId,
              user_id: userId,
              company_id: companyId,
              created_at: new Date(),
              updated_at: new Date(),
              companies: {
                id: companyId,
                name: 'Test Company',
                description: 'A test company',
                website: 'https://test.com',
                industry: 'Technology',
                company_type: 'STARTUP',
                location: 'San Francisco',
                recruiter_id: recruiterId,
                created_at: new Date(),
                updated_at: new Date(),
              },
            };

            jest.spyOn(prismaService.recruiters, 'findUnique').mockResolvedValue(mockRecruiter);

            // Mock job creation - capture the data passed to create
            let capturedJobData: any = null;
            jest.spyOn(prismaService.jobs, 'create').mockImplementation(async (args: any) => {
              capturedJobData = args.data;
              return {
                id: jobId,
                ...args.data,
              };
            });

            // Mock skill associations
            jest.spyOn(prismaService.job_skills, 'create').mockResolvedValue({
              id: 'skill-assoc-id',
              job_id: jobId,
              skill_id: 'skill-id',
            } as any);

            // Mock tag associations
            jest.spyOn(prismaService.job_tags, 'create').mockResolvedValue({
              id: 'tag-assoc-id',
              job_id: jobId,
              tag_id: 'tag-id',
            } as any);

            // Mock job retrieval with full details
            const mockJobWithDetails = {
              id: jobId,
              company_id: companyId,
              title,
              description,
              location,
              salary_min: salaryMin ?? null,
              salary_max: salaryMax ?? null,
              job_type: jobType,
              status: 'ACTIVE',
              created_at: new Date(),
              updated_at: new Date(),
              companies: mockRecruiter.companies,
              job_skills: skillIds.map((skillId, idx) => ({
                id: `skill-assoc-${idx}`,
                job_id: jobId,
                skill_id: skillId,
                skills: {
                  id: skillId,
                  name: `Skill ${idx}`,
                  created_at: new Date(),
                },
              })),
              job_tags: tagIds.map((tagId, idx) => ({
                id: `tag-assoc-${idx}`,
                job_id: jobId,
                tag_id: tagId,
                tags: {
                  id: tagId,
                  name: `Tag ${idx}`,
                  created_at: new Date(),
                },
              })),
              applications: [],
            };

            jest.spyOn(prismaService.jobs, 'findUnique').mockResolvedValue(mockJobWithDetails);

            // Create job
            const result = await jobService.createJob(userId, {
              title,
              description,
              location,
              salary_min: salaryMin,
              salary_max: salaryMax,
              job_type: jobType,
              skill_ids: skillIds,
              tag_ids: tagIds,
            });

            // Verify job was created with ACTIVE status
            expect(capturedJobData).toBeDefined();
            expect(capturedJobData.status).toBe('ACTIVE');

            // Verify the returned job has ACTIVE status
            expect(result).toBeDefined();
            expect(result.status).toBe('ACTIVE');

            // Verify recruiter lookup was called
            expect(prismaService.recruiters.findUnique).toHaveBeenCalledWith({
              where: { user_id: userId },
              include: { companies: true },
            });

            // Verify job creation was called
            expect(prismaService.jobs.create).toHaveBeenCalled();
          },
        ),
        { numRuns: 100 },
      );
    }, 30000); // 30 second timeout
  });

  /**
   * Property 18: Job Skill Association
   * 
   * For any set of skill IDs provided during Job creation, those skills SHALL be 
   * associated with the Job and retrievable via job detail queries.
   * 
   * **Validates: Requirements 8.3**
   */
  describe('Property 18: Job skill association', () => {
    it('should associate all provided skills with the job (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 5, maxLength: 100 }), // title
          fc.string({ minLength: 20, maxLength: 500 }), // description
          fc.string({ minLength: 3, maxLength: 100 }), // location
          fc.constantFrom('Full-time', 'Part-time', 'Contract', 'Internship'), // job_type
          fc.array(fc.string({ minLength: 12, maxLength: 24 }), { minLength: 1, maxLength: 10 }), // skill_ids (at least 1)
          async (title, description, location, jobType, skillIds) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            const userId = 'test-user-id';
            const recruiterId = 'test-recruiter-id';
            const companyId = 'test-company-id';
            const jobId = 'test-job-id';

            // Mock recruiter with company
            const mockRecruiter = {
              id: recruiterId,
              user_id: userId,
              company_id: companyId,
              created_at: new Date(),
              updated_at: new Date(),
              companies: {
                id: companyId,
                name: 'Test Company',
                description: 'A test company',
                website: 'https://test.com',
                industry: 'Technology',
                company_type: 'STARTUP',
                location: 'San Francisco',
                recruiter_id: recruiterId,
                created_at: new Date(),
                updated_at: new Date(),
              },
            };

            jest.spyOn(prismaService.recruiters, 'findUnique').mockResolvedValue(mockRecruiter);

            // Mock job creation
            jest.spyOn(prismaService.jobs, 'create').mockResolvedValue({
              id: jobId,
              company_id: companyId,
              title,
              description,
              location,
              salary_min: null,
              salary_max: null,
              job_type: jobType,
              status: 'ACTIVE',
              created_at: new Date(),
              updated_at: new Date(),
            });

            // Track skill associations
            const skillAssociations: any[] = [];
            jest.spyOn(prismaService.job_skills, 'create').mockImplementation(async (args: any) => {
              const association = {
                id: `skill-assoc-${skillAssociations.length}`,
                job_id: args.data.job_id,
                skill_id: args.data.skill_id,
              };
              skillAssociations.push(association);
              return association;
            });

            // Mock job retrieval with skill associations
            const mockJobWithDetails = {
              id: jobId,
              company_id: companyId,
              title,
              description,
              location,
              salary_min: null,
              salary_max: null,
              job_type: jobType,
              status: 'ACTIVE',
              created_at: new Date(),
              updated_at: new Date(),
              companies: mockRecruiter.companies,
              job_skills: skillIds.map((skillId, idx) => ({
                id: `skill-assoc-${idx}`,
                job_id: jobId,
                skill_id: skillId,
                skills: {
                  id: skillId,
                  name: `Skill ${idx}`,
                  created_at: new Date(),
                },
              })),
              job_tags: [],
              applications: [],
            };

            jest.spyOn(prismaService.jobs, 'findUnique').mockResolvedValue(mockJobWithDetails);

            // Create job with skills
            const result = await jobService.createJob(userId, {
              title,
              description,
              location,
              job_type: jobType,
              skill_ids: skillIds,
            });

            // Verify all skills were associated
            expect(prismaService.job_skills.create).toHaveBeenCalledTimes(skillIds.length);

            // Verify each skill ID was used in an association
            skillIds.forEach((skillId) => {
              expect(prismaService.job_skills.create).toHaveBeenCalledWith(
                expect.objectContaining({
                  data: expect.objectContaining({
                    job_id: jobId,
                    skill_id: skillId,
                  }),
                }),
              );
            });

            // Verify the returned job includes all skill associations
            expect(result.job_skills).toBeDefined();
            expect(result.job_skills.length).toBe(skillIds.length);

            // Verify each skill ID is present in the result
            const resultSkillIds = result.job_skills.map((js: any) => js.skill_id);
            skillIds.forEach((skillId) => {
              expect(resultSkillIds).toContain(skillId);
            });
          },
        ),
        { numRuns: 100 },
      );
    }, 30000); // 30 second timeout
  });

  /**
   * Property 19: Job Tag Association
   * 
   * For any set of tag IDs provided during Job creation, those tags SHALL be 
   * associated with the Job and retrievable via job detail queries.
   * 
   * **Validates: Requirements 8.4**
   */
  describe('Property 19: Job tag association', () => {
    it('should associate all provided tags with the job (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 5, maxLength: 100 }), // title
          fc.string({ minLength: 20, maxLength: 500 }), // description
          fc.string({ minLength: 3, maxLength: 100 }), // location
          fc.constantFrom('Full-time', 'Part-time', 'Contract', 'Internship'), // job_type
          fc.array(fc.string({ minLength: 12, maxLength: 24 }), { minLength: 1, maxLength: 10 }), // tag_ids (at least 1)
          async (title, description, location, jobType, tagIds) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            const userId = 'test-user-id';
            const recruiterId = 'test-recruiter-id';
            const companyId = 'test-company-id';
            const jobId = 'test-job-id';

            // Mock recruiter with company
            const mockRecruiter = {
              id: recruiterId,
              user_id: userId,
              company_id: companyId,
              created_at: new Date(),
              updated_at: new Date(),
              companies: {
                id: companyId,
                name: 'Test Company',
                description: 'A test company',
                website: 'https://test.com',
                industry: 'Technology',
                company_type: 'STARTUP',
                location: 'San Francisco',
                recruiter_id: recruiterId,
                created_at: new Date(),
                updated_at: new Date(),
              },
            };

            jest.spyOn(prismaService.recruiters, 'findUnique').mockResolvedValue(mockRecruiter);

            // Mock job creation
            jest.spyOn(prismaService.jobs, 'create').mockResolvedValue({
              id: jobId,
              company_id: companyId,
              title,
              description,
              location,
              salary_min: null,
              salary_max: null,
              job_type: jobType,
              status: 'ACTIVE',
              created_at: new Date(),
              updated_at: new Date(),
            });

            // Track tag associations
            const tagAssociations: any[] = [];
            jest.spyOn(prismaService.job_tags, 'create').mockImplementation(async (args: any) => {
              const association = {
                id: `tag-assoc-${tagAssociations.length}`,
                job_id: args.data.job_id,
                tag_id: args.data.tag_id,
              };
              tagAssociations.push(association);
              return association;
            });

            // Mock skill associations (empty for this test)
            jest.spyOn(prismaService.job_skills, 'create').mockResolvedValue({
              id: 'skill-assoc-id',
              job_id: jobId,
              skill_id: 'skill-id',
            } as any);

            // Mock job retrieval with tag associations
            const mockJobWithDetails = {
              id: jobId,
              company_id: companyId,
              title,
              description,
              location,
              salary_min: null,
              salary_max: null,
              job_type: jobType,
              status: 'ACTIVE',
              created_at: new Date(),
              updated_at: new Date(),
              companies: mockRecruiter.companies,
              job_skills: [],
              job_tags: tagIds.map((tagId, idx) => ({
                id: `tag-assoc-${idx}`,
                job_id: jobId,
                tag_id: tagId,
                tags: {
                  id: tagId,
                  name: `Tag ${idx}`,
                  created_at: new Date(),
                },
              })),
              applications: [],
            };

            jest.spyOn(prismaService.jobs, 'findUnique').mockResolvedValue(mockJobWithDetails);

            // Create job with tags
            const result = await jobService.createJob(userId, {
              title,
              description,
              location,
              job_type: jobType,
              skill_ids: [], // Empty skills for this test
              tag_ids: tagIds,
            });

            // Verify all tags were associated
            expect(prismaService.job_tags.create).toHaveBeenCalledTimes(tagIds.length);

            // Verify each tag ID was used in an association
            tagIds.forEach((tagId) => {
              expect(prismaService.job_tags.create).toHaveBeenCalledWith(
                expect.objectContaining({
                  data: expect.objectContaining({
                    job_id: jobId,
                    tag_id: tagId,
                  }),
                }),
              );
            });

            // Verify the returned job includes all tag associations
            expect(result.job_tags).toBeDefined();
            expect(result.job_tags.length).toBe(tagIds.length);

            // Verify each tag ID is present in the result
            const resultTagIds = result.job_tags.map((jt: any) => jt.tag_id);
            tagIds.forEach((tagId) => {
              expect(resultTagIds).toContain(tagId);
            });
          },
        ),
        { numRuns: 100 },
      );
    }, 30000); // 30 second timeout
  });

  /**
   * Property 24: Job Filtering by City
   * 
   * For any job list filtered by city C, all returned jobs SHALL have location matching C.
   * 
   * **Validates: Requirements 9.2**
   */
  describe('Property 24: Job filtering by city', () => {
    it('should return only jobs matching the specified city (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 3, maxLength: 50 }), // city
          fc.array(
            fc.record({
              id: fc.string({ minLength: 12, maxLength: 24 }),
              title: fc.string({ minLength: 5, maxLength: 100 }),
              location: fc.string({ minLength: 3, maxLength: 100 }),
              status: fc.constant('ACTIVE'),
            }),
            { minLength: 0, maxLength: 50 },
          ), // jobs
          async (city, allJobs) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            // Filter jobs that match the city (case-insensitive)
            const matchingJobs = allJobs.filter((job) =>
              job.location.toLowerCase().includes(city.toLowerCase()),
            );

            // Track the where clause passed to findMany
            let capturedWhereClause: any = null;
            jest.spyOn(prismaService.jobs, 'findMany').mockImplementation(async (args: any) => {
              capturedWhereClause = args.where;
              return matchingJobs;
            });

            jest.spyOn(prismaService.jobs, 'count').mockResolvedValue(matchingJobs.length);

            // Call getJobs with city filter
            const result = await jobService.getJobs({ city });

            // Verify the where clause includes city filter
            expect(capturedWhereClause).toBeDefined();
            expect(capturedWhereClause.location).toEqual({
              contains: city,
              mode: 'insensitive',
            });

            // Verify all returned jobs match the city
            result.data.forEach((job: any) => {
              expect(job.location.toLowerCase()).toContain(city.toLowerCase());
            });
          },
        ),
        { numRuns: 100 },
      );
    }, 30000); // 30 second timeout
  });

  /**
   * Property 25: Job Filtering by Skill
   * 
   * For any job list filtered by skill S, all returned jobs SHALL have S in their required skills.
   * 
   * **Validates: Requirements 9.3**
   */
  describe('Property 25: Job filtering by skill', () => {
    it('should return only jobs requiring the specified skill (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 12, maxLength: 24 }), // skill_id
          async (skillId) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            // Track the where clause passed to findMany
            let capturedWhereClause: any = null;
            jest.spyOn(prismaService.jobs, 'findMany').mockImplementation(async (args: any) => {
              capturedWhereClause = args.where;
              return [];
            });

            jest.spyOn(prismaService.jobs, 'count').mockResolvedValue(0);

            // Call getJobs with skill filter
            await jobService.getJobs({ skill_ids: [skillId] });

            // Verify the where clause includes skill filter
            expect(capturedWhereClause).toBeDefined();
            expect(capturedWhereClause.AND).toBeDefined();
            expect(Array.isArray(capturedWhereClause.AND)).toBe(true);

            // Verify the skill filter is in the AND clause
            const skillFilter = capturedWhereClause.AND.find(
              (condition: any) =>
                condition.job_skills?.some?.skill_id === skillId,
            );
            expect(skillFilter).toBeDefined();
            expect(skillFilter.job_skills.some.skill_id).toBe(skillId);
          },
        ),
        { numRuns: 100 },
      );
    }, 30000); // 30 second timeout
  });

  /**
   * Property 26: Job Filtering by Tag
   * 
   * For any job list filtered by tag T, all returned jobs SHALL have T in their tags.
   * 
   * **Validates: Requirements 9.4**
   */
  describe('Property 26: Job filtering by tag', () => {
    it('should return only jobs with the specified tag (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 12, maxLength: 24 }), // tag_id
          async (tagId) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            // Track the where clause passed to findMany
            let capturedWhereClause: any = null;
            jest.spyOn(prismaService.jobs, 'findMany').mockImplementation(async (args: any) => {
              capturedWhereClause = args.where;
              return [];
            });

            jest.spyOn(prismaService.jobs, 'count').mockResolvedValue(0);

            // Call getJobs with tag filter
            await jobService.getJobs({ tag_ids: [tagId] });

            // Verify the where clause includes tag filter
            expect(capturedWhereClause).toBeDefined();
            expect(capturedWhereClause.AND).toBeDefined();
            expect(Array.isArray(capturedWhereClause.AND)).toBe(true);

            // Verify the tag filter is in the AND clause
            const tagFilter = capturedWhereClause.AND.find(
              (condition: any) =>
                condition.job_tags?.some?.tag_id === tagId,
            );
            expect(tagFilter).toBeDefined();
            expect(tagFilter.job_tags.some.tag_id).toBe(tagId);
          },
        ),
        { numRuns: 100 },
      );
    }, 30000); // 30 second timeout
  });

  /**
   * Property 27: Combined Job Filters Use AND Logic
   * 
   * For any job list filtered by city C, skill S, and tag T, all returned jobs 
   * SHALL match ALL three criteria (C AND S AND T).
   * 
   * **Validates: Requirements 9.5**
   */
  describe('Property 27: Combined filters use AND logic', () => {
    it('should apply AND logic when combining city, skill, and tag filters (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 3, maxLength: 50 }), // city
          fc.array(fc.string({ minLength: 12, maxLength: 24 }), { minLength: 1, maxLength: 3 }), // skill_ids
          fc.array(fc.string({ minLength: 12, maxLength: 24 }), { minLength: 1, maxLength: 3 }), // tag_ids
          async (city, skillIds, tagIds) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            // Track the where clause passed to findMany
            let capturedWhereClause: any = null;
            jest.spyOn(prismaService.jobs, 'findMany').mockImplementation(async (args: any) => {
              capturedWhereClause = args.where;
              return [];
            });

            jest.spyOn(prismaService.jobs, 'count').mockResolvedValue(0);

            // Call getJobs with combined filters
            await jobService.getJobs({
              city,
              skill_ids: skillIds,
              tag_ids: tagIds,
            });

            // Verify the where clause was captured
            expect(capturedWhereClause).toBeDefined();

            // Verify city filter is present
            expect(capturedWhereClause.location).toEqual({
              contains: city,
              mode: 'insensitive',
            });

            // Verify AND clause exists
            expect(capturedWhereClause.AND).toBeDefined();
            expect(Array.isArray(capturedWhereClause.AND)).toBe(true);

            // Verify all skills are in the AND clause
            skillIds.forEach((skillId) => {
              const skillFilter = capturedWhereClause.AND.find(
                (condition: any) =>
                  condition.job_skills?.some?.skill_id === skillId,
              );
              expect(skillFilter).toBeDefined();
            });

            // Verify all tags are in the AND clause
            tagIds.forEach((tagId) => {
              const tagFilter = capturedWhereClause.AND.find(
                (condition: any) =>
                  condition.job_tags?.some?.tag_id === tagId,
              );
              expect(tagFilter).toBeDefined();
            });

            // Verify the total number of AND conditions matches skills + tags
            expect(capturedWhereClause.AND.length).toBe(skillIds.length + tagIds.length);
          },
        ),
        { numRuns: 100 },
      );
    }, 30000); // 30 second timeout
  });

  /**
   * Property 28: Job Keyword Search Case-Insensitive
   * 
   * For any job search with keyword K, jobs with K appearing in title or description 
   * (case-insensitive) SHALL be returned.
   * 
   * **Validates: Requirements 9.6**
   */
  describe('Property 28: Job keyword search case-insensitive', () => {
    it('should perform case-insensitive keyword search in title and description (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 3, maxLength: 20 }), // keyword
          fc.constantFrom('lower', 'upper', 'mixed'), // case variant
          async (keyword, caseVariant) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            // Transform keyword based on case variant
            let searchKeyword = keyword;
            if (caseVariant === 'lower') {
              searchKeyword = keyword.toLowerCase();
            } else if (caseVariant === 'upper') {
              searchKeyword = keyword.toUpperCase();
            } else {
              // Mixed case: alternate upper/lower
              searchKeyword = keyword
                .split('')
                .map((char, idx) => (idx % 2 === 0 ? char.toUpperCase() : char.toLowerCase()))
                .join('');
            }

            // Track the where clause passed to findMany
            let capturedWhereClause: any = null;
            jest.spyOn(prismaService.jobs, 'findMany').mockImplementation(async (args: any) => {
              capturedWhereClause = args.where;
              return [];
            });

            jest.spyOn(prismaService.jobs, 'count').mockResolvedValue(0);

            // Call getJobs with keyword filter
            await jobService.getJobs({ keyword: searchKeyword });

            // Verify the where clause includes keyword filter with case-insensitive mode
            expect(capturedWhereClause).toBeDefined();
            expect(capturedWhereClause.OR).toBeDefined();
            expect(Array.isArray(capturedWhereClause.OR)).toBe(true);
            expect(capturedWhereClause.OR.length).toBe(2);

            // Verify title search is case-insensitive
            const titleFilter = capturedWhereClause.OR.find(
              (condition: any) => condition.title !== undefined,
            );
            expect(titleFilter).toBeDefined();
            expect(titleFilter.title.contains).toBe(searchKeyword);
            expect(titleFilter.title.mode).toBe('insensitive');

            // Verify description search is case-insensitive
            const descriptionFilter = capturedWhereClause.OR.find(
              (condition: any) => condition.description !== undefined,
            );
            expect(descriptionFilter).toBeDefined();
            expect(descriptionFilter.description.contains).toBe(searchKeyword);
            expect(descriptionFilter.description.mode).toBe('insensitive');
          },
        ),
        { numRuns: 100 },
      );
    }, 30000); // 30 second timeout
  });

  /**
   * Property 29: Pagination Default Page Size
   * 
   * For any list endpoint called without pagination parameters, the response 
   * SHALL contain at most 20 items.
   * 
   * **Validates: Requirements 9.1, 27.1**
   */
  describe('Property 29: Pagination default page size', () => {
    it('should use default page size of 20 when no pagination params provided (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 100 }), // total count
          async (totalCount) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            // Track the pagination params passed to findMany
            let capturedTake: number | undefined;
            let capturedSkip: number | undefined;
            jest.spyOn(prismaService.jobs, 'findMany').mockImplementation(async (args: any) => {
              capturedTake = args.take;
              capturedSkip = args.skip;
              return [];
            });

            jest.spyOn(prismaService.jobs, 'count').mockResolvedValue(totalCount);

            // Call getJobs without pagination parameters
            const result = await jobService.getJobs();

            // Verify default pagination was used
            expect(capturedTake).toBe(20);
            expect(capturedSkip).toBe(0);

            // Verify pagination metadata
            expect(result.pagination.per_page).toBe(20);
            expect(result.pagination.current_page).toBe(1);
            expect(result.pagination.total_count).toBe(totalCount);
          },
        ),
        { numRuns: 100 },
      );
    }, 30000); // 30 second timeout
  });

  /**
   * Property 30: Pagination Metadata Completeness
   * 
   * For any paginated list response, the metadata SHALL include current_page, 
   * per_page, total_count, total_pages, has_next_page, and has_previous_page.
   * 
   * **Validates: Requirements 9.7, 27.3, 25.5**
   */
  describe('Property 30: Pagination metadata completeness', () => {
    it('should include all required pagination metadata fields (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 10 }), // page
          fc.integer({ min: 1, max: 100 }), // per_page
          fc.integer({ min: 0, max: 1000 }), // total_count
          async (page, perPage, totalCount) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            jest.spyOn(prismaService.jobs, 'findMany').mockResolvedValue([]);
            jest.spyOn(prismaService.jobs, 'count').mockResolvedValue(totalCount);

            // Call getJobs with pagination parameters
            const result = await jobService.getJobs({ page, per_page: perPage });

            // Verify all required pagination fields are present
            expect(result.pagination).toBeDefined();
            expect(result.pagination.current_page).toBe(page);
            expect(result.pagination.per_page).toBe(perPage);
            expect(result.pagination.total_count).toBe(totalCount);
            expect(result.pagination.total_pages).toBeDefined();
            expect(typeof result.pagination.has_next_page).toBe('boolean');
            expect(typeof result.pagination.has_previous_page).toBe('boolean');

            // Verify pagination logic is correct
            const expectedTotalPages = Math.ceil(totalCount / perPage);
            expect(result.pagination.total_pages).toBe(expectedTotalPages);
            expect(result.pagination.has_next_page).toBe(page < expectedTotalPages);
            expect(result.pagination.has_previous_page).toBe(page > 1);
          },
        ),
        { numRuns: 100 },
      );
    }, 30000); // 30 second timeout
  });

  /**
   * Property 48: Skill Match Percentage Calculation
   * 
   * For any job detail retrieval by a Candidate, the skill_match_percentage SHALL equal 
   * (matched_skills_count / total_required_skills_count) * 100, where matched_skills are 
   * the intersection of Candidate skills and Job required skills.
   * 
   * **Validates: Requirements 26.3**
   */
  describe('Property 48: Skill match percentage calculation', () => {
    it('should calculate correct skill match percentage for candidates (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.string({ minLength: 12, maxLength: 24 }), { minLength: 1, maxLength: 10 }), // job skill IDs
          fc.array(fc.string({ minLength: 12, maxLength: 24 }), { minLength: 0, maxLength: 10 }), // candidate skill IDs
          async (jobSkillIds, candidateSkillIds) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            const userId = 'test-user-id';
            const candidateId = 'test-candidate-id';
            const jobId = 'test-job-id';

            // Calculate expected match
            const matchedSkills = jobSkillIds.filter((skillId) =>
              candidateSkillIds.includes(skillId),
            );
            const expectedPercentage =
              jobSkillIds.length > 0
                ? Math.round((matchedSkills.length / jobSkillIds.length) * 100)
                : 0;

            // Mock job with skills
            const mockJob = {
              id: jobId,
              company_id: 'company-id',
              title: 'Test Job',
              description: 'Test Description',
              location: 'Test Location',
              salary_min: null,
              salary_max: null,
              job_type: 'Full-time',
              status: 'ACTIVE',
              created_at: new Date(),
              updated_at: new Date(),
              companies: {
                id: 'company-id',
                name: 'Test Company',
                description: 'A test company',
                website: 'https://test.com',
                industry: 'Technology',
                company_type: 'STARTUP',
                location: 'San Francisco',
                recruiter_id: 'recruiter-id',
                created_at: new Date(),
                updated_at: new Date(),
                recruiters: {
                  id: 'recruiter-id',
                  user_id: 'recruiter-user-id',
                  company_id: 'company-id',
                  created_at: new Date(),
                  updated_at: new Date(),
                  users: {
                    id: 'recruiter-user-id',
                    email: 'recruiter@test.com',
                    full_name: 'Test Recruiter',
                  },
                },
              },
              job_skills: jobSkillIds.map((skillId, idx) => ({
                id: `job-skill-${idx}`,
                job_id: jobId,
                skill_id: skillId,
                skills: {
                  id: skillId,
                  name: `Skill ${idx}`,
                  created_at: new Date(),
                },
              })),
              job_tags: [],
              applications: [],
            };

            // Mock candidate with skills
            const mockCandidate = {
              id: candidateId,
              user_id: userId,
              phone_number: null,
              bio: null,
              location: null,
              created_at: new Date(),
              updated_at: new Date(),
              candidate_skills: candidateSkillIds.map((skillId, idx) => ({
                id: `candidate-skill-${idx}`,
                candidate_id: candidateId,
                skill_id: skillId,
                skills: {
                  id: skillId,
                  name: `Skill ${idx}`,
                  created_at: new Date(),
                },
              })),
            };

            jest.spyOn(prismaService.jobs, 'findUnique').mockResolvedValue(mockJob);
            jest.spyOn(prismaService.candidates, 'findUnique').mockResolvedValue(mockCandidate);

            // Call getJobById with userId
            const result = await jobService.getJobById(jobId, userId);

            // Verify skill match percentage is calculated correctly
            expect(result).toBeDefined();
            expect(result.skill_match_percentage).toBe(expectedPercentage);

            // Verify the calculation logic
            if (jobSkillIds.length === 0) {
              expect(result.skill_match_percentage).toBe(0);
            } else {
              const actualMatchedCount = matchedSkills.length;
              const actualPercentage = Math.round((actualMatchedCount / jobSkillIds.length) * 100);
              expect(result.skill_match_percentage).toBe(actualPercentage);
            }
          },
        ),
        { numRuns: 100 },
      );
    }, 30000); // 30 second timeout
  });

  /**
   * Property 49: Application Indicator in Job Details
   * 
   * For any job detail retrieval by a Candidate who has already applied, the response 
   * SHALL include an indicator showing the application exists.
   * 
   * **Validates: Requirements 26.4**
   */
  describe('Property 49: Application indicator in job details', () => {
    it('should indicate when candidate has already applied to a job (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.boolean(), // hasApplied
          fc.boolean(), // applicationDeleted
          async (hasApplied, applicationDeleted) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            const userId = 'test-user-id';
            const candidateId = 'test-candidate-id';
            const jobId = 'test-job-id';

            // Mock job with or without application
            const applications = hasApplied
              ? [
                  {
                    id: 'application-id',
                    candidate_id: candidateId,
                    job_id: jobId,
                    cv_id: 'cv-id',
                    status: 'APPLIED',
                    deleted_at: applicationDeleted ? new Date() : null,
                    created_at: new Date(),
                    updated_at: new Date(),
                  },
                ]
              : [];

            const mockJob = {
              id: jobId,
              company_id: 'company-id',
              title: 'Test Job',
              description: 'Test Description',
              location: 'Test Location',
              salary_min: null,
              salary_max: null,
              job_type: 'Full-time',
              status: 'ACTIVE',
              created_at: new Date(),
              updated_at: new Date(),
              companies: {
                id: 'company-id',
                name: 'Test Company',
                description: 'A test company',
                website: 'https://test.com',
                industry: 'Technology',
                company_type: 'STARTUP',
                location: 'San Francisco',
                recruiter_id: 'recruiter-id',
                created_at: new Date(),
                updated_at: new Date(),
                recruiters: {
                  id: 'recruiter-id',
                  user_id: 'recruiter-user-id',
                  company_id: 'company-id',
                  created_at: new Date(),
                  updated_at: new Date(),
                  users: {
                    id: 'recruiter-user-id',
                    email: 'recruiter@test.com',
                    full_name: 'Test Recruiter',
                  },
                },
              },
              job_skills: [],
              job_tags: [],
              applications,
            };

            // Mock candidate
            const mockCandidate = {
              id: candidateId,
              user_id: userId,
              phone_number: null,
              bio: null,
              location: null,
              created_at: new Date(),
              updated_at: new Date(),
              candidate_skills: [],
            };

            jest.spyOn(prismaService.jobs, 'findUnique').mockResolvedValue(mockJob);
            jest.spyOn(prismaService.candidates, 'findUnique').mockResolvedValue(mockCandidate);

            // Call getJobById with userId
            const result = await jobService.getJobById(jobId, userId);

            // Verify has_applied indicator
            expect(result).toBeDefined();
            expect(result.has_applied).toBeDefined();

            // Expected value: true only if application exists AND is not deleted
            const expectedHasApplied = hasApplied && !applicationDeleted;
            expect(result.has_applied).toBe(expectedHasApplied);

            // Verify the logic
            if (hasApplied && !applicationDeleted) {
              expect(result.has_applied).toBe(true);
            } else {
              expect(result.has_applied).toBe(false);
            }
          },
        ),
        { numRuns: 100 },
      );
    }, 30000); // 30 second timeout
  });
});
