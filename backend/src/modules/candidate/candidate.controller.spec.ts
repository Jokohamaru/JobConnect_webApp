import { Test, TestingModule } from '@nestjs/testing';
import { CandidateController } from './candidate.controller';
import { CandidateService } from './candidate.service';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('CandidateController', () => {
  let controller: CandidateController;
  let service: CandidateService;

  const mockCandidateService = {
    getCandidateProfile: jest.fn(),
    getCandidateById: jest.fn(),
    updateCandidateProfile: jest.fn(),
  };

  const mockUser = {
    userId: 'user-123',
    email: 'candidate@example.com',
    role: 'CANDIDATE',
  };

  const mockCandidate = {
    id: 'candidate-123',
    user_id: 'user-123',
    phone_number: '123-456-7890',
    bio: 'Experienced developer',
    location: 'New York',
    created_at: new Date(),
    updated_at: new Date(),
    users: {
      id: 'user-123',
      email: 'candidate@example.com',
      full_name: 'John Doe',
      role: 'CANDIDATE',
      created_at: new Date(),
      updated_at: new Date(),
    },
    candidate_skills: [
      {
        id: 'cs-1',
        candidate_id: 'candidate-123',
        skill_id: 'skill-1',
        skills: {
          id: 'skill-1',
          name: 'JavaScript',
          created_at: new Date(),
        },
      },
    ],
    cvs: [],
    applications: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CandidateController],
      providers: [
        {
          provide: CandidateService,
          useValue: mockCandidateService,
        },
      ],
    }).compile();

    controller = module.get<CandidateController>(CandidateController);
    service = module.get<CandidateService>(CandidateService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyProfile', () => {
    it('should return candidate profile for authenticated user', async () => {
      mockCandidateService.getCandidateProfile.mockResolvedValue(mockCandidate);

      const result = await controller.getMyProfile(mockUser);

      expect(result).toEqual(mockCandidate);
      expect(mockCandidateService.getCandidateProfile).toHaveBeenCalledWith(
        mockUser.userId,
      );
      expect(mockCandidateService.getCandidateProfile).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when candidate profile not found', async () => {
      mockCandidateService.getCandidateProfile.mockRejectedValue(
        new NotFoundException('Candidate profile not found'),
      );

      await expect(controller.getMyProfile(mockUser)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockCandidateService.getCandidateProfile).toHaveBeenCalledWith(
        mockUser.userId,
      );
    });

    it('should include skills, CVs, and applications in profile', async () => {
      const profileWithData = {
        ...mockCandidate,
        cvs: [
          {
            id: 'cv-1',
            candidate_id: 'candidate-123',
            file_name: 'resume.pdf',
            file_path: '/uploads/resume.pdf',
            is_default: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        applications: [
          {
            id: 'app-1',
            candidate_id: 'candidate-123',
            job_id: 'job-1',
            cv_id: 'cv-1',
            status: 'APPLIED',
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
      };

      mockCandidateService.getCandidateProfile.mockResolvedValue(
        profileWithData,
      );

      const result = await controller.getMyProfile(mockUser);

      expect(result).toEqual(profileWithData);
      expect(result.cvs).toHaveLength(1);
      expect(result.applications).toHaveLength(1);
      expect(result.candidate_skills).toHaveLength(1);
    });
  });

  describe('updateMyProfile', () => {
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

      mockCandidateService.getCandidateProfile.mockResolvedValue(mockCandidate);
      mockCandidateService.updateCandidateProfile.mockResolvedValue(
        updatedCandidate,
      );

      const result = await controller.updateMyProfile(mockUser, updateDto);

      expect(result).toEqual(updatedCandidate);
      expect(mockCandidateService.getCandidateProfile).toHaveBeenCalledWith(
        mockUser.userId,
      );
      expect(mockCandidateService.updateCandidateProfile).toHaveBeenCalledWith(
        mockUser.userId,
        mockCandidate.id,
        updateDto,
      );
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

      mockCandidateService.getCandidateProfile.mockResolvedValue(mockCandidate);
      mockCandidateService.updateCandidateProfile.mockResolvedValue(
        updatedCandidate,
      );

      const result = await controller.updateMyProfile(
        mockUser,
        updateDtoWithSkills,
      );

      expect(result.candidate_skills).toHaveLength(3);
      expect(mockCandidateService.updateCandidateProfile).toHaveBeenCalledWith(
        mockUser.userId,
        mockCandidate.id,
        updateDtoWithSkills,
      );
    });

    it('should throw NotFoundException when candidate not found', async () => {
      mockCandidateService.getCandidateProfile.mockRejectedValue(
        new NotFoundException('Candidate profile not found'),
      );

      await expect(
        controller.updateMyProfile(mockUser, updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when updating another user profile', async () => {
      mockCandidateService.getCandidateProfile.mockResolvedValue(mockCandidate);
      mockCandidateService.updateCandidateProfile.mockRejectedValue(
        new ForbiddenException(
          'You do not have permission to update this profile',
        ),
      );

      await expect(
        controller.updateMyProfile(mockUser, updateDto),
      ).rejects.toThrow(ForbiddenException);
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

      mockCandidateService.getCandidateProfile.mockResolvedValue(mockCandidate);
      mockCandidateService.updateCandidateProfile.mockResolvedValue(
        updatedCandidate,
      );

      const result = await controller.updateMyProfile(mockUser, partialUpdate);

      expect(result.bio).toBe(partialUpdate.bio);
      expect(result.phone_number).toBe(mockCandidate.phone_number);
      expect(result.location).toBe(mockCandidate.location);
    });

    it('should handle empty skill_ids array', async () => {
      const updateDtoWithEmptySkills: UpdateCandidateDto = {
        ...updateDto,
        skill_ids: [],
      };

      const updatedCandidate = {
        ...mockCandidate,
        ...updateDto,
        candidate_skills: [],
      };

      mockCandidateService.getCandidateProfile.mockResolvedValue(mockCandidate);
      mockCandidateService.updateCandidateProfile.mockResolvedValue(
        updatedCandidate,
      );

      const result = await controller.updateMyProfile(
        mockUser,
        updateDtoWithEmptySkills,
      );

      expect(result.candidate_skills).toHaveLength(0);
    });
  });

  describe('getCandidateById', () => {
    it('should return candidate by ID', async () => {
      mockCandidateService.getCandidateById.mockResolvedValue(mockCandidate);

      const result = await controller.getCandidateById('candidate-123');

      expect(result).toEqual(mockCandidate);
      expect(mockCandidateService.getCandidateById).toHaveBeenCalledWith(
        'candidate-123',
      );
      expect(mockCandidateService.getCandidateById).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when candidate not found', async () => {
      mockCandidateService.getCandidateById.mockRejectedValue(
        new NotFoundException('Candidate not found'),
      );

      await expect(
        controller.getCandidateById('non-existent-id'),
      ).rejects.toThrow(NotFoundException);
      expect(mockCandidateService.getCandidateById).toHaveBeenCalledWith(
        'non-existent-id',
      );
    });

    it('should return candidate with skills and CVs', async () => {
      const candidateWithData = {
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
            skills: { id: 'skill-2', name: 'Python', created_at: new Date() },
          },
        ],
        cvs: [
          {
            id: 'cv-1',
            candidate_id: 'candidate-123',
            file_name: 'resume.pdf',
            file_path: '/uploads/resume.pdf',
            is_default: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
      };

      mockCandidateService.getCandidateById.mockResolvedValue(
        candidateWithData,
      );

      const result = await controller.getCandidateById('candidate-123');

      expect(result.candidate_skills).toHaveLength(2);
      expect(result.cvs).toHaveLength(1);
      expect(result.candidate_skills[0].skills.name).toBe('JavaScript');
      expect(result.candidate_skills[1].skills.name).toBe('Python');
    });

    it('should handle candidate with no skills or CVs', async () => {
      const candidateWithoutData = {
        ...mockCandidate,
        candidate_skills: [],
        cvs: [],
      };

      mockCandidateService.getCandidateById.mockResolvedValue(
        candidateWithoutData,
      );

      const result = await controller.getCandidateById('candidate-123');

      expect(result.candidate_skills).toHaveLength(0);
      expect(result.cvs).toHaveLength(0);
    });
  });
});
