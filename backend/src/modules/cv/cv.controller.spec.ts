import { Test, TestingModule } from '@nestjs/testing';
import { CvController } from './cv.controller';
import { CvService } from './cv.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  BadRequestException,
  PayloadTooLargeException,
  NotFoundException,
} from '@nestjs/common';

/**
 * Integration Tests for CV Controller
 *
 * **Validates: Requirements 6.1-6.7**
 *
 * These tests verify the CV controller endpoints with file validation.
 */
describe('CvController', () => {
  let cvController: CvController;
  let cvService: CvService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CvController],
      providers: [
        CvService,
        {
          provide: PrismaService,
          useValue: {
            candidates: {
              findUnique: jest.fn(),
            },
            cvs: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    cvController = module.get<CvController>(CvController);
    cvService = module.get<CvService>(CvService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /candidates/me/cvs - Upload CV', () => {
    const mockUser = { userId: 'user-123', role: 'CANDIDATE' };
    const mockCandidate = {
      id: 'candidate-123',
      user_id: 'user-123',
      phone_number: null,
      bio: null,
      location: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    /**
     * Test: Upload CV with valid PDF format
     * Requirements: 6.1, 6.4
     */
    it('should upload CV with valid PDF format', async () => {
      const uploadDto = {
        file_name: 'resume.pdf',
        file_path: '/uploads/resume.pdf',
        is_default: false,
      };

      const mockCv = {
        id: 'cv-123',
        candidate_id: mockCandidate.id,
        file_name: uploadDto.file_name,
        file_path: uploadDto.file_path,
        is_default: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest
        .spyOn(prismaService.candidates, 'findUnique')
        .mockResolvedValue(mockCandidate);
      jest.spyOn(prismaService.cvs, 'create').mockResolvedValue(mockCv);

      const result = await cvController.uploadCv(mockUser, uploadDto);

      expect(result).toEqual(mockCv);
      expect(prismaService.cvs.create).toHaveBeenCalled();
    });

    /**
     * Test: Reject upload with unsupported format (400 Bad Request)
     * Requirements: 6.2
     */
    it('should reject upload with unsupported format', async () => {
      const uploadDto = {
        file_name: 'resume.txt',
        file_path: '/uploads/resume.txt',
        is_default: false,
      };

      jest
        .spyOn(prismaService.candidates, 'findUnique')
        .mockResolvedValue(mockCandidate);

      await expect(cvController.uploadCv(mockUser, uploadDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(cvController.uploadCv(mockUser, uploadDto)).rejects.toThrow(
        'Unsupported file format',
      );
    });

    /**
     * Test: Accept DOC format
     * Requirements: 6.1
     */
    it('should accept DOC format', async () => {
      const uploadDto = {
        file_name: 'resume.doc',
        file_path: '/uploads/resume.doc',
        is_default: false,
      };

      const mockCv = {
        id: 'cv-123',
        candidate_id: mockCandidate.id,
        file_name: uploadDto.file_name,
        file_path: uploadDto.file_path,
        is_default: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest
        .spyOn(prismaService.candidates, 'findUnique')
        .mockResolvedValue(mockCandidate);
      jest.spyOn(prismaService.cvs, 'create').mockResolvedValue(mockCv);

      const result = await cvController.uploadCv(mockUser, uploadDto);

      expect(result).toEqual(mockCv);
    });

    /**
     * Test: Accept DOCX format
     * Requirements: 6.1
     */
    it('should accept DOCX format', async () => {
      const uploadDto = {
        file_name: 'resume.docx',
        file_path: '/uploads/resume.docx',
        is_default: false,
      };

      const mockCv = {
        id: 'cv-123',
        candidate_id: mockCandidate.id,
        file_name: uploadDto.file_name,
        file_path: uploadDto.file_path,
        is_default: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest
        .spyOn(prismaService.candidates, 'findUnique')
        .mockResolvedValue(mockCandidate);
      jest.spyOn(prismaService.cvs, 'create').mockResolvedValue(mockCv);

      const result = await cvController.uploadCv(mockUser, uploadDto);

      expect(result).toEqual(mockCv);
    });

    /**
     * Test: Throw NotFoundException when candidate profile not found
     * Requirements: 6.4
     */
    it('should throw NotFoundException when candidate profile not found', async () => {
      const uploadDto = {
        file_name: 'resume.pdf',
        file_path: '/uploads/resume.pdf',
        is_default: false,
      };

      jest.spyOn(prismaService.candidates, 'findUnique').mockResolvedValue(null);

      await expect(cvController.uploadCv(mockUser, uploadDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(cvController.uploadCv(mockUser, uploadDto)).rejects.toThrow(
        'Candidate profile not found',
      );
    });
  });

  describe('GET /candidates/me/cvs - List CVs', () => {
    const mockUser = { userId: 'user-123', role: 'CANDIDATE' };
    const mockCandidate = {
      id: 'candidate-123',
      user_id: 'user-123',
      phone_number: null,
      bio: null,
      location: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    /**
     * Test: List all CVs for candidate
     * Requirements: 6.5
     */
    it('should list all CVs for candidate', async () => {
      const mockCvs = [
        {
          id: 'cv-1',
          candidate_id: mockCandidate.id,
          file_name: 'resume1.pdf',
          file_path: '/uploads/resume1.pdf',
          is_default: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'cv-2',
          candidate_id: mockCandidate.id,
          file_name: 'resume2.pdf',
          file_path: '/uploads/resume2.pdf',
          is_default: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      jest
        .spyOn(prismaService.candidates, 'findUnique')
        .mockResolvedValue(mockCandidate);
      jest.spyOn(prismaService.cvs, 'findMany').mockResolvedValue(mockCvs);

      const result = await cvController.getCandidateCvs(mockUser);

      expect(result).toEqual(mockCvs);
      expect(prismaService.cvs.findMany).toHaveBeenCalledWith({
        where: { candidate_id: mockCandidate.id },
        orderBy: { created_at: 'desc' },
      });
    });
  });

  describe('DELETE /candidates/me/cvs/:cvId - Delete CV', () => {
    const mockUser = { userId: 'user-123', role: 'CANDIDATE' };
    const mockCandidate = {
      id: 'candidate-123',
      user_id: 'user-123',
      phone_number: null,
      bio: null,
      location: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    /**
     * Test: Delete CV successfully
     * Requirements: 6.6
     */
    it('should delete CV successfully', async () => {
      const cvId = 'cv-123';
      const mockCv = {
        id: cvId,
        candidate_id: mockCandidate.id,
        file_name: 'resume.pdf',
        file_path: '/uploads/resume.pdf',
        is_default: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest
        .spyOn(prismaService.candidates, 'findUnique')
        .mockResolvedValue(mockCandidate);
      jest.spyOn(prismaService.cvs, 'findUnique').mockResolvedValue(mockCv);
      jest.spyOn(prismaService.cvs, 'delete').mockResolvedValue(mockCv);

      const result = await cvController.deleteCv(mockUser, cvId);

      expect(result).toEqual({ message: 'CV deleted successfully' });
      expect(prismaService.cvs.delete).toHaveBeenCalledWith({
        where: { id: cvId },
      });
    });
  });

  describe('PATCH /candidates/me/cvs/:cvId/default - Mark CV as default', () => {
    const mockUser = { userId: 'user-123', role: 'CANDIDATE' };
    const mockCandidate = {
      id: 'candidate-123',
      user_id: 'user-123',
      phone_number: null,
      bio: null,
      location: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    /**
     * Test: Mark CV as default successfully
     * Requirements: 6.7
     */
    it('should mark CV as default successfully', async () => {
      const cvId = 'cv-123';
      const mockCv = {
        id: cvId,
        candidate_id: mockCandidate.id,
        file_name: 'resume.pdf',
        file_path: '/uploads/resume.pdf',
        is_default: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockUpdatedCv = {
        ...mockCv,
        is_default: true,
      };

      jest
        .spyOn(prismaService.candidates, 'findUnique')
        .mockResolvedValue(mockCandidate);
      jest.spyOn(prismaService.cvs, 'findUnique').mockResolvedValue(mockCv);
      jest
        .spyOn(prismaService.cvs, 'updateMany')
        .mockResolvedValue({ count: 2 } as any);
      jest.spyOn(prismaService.cvs, 'update').mockResolvedValue(mockUpdatedCv);

      const result = await cvController.markCvAsDefault(mockUser, cvId);

      expect(result.is_default).toBe(true);
      expect(prismaService.cvs.updateMany).toHaveBeenCalled();
      expect(prismaService.cvs.update).toHaveBeenCalled();
    });
  });
});
