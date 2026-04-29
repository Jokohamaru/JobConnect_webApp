import { Test, TestingModule } from '@nestjs/testing';
import * as fc from 'fast-check';
import { CandidateService } from './candidate.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException } from '@nestjs/common';

/**
 * Property-Based Tests for Candidate Profile Management
 * 
 * **Validates: Requirements 5.1, 5.2, 5.4, 5.6**
 * 
 * These tests verify candidate profile management properties using fast-check with minimum 100 iterations.
 */
describe('CandidateService - Property-Based Tests', () => {
  let candidateService: CandidateService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CandidateService,
        {
          provide: PrismaService,
          useValue: {
            candidates: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            candidate_skills: {
              deleteMany: jest.fn(),
              createMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    candidateService = module.get<CandidateService>(CandidateService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 9: Candidate Profile Update Authorization
   * 
   * For any Candidate profile update request, if the authenticated user's ID matches
   * the profile's user_id, the update SHALL succeed; otherwise, it SHALL fail with 403 Forbidden.
   * 
   * **Validates: Requirements 5.1, 5.6**
   */
  describe('Property 9: Candidate profile update authorization', () => {
    it('should allow updates when authenticated user owns the profile (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
          fc.option(fc.string({ minLength: 1, maxLength: 500 }), { nil: undefined }),
          fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
          async (userId, phoneNumber, bio, location) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            const candidateId = 'candidate-' + Math.random();

            // Mock candidate that belongs to the authenticated user
            const mockCandidate = {
              id: candidateId,
              user_id: userId,
              phone_number: 'old-phone',
              bio: 'old-bio',
              location: 'old-location',
              created_at: new Date(),
              updated_at: new Date(),
            };

            const updatedCandidate = {
              ...mockCandidate,
              phone_number: phoneNumber !== undefined ? phoneNumber : mockCandidate.phone_number,
              bio: bio !== undefined ? bio : mockCandidate.bio,
              location: location !== undefined ? location : mockCandidate.location,
              updated_at: new Date(),
              users: {
                id: userId,
                email: 'test@example.com',
                full_name: 'Test User',
                role: 'CANDIDATE',
                created_at: new Date(),
                updated_at: new Date(),
              },
              candidate_skills: [],
              cvs: [],
            };

            jest.spyOn(prismaService.candidates, 'findUnique')
              .mockResolvedValueOnce(mockCandidate);
            jest.spyOn(prismaService.candidates, 'update').mockResolvedValue(updatedCandidate);

            // Update should succeed
            const result = await candidateService.updateCandidateProfile(
              userId,
              candidateId,
              { phone_number: phoneNumber, bio, location },
            );

            expect(result).toBeDefined();
            expect(result.user_id).toBe(userId);

            // Verify findUnique was called to check ownership
            expect(prismaService.candidates.findUnique).toHaveBeenCalledWith({
              where: { id: candidateId },
            });

            // Verify update was called
            expect(prismaService.candidates.update).toHaveBeenCalledWith({
              where: { id: candidateId },
              data: expect.objectContaining({
                updated_at: expect.any(Date),
              }),
              include: expect.any(Object),
            });
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should reject updates when authenticated user does not own the profile (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
          async (authenticatedUserId, profileOwnerId, phoneNumber) => {
            // Ensure the user IDs are different
            fc.pre(authenticatedUserId !== profileOwnerId);

            // Clear all mocks before each iteration
            jest.clearAllMocks();

            const candidateId = 'candidate-' + Math.random();

            // Mock candidate that belongs to a different user
            const mockCandidate = {
              id: candidateId,
              user_id: profileOwnerId,
              phone_number: 'old-phone',
              bio: 'old-bio',
              location: 'old-location',
              created_at: new Date(),
              updated_at: new Date(),
            };

            jest.spyOn(prismaService.candidates, 'findUnique').mockResolvedValue(mockCandidate);

            // Update should fail with 403 Forbidden
            await expect(
              candidateService.updateCandidateProfile(
                authenticatedUserId,
                candidateId,
                { phone_number: phoneNumber },
              ),
            ).rejects.toThrow(ForbiddenException);

            await expect(
              candidateService.updateCandidateProfile(
                authenticatedUserId,
                candidateId,
                { phone_number: phoneNumber },
              ),
            ).rejects.toThrow('You do not have permission to update this profile');

            // Verify findUnique was called to check ownership
            expect(prismaService.candidates.findUnique).toHaveBeenCalledWith({
              where: { id: candidateId },
            });

            // Verify update was NOT called
            expect(prismaService.candidates.update).not.toHaveBeenCalled();
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 10: Candidate Profile Persistence
   * 
   * For any Candidate profile update with fields (phone_number, bio, location),
   * the updated values SHALL be persisted and retrievable in subsequent profile queries.
   * 
   * **Validates: Requirements 5.2, 5.4**
   */
  describe('Property 10: Candidate profile persistence', () => {
    it('should persist all updated fields and make them retrievable (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
          fc.option(fc.string({ minLength: 1, maxLength: 500 }), { nil: undefined }),
          fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
          async (userId, phoneNumber, bio, location) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            const candidateId = 'candidate-' + Math.random();

            // Mock candidate before update
            const mockCandidateBefore = {
              id: candidateId,
              user_id: userId,
              phone_number: 'old-phone',
              bio: 'old-bio',
              location: 'old-location',
              created_at: new Date(),
              updated_at: new Date(),
            };

            // Mock candidate after update with new values
            const mockCandidateAfter = {
              id: candidateId,
              user_id: userId,
              phone_number: phoneNumber !== undefined ? phoneNumber : mockCandidateBefore.phone_number,
              bio: bio !== undefined ? bio : mockCandidateBefore.bio,
              location: location !== undefined ? location : mockCandidateBefore.location,
              created_at: mockCandidateBefore.created_at,
              updated_at: new Date(),
              users: {
                id: userId,
                email: 'test@example.com',
                full_name: 'Test User',
                role: 'CANDIDATE',
                created_at: new Date(),
                updated_at: new Date(),
              },
              candidate_skills: [],
              cvs: [],
            };

            // First call returns the candidate for ownership check
            jest.spyOn(prismaService.candidates, 'findUnique')
              .mockResolvedValueOnce(mockCandidateBefore);

            jest.spyOn(prismaService.candidates, 'update').mockResolvedValue(mockCandidateAfter);

            // Perform update
            const updateDto: any = {};
            if (phoneNumber !== undefined) updateDto.phone_number = phoneNumber;
            if (bio !== undefined) updateDto.bio = bio;
            if (location !== undefined) updateDto.location = location;

            const result = await candidateService.updateCandidateProfile(
              userId,
              candidateId,
              updateDto,
            );

            // Verify the result contains the updated values
            expect(result).toBeDefined();
            expect(result.id).toBe(candidateId);
            expect(result.user_id).toBe(userId);

            // Verify each field was persisted correctly
            if (phoneNumber !== undefined) {
              expect(result.phone_number).toBe(phoneNumber);
            }
            if (bio !== undefined) {
              expect(result.bio).toBe(bio);
            }
            if (location !== undefined) {
              expect(result.location).toBe(location);
            }

            // Verify update was called with the correct data
            expect(prismaService.candidates.update).toHaveBeenCalledWith({
              where: { id: candidateId },
              data: expect.objectContaining({
                ...updateDto,
                updated_at: expect.any(Date),
              }),
              include: expect.any(Object),
            });

            // Verify the updated_at timestamp was updated
            expect(result.updated_at).toBeDefined();
            expect(result.updated_at.getTime()).toBeGreaterThanOrEqual(mockCandidateBefore.updated_at.getTime());
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should persist skill associations when skill_ids are provided (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
          async (userId, skillIds) => {
            // Clear all mocks before each iteration
            jest.clearAllMocks();

            const candidateId = 'candidate-' + Math.random();

            // Mock candidate
            const mockCandidate = {
              id: candidateId,
              user_id: userId,
              phone_number: 'phone',
              bio: 'bio',
              location: 'location',
              created_at: new Date(),
              updated_at: new Date(),
            };

            const mockCandidateWithSkills = {
              ...mockCandidate,
              updated_at: new Date(),
              users: {
                id: userId,
                email: 'test@example.com',
                full_name: 'Test User',
                role: 'CANDIDATE',
                created_at: new Date(),
                updated_at: new Date(),
              },
              candidate_skills: skillIds.map((skillId, index) => ({
                id: `cs-${index}`,
                candidate_id: candidateId,
                skill_id: skillId,
                skills: {
                  id: skillId,
                  name: `Skill ${index}`,
                  created_at: new Date(),
                },
              })),
              cvs: [],
            };

            jest.spyOn(prismaService.candidates, 'findUnique')
              .mockResolvedValueOnce(mockCandidate)
              .mockResolvedValueOnce(mockCandidateWithSkills);

            jest.spyOn(prismaService.candidates, 'update').mockResolvedValue({
              ...mockCandidate,
              updated_at: new Date(),
              users: mockCandidateWithSkills.users,
              candidate_skills: [],
              cvs: [],
            });

            jest.spyOn(prismaService.candidate_skills, 'deleteMany').mockResolvedValue({ count: 0 });
            jest.spyOn(prismaService.candidate_skills, 'createMany').mockResolvedValue({ count: skillIds.length });

            // Perform update with skill_ids
            const result = await candidateService.updateCandidateProfile(
              userId,
              candidateId,
              { skill_ids: skillIds },
            );

            // Verify the result contains the skills
            expect(result).toBeDefined();
            expect(result.candidate_skills).toBeDefined();
            expect(Array.isArray(result.candidate_skills)).toBe(true);
            expect(result.candidate_skills.length).toBe(skillIds.length);

            // Verify old skills were deleted
            expect(prismaService.candidate_skills.deleteMany).toHaveBeenCalledWith({
              where: { candidate_id: candidateId },
            });

            // Verify new skills were created
            expect(prismaService.candidate_skills.createMany).toHaveBeenCalledWith({
              data: expect.arrayContaining(
                skillIds.map((skillId) =>
                  expect.objectContaining({
                    candidate_id: candidateId,
                    skill_id: skillId,
                    id: expect.any(String),
                  }),
                ),
              ),
            });

            // Verify findUnique was called again to fetch updated candidate with skills
            expect(prismaService.candidates.findUnique).toHaveBeenCalledTimes(2);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 11: Candidate Skill Association
   * 
   * For any set of skill IDs added to a Candidate profile, those skills SHALL be
   * associated with the Candidate and retrievable via profile queries.
   * 
   * **Validates: Requirements 5.3, 5.4**
   */
  describe('Property 11: Candidate skill association', () => {
    it('should associate all provided skills with the candidate (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 10 }),
          async (userId, skillIds) => {
            // Ensure unique skill IDs
            const uniqueSkillIds = [...new Set(skillIds)];
            fc.pre(uniqueSkillIds.length > 0);

            // Clear all mocks before each iteration
            jest.clearAllMocks();

            const candidateId = 'candidate-' + Math.random();

            // Mock candidate
            const mockCandidate = {
              id: candidateId,
              user_id: userId,
              phone_number: 'phone',
              bio: 'bio',
              location: 'location',
              created_at: new Date(),
              updated_at: new Date(),
            };

            // Mock candidate with associated skills
            const mockCandidateWithSkills = {
              ...mockCandidate,
              updated_at: new Date(),
              users: {
                id: userId,
                email: 'test@example.com',
                full_name: 'Test User',
                role: 'CANDIDATE',
                created_at: new Date(),
                updated_at: new Date(),
              },
              candidate_skills: uniqueSkillIds.map((skillId, index) => ({
                id: `cs-${index}`,
                candidate_id: candidateId,
                skill_id: skillId,
                skills: {
                  id: skillId,
                  name: `Skill ${index}`,
                  created_at: new Date(),
                },
              })),
              cvs: [],
            };

            jest.spyOn(prismaService.candidates, 'findUnique')
              .mockResolvedValueOnce(mockCandidate)
              .mockResolvedValueOnce(mockCandidateWithSkills);

            jest.spyOn(prismaService.candidates, 'update').mockResolvedValue({
              ...mockCandidate,
              updated_at: new Date(),
              users: mockCandidateWithSkills.users,
              candidate_skills: [],
              cvs: [],
            });

            jest.spyOn(prismaService.candidate_skills, 'deleteMany').mockResolvedValue({ count: 0 });
            jest.spyOn(prismaService.candidate_skills, 'createMany').mockResolvedValue({ count: uniqueSkillIds.length });

            // Add skills to candidate profile
            const result = await candidateService.updateCandidateProfile(
              userId,
              candidateId,
              { skill_ids: uniqueSkillIds },
            );

            // Verify all skills are associated with the candidate
            expect(result).toBeDefined();
            expect(result.candidate_skills).toBeDefined();
            expect(Array.isArray(result.candidate_skills)).toBe(true);
            expect(result.candidate_skills.length).toBe(uniqueSkillIds.length);

            // Verify each skill ID is present in the result
            const resultSkillIds = result.candidate_skills.map((cs: any) => cs.skill_id);
            for (const skillId of uniqueSkillIds) {
              expect(resultSkillIds).toContain(skillId);
            }

            // Verify createMany was called with all skill IDs
            expect(prismaService.candidate_skills.createMany).toHaveBeenCalledWith({
              data: expect.arrayContaining(
                uniqueSkillIds.map((skillId) =>
                  expect.objectContaining({
                    candidate_id: candidateId,
                    skill_id: skillId,
                  }),
                ),
              ),
            });

            // Verify the skills are retrievable via profile query
            expect(prismaService.candidates.findUnique).toHaveBeenCalledWith(
              expect.objectContaining({
                where: { id: candidateId },
                include: expect.objectContaining({
                  candidate_skills: expect.objectContaining({
                    include: expect.objectContaining({
                      skills: true,
                    }),
                  }),
                }),
              }),
            );
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should replace existing skills when new skill_ids are provided (minimum 100 iterations)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
          fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
          async (userId, oldSkillIds, newSkillIds) => {
            // Ensure unique skill IDs
            const uniqueOldSkillIds = [...new Set(oldSkillIds)];
            const uniqueNewSkillIds = [...new Set(newSkillIds)];
            fc.pre(uniqueOldSkillIds.length > 0 && uniqueNewSkillIds.length > 0);

            // Clear all mocks before each iteration
            jest.clearAllMocks();

            const candidateId = 'candidate-' + Math.random();

            // Mock candidate with old skills
            const mockCandidateWithOldSkills = {
              id: candidateId,
              user_id: userId,
              phone_number: 'phone',
              bio: 'bio',
              location: 'location',
              created_at: new Date(),
              updated_at: new Date(),
              users: {
                id: userId,
                email: 'test@example.com',
                full_name: 'Test User',
                role: 'CANDIDATE',
                created_at: new Date(),
                updated_at: new Date(),
              },
              candidate_skills: uniqueOldSkillIds.map((skillId, index) => ({
                id: `old-cs-${index}`,
                candidate_id: candidateId,
                skill_id: skillId,
                skills: {
                  id: skillId,
                  name: `Old Skill ${index}`,
                  created_at: new Date(),
                },
              })),
              cvs: [],
            };

            // Mock candidate with new skills
            const mockCandidateWithNewSkills = {
              ...mockCandidateWithOldSkills,
              updated_at: new Date(),
              candidate_skills: uniqueNewSkillIds.map((skillId, index) => ({
                id: `new-cs-${index}`,
                candidate_id: candidateId,
                skill_id: skillId,
                skills: {
                  id: skillId,
                  name: `New Skill ${index}`,
                  created_at: new Date(),
                },
              })),
            };

            jest.spyOn(prismaService.candidates, 'findUnique')
              .mockResolvedValueOnce(mockCandidateWithOldSkills)
              .mockResolvedValueOnce(mockCandidateWithNewSkills);

            jest.spyOn(prismaService.candidates, 'update').mockResolvedValue({
              ...mockCandidateWithOldSkills,
              updated_at: new Date(),
              candidate_skills: [],
            });

            jest.spyOn(prismaService.candidate_skills, 'deleteMany').mockResolvedValue({ count: uniqueOldSkillIds.length });
            jest.spyOn(prismaService.candidate_skills, 'createMany').mockResolvedValue({ count: uniqueNewSkillIds.length });

            // Update skills
            const result = await candidateService.updateCandidateProfile(
              userId,
              candidateId,
              { skill_ids: uniqueNewSkillIds },
            );

            // Verify old skills were deleted
            expect(prismaService.candidate_skills.deleteMany).toHaveBeenCalledWith({
              where: { candidate_id: candidateId },
            });

            // Verify new skills were created
            expect(prismaService.candidate_skills.createMany).toHaveBeenCalledWith({
              data: expect.arrayContaining(
                uniqueNewSkillIds.map((skillId) =>
                  expect.objectContaining({
                    candidate_id: candidateId,
                    skill_id: skillId,
                  }),
                ),
              ),
            });

            // Verify result contains only new skills
            expect(result.candidate_skills.length).toBe(uniqueNewSkillIds.length);
            const resultSkillIds = result.candidate_skills.map((cs: any) => cs.skill_id);
            for (const skillId of uniqueNewSkillIds) {
              expect(resultSkillIds).toContain(skillId);
            }

            // Verify old skills are not in the result
            for (const oldSkillId of uniqueOldSkillIds) {
              if (!uniqueNewSkillIds.includes(oldSkillId)) {
                expect(resultSkillIds).not.toContain(oldSkillId);
              }
            }
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
