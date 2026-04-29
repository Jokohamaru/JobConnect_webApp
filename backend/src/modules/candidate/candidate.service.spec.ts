import { Test, TestingModule } from '@nestjs/testing';
import { CandidateService } from './candidate.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('CandidateService', () => {
  let service: CandidateService;
  let prisma: PrismaService;

  const mockPrismaService = {
    candidates: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    candidate_skills: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
  };

  const mockCandidate = {
    id: 'candidate-123',
    user_id: 'user-123',
    phone_number: '123-456-7890',
    bio: 'Experienced developer',
    location: 'New York',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
    users: {
      id: 'user-123',
      email: 'candidate@example.com',
      full_name: 'John Doe',
      role: 'CANDIDATE',
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01'),
    },
    candidate_skills: [
      {
        id: 'cs-1',
        candidate_id: 'candidate-123',
        skill_id: 'skill-1',
        skills: {
          id: 'skill-1',
          name: 'JavaScript',
          created_at: new Date('2024-01-01'),
        },
      },
    ],
    cvs: [
      {
        id: 'cv-1',
        candidate_id: 'candidate-123',
        file_name: 'resume.pdf',
        file_path: '/uploads/resume.pdf',
        is_default: true,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      },
    ],
    applications: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CandidateService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CandidateService>(CandidateService);
    prisma = module.get<PrismaService>(PrismaService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCandidateProfile', () => {
    it('should return candidate profile with all related data', async () => {
      mockPrismaService.candidates.findUnique.mockResolvedValue(mockCandidate);

      const result = await service.getCandidateProfile('user-123');

      expect(result).toEqual(mockCandidate);
      expect(mockPrismaService.candidates.findUnique).toHaveBeenCalledWith({
        where: { user_id: 'user-123' },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              full_name: true,
              role: true,
              created_at: true,
              updated_at: true,
            },
          },
          candidate_skills: {
            include: {
              skills: true,
            },
          },
          cvs: true,
          applications: {
            include: {
              jobs: {
                include: {
                  companies: true,
                },
              },
            },
          },
        },
      });
    });

    it('should throw NotFoundException when candidate not found', async () => {
      mockPrismaService.candidates.findUnique.mockResolvedValue(null);

      await expect(service.getCandidateProfile('non-existent-user')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getCandidateProfile('non-existent-user')).rejects.toThrow(
        'Candidate profile not found',
      );
    });

    it('should include applications with job and company details', async () => {
      const candidateWithApplications = {
        ...mockCandidate,
        applications: [
          {
            id: 'app-1',
            candidate_id: 'candidate-123',
            job_id: 'job-1',
            cv_id: 'cv-1',
            status: 'APPLIED',
            created_at: new Date('2024-01-15'),
            updated_at: new Date('2024-01-15'),
            jobs: {
              id: 'job-1',
              title: 'Software Engineer',
              description: 'Great opportunity',
              location: 'New York',
              company_id: 'company-1',
              companies: {
                id: 'company-1',
                name: 'Tech Corp',
                industry: 'Technology',
              },
            },
          },
        ],
      };

      mockPrismaService.candidates.findUnique.mockResolvedValue(
        candidateWithApplications,
      );

      const result = await service.getCandidateProfile('user-123');

      expect(result.applications).toHaveLength(1);
      expect(result.applications[0].jobs.title).toBe('Software Engineer');
      expect(result.applications[0].jobs.companies.name).toBe('Tech Corp');
    });

    it('should handle candidate with no skills, CVs, or applications', async () => {
      const emptyCandidate = {
        ...mockCandidate,
        candidate_skills: [],
        cvs: [],
        applications: [],
      };

      mockPrismaService.candidates.findUnique.mockResolvedValue(emptyCandidate);

      const result = await service.getCandidateProfile('user-123');

      expect(result.candidate_skills).toHaveLength(0);
      expect(result.cvs).toHaveLength(0);
      expect(result.applications).toHaveLength(0);
    });

    it('should include multiple skills', async () => {
      const candidateWithMultipleSkills = {
        ...mockCandidate,
        candidate_skills: [
          {
            id: 'cs-1',
            candidate_id: 'candidate-123',
            skill_id: 'skill-1',
            skills: { id: 'skill-1', name: 'JavaScript', created_at: new Date() },
          },
          {
            id: 'cs-2',
            candidate_id: 'candidate-123',
            skill_id: 'skill-2',
            skills: { id: 'skill-2', name: 'TypeScript', created_at: new Date() },
          },
          {
            id: 'cs-3',
            candidate_id: 'candidate-123',
            skill_id: 'skill-3',
            skills: { id: 'skill-3', name: 'React', created_at: new Date() },
          },
        ],
      };

      mockPrismaService.candidates.findUnique.mockResolvedValue(
        candidateWithMultipleSkills,
      );

      const result = await service.getCandidateProfile('user-123');

      expect(result.candidate_skills).toHaveLength(3);
      expect(result.candidate_skills.map((cs) => cs.skills.name)).toEqual([
        'JavaScript',
        'TypeScript',
        'React',
      ]);
    });
  });

  describe('getCandidateById', () => {
    it('should return candidate by ID', async () => {
      const candidateWithoutApplications = {
        ...mockCandidate,
      };
      delete candidateWithoutApplications.applications;

      mockPrismaService.candidates.findUnique.mockResolvedValue(
        candidateWithoutApplications,
      );

      const result = await service.getCandidateById('candidate-123');

      expect(result).toEqual(candidateWithoutApplications);
      expect(mockPrismaService.candidates.findUnique).toHaveBeenCalledWith({
        where: { id: 'candidate-123' },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              full_name: true,
              role: true,
              created_at: true,
              updated_at: true,
            },
          },
          candidate_skills: {
            include: {
              skills: true,
            },
          },
          cvs: true,
        },
      });
    });

    it('should throw NotFoundException when candidate not found', async () => {
      mockPrismaService.candidates.findUnique.mockResolvedValue(null);

      await expect(service.getCandidateById('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getCandidateById('non-existent-id')).rejects.toThrow(
        'Candidate not found',
      );
    });

    it('should not include applications in getCandidateById', async () => {
      const candidateData = { ...mockCandidate };
      delete candidateData.applications;

      mockPrismaService.candidates.findUnique.mockResolvedValue(candidateData);

      const result = await service.getCandidateById('candidate-123');

      expect(result).not.toHaveProperty('applications');
      expect(result).toHaveProperty('candidate_skills');
      expect(result).toHaveProperty('cvs');
    });
  });

  describe('updateCandidateProfile', () => {
    const updateDto: UpdateCandidateDto = {
      phone_number: '987-654-3210',
      bio: 'Updated bio',
      location: 'San Francisco',
    };

    it('should update candidate profile successfully', async () => {
      const updatedCandidate = {
        ...mockCandidate,
        ...updateDto,
        updated_at: new Date(),
      };

      mockPrismaService.candidates.findUnique.mockResolvedValue(mockCandidate);
      mockPrismaService.candidates.update.mockResolvedValue(updatedCandidate);

      const result = await service.updateCandidateProfile(
        'user-123',
        'candidate-123',
        updateDto,
      );

      expect(result.phone_number).toBe(updateDto.phone_number);
      expect(result.bio).toBe(updateDto.bio);
      expect(result.location).toBe(updateDto.location);
      expect(mockPrismaService.candidates.update).toHaveBeenCalledWith({
        where: { id: 'candidate-123' },
        data: {
          phone_number: updateDto.phone_number,
          bio: updateDto.bio,
          location: updateDto.location,
          updated_at: expect.any(Date),
        },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              full_name: true,
              role: true,
              created_at: true,
              updated_at: true,
            },
          },
          candidate_skills: {
            include: {
              skills: true,
            },
          },
          cvs: true,
        },
      });
    });

    it('should throw NotFoundException when candidate not found', async () => {
      mockPrismaService.candidates.findUnique.mockResolvedValue(null);

      await expect(
        service.updateCandidateProfile('user-123', 'non-existent-id', updateDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updateCandidateProfile('user-123', 'non-existent-id', updateDto),
      ).rejects.toThrow('Candidate profile not found');
    });

    it('should throw ForbiddenException when user does not own profile', async () => {
      const otherUserCandidate = {
        ...mockCandidate,
        user_id: 'other-user-id',
      };

      mockPrismaService.candidates.findUnique.mockResolvedValue(
        otherUserCandidate,
      );

      await expect(
        service.updateCandidateProfile('user-123', 'candidate-123', updateDto),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.updateCandidateProfile('user-123', 'candidate-123', updateDto),
      ).rejects.toThrow('You do not have permission to update this profile');
    });

    it('should update candidate profile with skills', async () => {
      const updateDtoWithSkills: UpdateCandidateDto = {
        ...updateDto,
        skill_ids: ['skill-1', 'skill-2', 'skill-3'],
      };

      const updatedCandidate = {
        ...mockCandidate,
        ...updateDto,
        candidate_skills: [
          {
            id: 'cs-1',
            candidate_id: 'candidate-123',
            skill_id: 'skill-1',
            skills: { id: 'skill-1', name: 'JavaScript', created_at: new Date() },
          },
          {
            id: 'cs-2',
            candidate_id: 'candidate-123',
            skill_id: 'skill-2',
            skills: { id: 'skill-2', name: 'TypeScript', created_at: new Date() },
          },
          {
            id: 'cs-3',
            candidate_id: 'candidate-123',
            skill_id: 'skill-3',
            skills: { id: 'skill-3', name: 'React', created_at: new Date() },
          },
        ],
      };

      mockPrismaService.candidates.findUnique
        .mockResolvedValueOnce(mockCandidate) // First call for ownership check
        .mockResolvedValueOnce(updatedCandidate); // Second call after skill update
      mockPrismaService.candidates.update.mockResolvedValue(updatedCandidate);
      mockPrismaService.candidate_skills.deleteMany.mockResolvedValue({
        count: 1,
      });
      mockPrismaService.candidate_skills.createMany.mockResolvedValue({
        count: 3,
      });

      const result = await service.updateCandidateProfile(
        'user-123',
        'candidate-123',
        updateDtoWithSkills,
      );

      expect(result.candidate_skills).toHaveLength(3);
      expect(mockPrismaService.candidate_skills.deleteMany).toHaveBeenCalledWith({
        where: { candidate_id: 'candidate-123' },
      });
      expect(mockPrismaService.candidate_skills.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            candidate_id: 'candidate-123',
            skill_id: 'skill-1',
          }),
          expect.objectContaining({
            candidate_id: 'candidate-123',
            skill_id: 'skill-2',
          }),
          expect.objectContaining({
            candidate_id: 'candidate-123',
            skill_id: 'skill-3',
          }),
        ]),
      });
    });

    it('should handle partial updates', async () => {
      const partialUpdate: UpdateCandidateDto = {
        bio: 'Only updating bio',
      };

      const updatedCandidate = {
        ...mockCandidate,
        bio: partialUpdate.bio,
        updated_at: new Date(),
      };

      mockPrismaService.candidates.findUnique.mockResolvedValue(mockCandidate);
      mockPrismaService.candidates.update.mockResolvedValue(updatedCandidate);

      const result = await service.updateCandidateProfile(
        'user-123',
        'candidate-123',
        partialUpdate,
      );

      expect(result.bio).toBe(partialUpdate.bio);
      expect(result.phone_number).toBe(mockCandidate.phone_number);
      expect(result.location).toBe(mockCandidate.location);
      expect(mockPrismaService.candidates.update).toHaveBeenCalledWith({
        where: { id: 'candidate-123' },
        data: {
          bio: partialUpdate.bio,
          updated_at: expect.any(Date),
        },
        include: expect.any(Object),
      });
    });

    it('should not update skills when skill_ids is undefined', async () => {
      const updateDtoWithoutSkills: UpdateCandidateDto = {
        phone_number: '555-1234',
        bio: 'New bio',
      };

      const updatedCandidate = {
        ...mockCandidate,
        ...updateDtoWithoutSkills,
      };

      mockPrismaService.candidates.findUnique.mockResolvedValue(mockCandidate);
      mockPrismaService.candidates.update.mockResolvedValue(updatedCandidate);

      await service.updateCandidateProfile(
        'user-123',
        'candidate-123',
        updateDtoWithoutSkills,
      );

      expect(mockPrismaService.candidate_skills.deleteMany).not.toHaveBeenCalled();
      expect(mockPrismaService.candidate_skills.createMany).not.toHaveBeenCalled();
    });

    it('should not update skills when skill_ids is empty array', async () => {
      const updateDtoWithEmptySkills: UpdateCandidateDto = {
        phone_number: '555-1234',
        skill_ids: [],
      };

      const updatedCandidate = {
        ...mockCandidate,
        phone_number: updateDtoWithEmptySkills.phone_number,
      };

      mockPrismaService.candidates.findUnique.mockResolvedValue(mockCandidate);
      mockPrismaService.candidates.update.mockResolvedValue(updatedCandidate);

      await service.updateCandidateProfile(
        'user-123',
        'candidate-123',
        updateDtoWithEmptySkills,
      );

      expect(mockPrismaService.candidate_skills.deleteMany).not.toHaveBeenCalled();
      expect(mockPrismaService.candidate_skills.createMany).not.toHaveBeenCalled();
    });

    it('should replace existing skills with new skills', async () => {
      const updateDtoWithNewSkills: UpdateCandidateDto = {
        skill_ids: ['skill-4', 'skill-5'],
      };

      const updatedCandidate = {
        ...mockCandidate,
        candidate_skills: [
          {
            id: 'cs-4',
            candidate_id: 'candidate-123',
            skill_id: 'skill-4',
            skills: { id: 'skill-4', name: 'Python', created_at: new Date() },
          },
          {
            id: 'cs-5',
            candidate_id: 'candidate-123',
            skill_id: 'skill-5',
            skills: { id: 'skill-5', name: 'Django', created_at: new Date() },
          },
        ],
      };

      mockPrismaService.candidates.findUnique
        .mockResolvedValueOnce(mockCandidate)
        .mockResolvedValueOnce(updatedCandidate);
      mockPrismaService.candidates.update.mockResolvedValue(mockCandidate);
      mockPrismaService.candidate_skills.deleteMany.mockResolvedValue({
        count: 1,
      });
      mockPrismaService.candidate_skills.createMany.mockResolvedValue({
        count: 2,
      });

      const result = await service.updateCandidateProfile(
        'user-123',
        'candidate-123',
        updateDtoWithNewSkills,
      );

      expect(result.candidate_skills).toHaveLength(2);
      expect(result.candidate_skills[0].skills.name).toBe('Python');
      expect(result.candidate_skills[1].skills.name).toBe('Django');
      expect(mockPrismaService.candidate_skills.deleteMany).toHaveBeenCalledTimes(
        1,
      );
      expect(mockPrismaService.candidate_skills.createMany).toHaveBeenCalledTimes(
        1,
      );
    });

    it('should update timestamp on profile update', async () => {
      const beforeUpdate = new Date('2024-01-01');
      const afterUpdate = new Date('2024-01-15');

      const candidateBeforeUpdate = {
        ...mockCandidate,
        updated_at: beforeUpdate,
      };

      const candidateAfterUpdate = {
        ...mockCandidate,
        ...updateDto,
        updated_at: afterUpdate,
      };

      mockPrismaService.candidates.findUnique.mockResolvedValue(
        candidateBeforeUpdate,
      );
      mockPrismaService.candidates.update.mockResolvedValue(
        candidateAfterUpdate,
      );

      const result = await service.updateCandidateProfile(
        'user-123',
        'candidate-123',
        updateDto,
      );

      expect(result.updated_at).toEqual(afterUpdate);
      expect(result.updated_at.getTime()).toBeGreaterThan(
        beforeUpdate.getTime(),
      );
    });
  });
});
