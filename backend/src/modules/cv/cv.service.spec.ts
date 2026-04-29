import { Test, TestingModule } from '@nestjs/testing';
import { CvService } from './cv.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  BadRequestException,
  PayloadTooLargeException,
  NotFoundException,
} from '@nestjs/common';

/**
 * Unit Tests for CV Service
 *
 * **Validates: Requirements 6.1-6.7**
 *
 * These tests verify CV management functionality including file validation.
 */
describe('CvService', () => {
  let cvService: CvService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CvService,
        {
          provide: PrismaService,
          useValue: {
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

    cvService = module.get<CvService>(CvService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('File Format Validation', () => {
    /**
     * Test: PDF files should be accepted
     * Requirements: 6.1
     */
    it('should accept PDF files', () => {
      expect(() => cvService.validateFileFormat('resume.pdf')).not.toThrow();
      expect(() => cvService.validateFileFormat('RESUME.PDF')).not.toThrow();
      expect(() => cvService.validateFileFormat('my-resume.pdf')).not.toThrow();
    });

    /**
     * Test: DOC files should be accepted
     * Requirements: 6.1
     */
    it('should accept DOC files', () => {
      expect(() => cvService.validateFileFormat('resume.doc')).not.toThrow();
      expect(() => cvService.validateFileFormat('RESUME.DOC')).not.toThrow();
      expect(() => cvService.validateFileFormat('my-resume.doc')).not.toThrow();
    });

    /**
     * Test: DOCX files should be accepted
     * Requirements: 6.1
     */
    it('should accept DOCX files', () => {
      expect(() => cvService.validateFileFormat('resume.docx')).not.toThrow();
      expect(() => cvService.validateFileFormat('RESUME.DOCX')).not.toThrow();
      expect(() =>
        cvService.validateFileFormat('my-resume.docx'),
      ).not.toThrow();
    });

    /**
     * Test: Unsupported formats should be rejected with 400 Bad Request
     * Requirements: 6.2
     */
    it('should reject unsupported file formats with BadRequestException', () => {
      const unsupportedFormats = [
        'resume.txt',
        'resume.jpg',
        'resume.png',
        'resume.zip',
        'resume.exe',
        'resume.html',
        'resume.xml',
        'resume.json',
        'resume',
        'resume.PDF.txt', // Tricky case
      ];

      unsupportedFormats.forEach((fileName) => {
        expect(() => cvService.validateFileFormat(fileName)).toThrow(
          BadRequestException,
        );
        expect(() => cvService.validateFileFormat(fileName)).toThrow(
          'Unsupported file format',
        );
      });
    });

    /**
     * Test: Case-insensitive file extension validation
     * Requirements: 6.1
     */
    it('should handle case-insensitive file extensions', () => {
      expect(() => cvService.validateFileFormat('resume.PDF')).not.toThrow();
      expect(() => cvService.validateFileFormat('resume.Pdf')).not.toThrow();
      expect(() => cvService.validateFileFormat('resume.pDf')).not.toThrow();
      expect(() => cvService.validateFileFormat('resume.DOC')).not.toThrow();
      expect(() => cvService.validateFileFormat('resume.Doc')).not.toThrow();
      expect(() => cvService.validateFileFormat('resume.DOCX')).not.toThrow();
      expect(() => cvService.validateFileFormat('resume.Docx')).not.toThrow();
    });
  });

  describe('File Size Validation', () => {
    /**
     * Test: Files under 5MB should be accepted
     * Requirements: 6.3
     */
    it('should accept files under 5MB', () => {
      const validSizes = [
        0, // Empty file
        1024, // 1KB
        1024 * 1024, // 1MB
        2 * 1024 * 1024, // 2MB
        4 * 1024 * 1024, // 4MB
        5 * 1024 * 1024, // Exactly 5MB
      ];

      validSizes.forEach((size) => {
        expect(() => cvService.validateFileSize(size)).not.toThrow();
      });
    });

    /**
     * Test: Files over 5MB should be rejected with 413 Payload Too Large
     * Requirements: 6.3
     */
    it('should reject files over 5MB with PayloadTooLargeException', () => {
      const invalidSizes = [
        5 * 1024 * 1024 + 1, // 5MB + 1 byte
        6 * 1024 * 1024, // 6MB
        10 * 1024 * 1024, // 10MB
        100 * 1024 * 1024, // 100MB
      ];

      invalidSizes.forEach((size) => {
        expect(() => cvService.validateFileSize(size)).toThrow(
          PayloadTooLargeException,
        );
        expect(() => cvService.validateFileSize(size)).toThrow(
          'File size exceeds 5MB limit',
        );
      });
    });

    /**
     * Test: Boundary case - exactly 5MB should be accepted
     * Requirements: 6.3
     */
    it('should accept files exactly at 5MB limit', () => {
      const exactLimit = 5 * 1024 * 1024; // Exactly 5MB
      expect(() => cvService.validateFileSize(exactLimit)).not.toThrow();
    });

    /**
     * Test: Boundary case - 5MB + 1 byte should be rejected
     * Requirements: 6.3
     */
    it('should reject files just over 5MB limit', () => {
      const justOverLimit = 5 * 1024 * 1024 + 1; // 5MB + 1 byte
      expect(() => cvService.validateFileSize(justOverLimit)).toThrow(
        PayloadTooLargeException,
      );
    });
  });

  describe('uploadCv', () => {
    const candidateId = 'candidate-123';
    const mockUploadDto = {
      file_name: 'resume.pdf',
      file_path: '/uploads/resume.pdf',
      is_default: false,
    };

    /**
     * Test: Upload with valid format and size
     * Requirements: 6.1, 6.3, 6.4
     */
    it('should upload CV with valid format and size', async () => {
      const mockCv = {
        id: 'cv-123',
        candidate_id: candidateId,
        file_name: mockUploadDto.file_name,
        file_path: mockUploadDto.file_path,
        is_default: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(prismaService.cvs, 'create').mockResolvedValue(mockCv);

      const result = await cvService.uploadCv(
        candidateId,
        mockUploadDto,
        1024 * 1024, // 1MB
      );

      expect(result).toEqual(mockCv);
      expect(prismaService.cvs.create).toHaveBeenCalled();
    });

    /**
     * Test: Upload should reject invalid file format
     * Requirements: 6.2
     */
    it('should reject upload with invalid file format', async () => {
      const invalidDto = {
        file_name: 'resume.txt',
        file_path: '/uploads/resume.txt',
        is_default: false,
      };

      await expect(
        cvService.uploadCv(candidateId, invalidDto, 1024 * 1024),
      ).rejects.toThrow(BadRequestException);

      await expect(
        cvService.uploadCv(candidateId, invalidDto, 1024 * 1024),
      ).rejects.toThrow('Unsupported file format');

      expect(prismaService.cvs.create).not.toHaveBeenCalled();
    });

    /**
     * Test: Upload should reject oversized files
     * Requirements: 6.3
     */
    it('should reject upload with oversized file', async () => {
      const oversizedFile = 6 * 1024 * 1024; // 6MB

      await expect(
        cvService.uploadCv(candidateId, mockUploadDto, oversizedFile),
      ).rejects.toThrow(PayloadTooLargeException);

      await expect(
        cvService.uploadCv(candidateId, mockUploadDto, oversizedFile),
      ).rejects.toThrow('File size exceeds 5MB limit');

      expect(prismaService.cvs.create).not.toHaveBeenCalled();
    });

    /**
     * Test: Upload with is_default=true should unset other defaults
     * Requirements: 6.4, 6.7
     */
    it('should unset other CVs as default when uploading with is_default=true', async () => {
      const defaultDto = {
        ...mockUploadDto,
        is_default: true,
      };

      const mockCv = {
        id: 'cv-123',
        candidate_id: candidateId,
        file_name: defaultDto.file_name,
        file_path: defaultDto.file_path,
        is_default: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(prismaService.cvs, 'updateMany').mockResolvedValue({
        count: 2,
      } as any);
      jest.spyOn(prismaService.cvs, 'create').mockResolvedValue(mockCv);

      const result = await cvService.uploadCv(
        candidateId,
        defaultDto,
        1024 * 1024,
      );

      expect(prismaService.cvs.updateMany).toHaveBeenCalledWith({
        where: { candidate_id: candidateId },
        data: { is_default: false },
      });
      expect(result.is_default).toBe(true);
    });

    /**
     * Test: Upload without file size should skip size validation
     * Requirements: 6.1, 6.4
     */
    it('should skip size validation when fileSize is not provided', async () => {
      const mockCv = {
        id: 'cv-123',
        candidate_id: candidateId,
        file_name: mockUploadDto.file_name,
        file_path: mockUploadDto.file_path,
        is_default: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(prismaService.cvs, 'create').mockResolvedValue(mockCv);

      // Should not throw even without size validation
      const result = await cvService.uploadCv(candidateId, mockUploadDto);

      expect(result).toEqual(mockCv);
      expect(prismaService.cvs.create).toHaveBeenCalled();
    });
  });

  describe('getCandidateCvs', () => {
    /**
     * Test: Get all CVs for a candidate
     * Requirements: 6.5
     */
    it('should return all CVs for a candidate', async () => {
      const candidateId = 'candidate-123';
      const mockCvs = [
        {
          id: 'cv-1',
          candidate_id: candidateId,
          file_name: 'resume1.pdf',
          file_path: '/uploads/resume1.pdf',
          is_default: true,
          created_at: new Date('2024-01-02'),
          updated_at: new Date('2024-01-02'),
        },
        {
          id: 'cv-2',
          candidate_id: candidateId,
          file_name: 'resume2.pdf',
          file_path: '/uploads/resume2.pdf',
          is_default: false,
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
        },
      ];

      jest.spyOn(prismaService.cvs, 'findMany').mockResolvedValue(mockCvs);

      const result = await cvService.getCandidateCvs(candidateId);

      expect(result).toEqual(mockCvs);
      expect(prismaService.cvs.findMany).toHaveBeenCalledWith({
        where: { candidate_id: candidateId },
        orderBy: { created_at: 'desc' },
      });
    });
  });

  describe('deleteCv', () => {
    /**
     * Test: Delete CV successfully
     * Requirements: 6.6
     */
    it('should delete CV when it belongs to the candidate', async () => {
      const candidateId = 'candidate-123';
      const cvId = 'cv-123';
      const mockCv = {
        id: cvId,
        candidate_id: candidateId,
        file_name: 'resume.pdf',
        file_path: '/uploads/resume.pdf',
        is_default: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(prismaService.cvs, 'findUnique').mockResolvedValue(mockCv);
      jest.spyOn(prismaService.cvs, 'delete').mockResolvedValue(mockCv);

      const result = await cvService.deleteCv(candidateId, cvId);

      expect(result).toEqual({ message: 'CV deleted successfully' });
      expect(prismaService.cvs.delete).toHaveBeenCalledWith({
        where: { id: cvId },
      });
    });

    /**
     * Test: Reject deletion when CV not found
     * Requirements: 6.6
     */
    it('should throw NotFoundException when CV does not exist', async () => {
      const candidateId = 'candidate-123';
      const cvId = 'cv-nonexistent';

      jest.spyOn(prismaService.cvs, 'findUnique').mockResolvedValue(null);

      await expect(cvService.deleteCv(candidateId, cvId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(cvService.deleteCv(candidateId, cvId)).rejects.toThrow(
        'CV not found',
      );
    });

    /**
     * Test: Reject deletion when CV belongs to different candidate
     * Requirements: 6.6
     */
    it('should throw BadRequestException when CV belongs to different candidate', async () => {
      const candidateId = 'candidate-123';
      const cvId = 'cv-123';
      const mockCv = {
        id: cvId,
        candidate_id: 'different-candidate',
        file_name: 'resume.pdf',
        file_path: '/uploads/resume.pdf',
        is_default: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(prismaService.cvs, 'findUnique').mockResolvedValue(mockCv);

      await expect(cvService.deleteCv(candidateId, cvId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(cvService.deleteCv(candidateId, cvId)).rejects.toThrow(
        'You do not have permission to delete this CV',
      );
    });
  });

  describe('markCvAsDefault', () => {
    /**
     * Test: Mark CV as default successfully
     * Requirements: 6.7
     */
    it('should mark CV as default and unset others', async () => {
      const candidateId = 'candidate-123';
      const cvId = 'cv-123';
      const mockCv = {
        id: cvId,
        candidate_id: candidateId,
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

      jest.spyOn(prismaService.cvs, 'findUnique').mockResolvedValue(mockCv);
      jest
        .spyOn(prismaService.cvs, 'updateMany')
        .mockResolvedValue({ count: 2 } as any);
      jest.spyOn(prismaService.cvs, 'update').mockResolvedValue(mockUpdatedCv);

      const result = await cvService.markCvAsDefault(candidateId, cvId);

      expect(result.is_default).toBe(true);
      expect(prismaService.cvs.updateMany).toHaveBeenCalledWith({
        where: { candidate_id: candidateId },
        data: { is_default: false },
      });
      expect(prismaService.cvs.update).toHaveBeenCalledWith({
        where: { id: cvId },
        data: {
          is_default: true,
          updated_at: expect.any(Date),
        },
      });
    });

    /**
     * Test: Reject marking as default when CV not found
     * Requirements: 6.7
     */
    it('should throw NotFoundException when CV does not exist', async () => {
      const candidateId = 'candidate-123';
      const cvId = 'cv-nonexistent';

      jest.spyOn(prismaService.cvs, 'findUnique').mockResolvedValue(null);

      await expect(
        cvService.markCvAsDefault(candidateId, cvId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        cvService.markCvAsDefault(candidateId, cvId),
      ).rejects.toThrow('CV not found');
    });

    /**
     * Test: Reject marking as default when CV belongs to different candidate
     * Requirements: 6.7
     */
    it('should throw BadRequestException when CV belongs to different candidate', async () => {
      const candidateId = 'candidate-123';
      const cvId = 'cv-123';
      const mockCv = {
        id: cvId,
        candidate_id: 'different-candidate',
        file_name: 'resume.pdf',
        file_path: '/uploads/resume.pdf',
        is_default: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(prismaService.cvs, 'findUnique').mockResolvedValue(mockCv);

      await expect(
        cvService.markCvAsDefault(candidateId, cvId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        cvService.markCvAsDefault(candidateId, cvId),
      ).rejects.toThrow('You do not have permission to modify this CV');
    });
  });
});
