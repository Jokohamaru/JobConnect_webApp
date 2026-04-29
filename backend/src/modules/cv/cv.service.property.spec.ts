import { Test, TestingModule } from '@nestjs/testing';
import { CvService } from './cv.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  BadRequestException,
  PayloadTooLargeException,
} from '@nestjs/common';
import * as fc from 'fast-check';

/**
 * Property-Based Tests for CV Service
 *
 * **Validates: Requirements 6.1, 6.2, 6.3, 6.7**
 *
 * These tests verify universal properties of CV management across all inputs.
 */
describe('CvService - Property-Based Tests', () => {
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

  /**
   * Property 12: CV File Format Validation
   *
   * **Validates: Requirements 6.1, 6.2**
   *
   * For any CV upload, files with extensions in {pdf, doc, docx} SHALL be accepted,
   * while files with other extensions SHALL be rejected with 400 Bad Request.
   */
  describe('Property 12: CV file format validation', () => {
    it('should accept all valid file formats (pdf, doc, docx) regardless of case', () => {
      // Generator for valid file extensions
      const validExtensionArb = fc.oneof(
        fc.constant('pdf'),
        fc.constant('doc'),
        fc.constant('docx'),
        fc.constant('PDF'),
        fc.constant('DOC'),
        fc.constant('DOCX'),
        fc.constant('Pdf'),
        fc.constant('Doc'),
        fc.constant('Docx'),
      );

      // Generator for file names with valid extensions
      const validFileNameArb = fc
        .tuple(
          fc.stringMatching(/^[a-zA-Z0-9_-]+$/), // Base name
          validExtensionArb,
        )
        .map(([baseName, ext]) => `${baseName}.${ext}`);

      fc.assert(
        fc.property(validFileNameArb, (fileName) => {
          // Valid file formats should not throw
          expect(() => cvService.validateFileFormat(fileName)).not.toThrow();
        }),
        { numRuns: 100 },
      );
    });

    it('should reject all invalid file formats with BadRequestException', () => {
      // Generator for invalid file extensions
      const invalidExtensionArb = fc
        .oneof(
          fc.constant('txt'),
          fc.constant('jpg'),
          fc.constant('png'),
          fc.constant('gif'),
          fc.constant('zip'),
          fc.constant('exe'),
          fc.constant('html'),
          fc.constant('xml'),
          fc.constant('json'),
          fc.constant('csv'),
          fc.constant('mp4'),
          fc.constant('mp3'),
          fc.constant('avi'),
          fc.constant('mov'),
        )
        .filter((ext) => !['pdf', 'doc', 'docx'].includes(ext.toLowerCase()));

      // Generator for file names with invalid extensions
      const invalidFileNameArb = fc
        .tuple(
          fc.stringMatching(/^[a-zA-Z0-9_-]+$/), // Base name
          invalidExtensionArb,
        )
        .map(([baseName, ext]) => `${baseName}.${ext}`);

      fc.assert(
        fc.property(invalidFileNameArb, (fileName) => {
          // Invalid file formats should throw BadRequestException
          expect(() => cvService.validateFileFormat(fileName)).toThrow(
            BadRequestException,
          );
          expect(() => cvService.validateFileFormat(fileName)).toThrow(
            'Unsupported file format',
          );
        }),
        { numRuns: 100 },
      );
    });

    it('should handle files without extensions as invalid', () => {
      const fileNameWithoutExtArb = fc.stringMatching(/^[a-zA-Z0-9_-]+$/);

      fc.assert(
        fc.property(fileNameWithoutExtArb, (fileName) => {
          // Files without extensions should be rejected
          expect(() => cvService.validateFileFormat(fileName)).toThrow(
            BadRequestException,
          );
        }),
        { numRuns: 50 },
      );
    });
  });

  /**
   * Property 13: CV File Size Validation
   *
   * **Validates: Requirements 6.1, 6.3**
   *
   * For any CV upload, files ≤ 5MB SHALL be accepted,
   * while files > 5MB SHALL be rejected with 413 Payload Too Large.
   */
  describe('Property 13: CV file size validation', () => {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB in bytes

    it('should accept all file sizes up to and including 5MB', () => {
      // Generator for valid file sizes (0 to 5MB)
      const validFileSizeArb = fc.integer({ min: 0, max: MAX_SIZE });

      fc.assert(
        fc.property(validFileSizeArb, (fileSize) => {
          // Valid file sizes should not throw
          expect(() => cvService.validateFileSize(fileSize)).not.toThrow();
        }),
        { numRuns: 100 },
      );
    });

    it('should reject all file sizes over 5MB with PayloadTooLargeException', () => {
      // Generator for invalid file sizes (5MB + 1 byte to 100MB)
      const invalidFileSizeArb = fc.integer({
        min: MAX_SIZE + 1,
        max: 100 * 1024 * 1024,
      });

      fc.assert(
        fc.property(invalidFileSizeArb, (fileSize) => {
          // Invalid file sizes should throw PayloadTooLargeException
          expect(() => cvService.validateFileSize(fileSize)).toThrow(
            PayloadTooLargeException,
          );
          expect(() => cvService.validateFileSize(fileSize)).toThrow(
            'File size exceeds 5MB limit',
          );
        }),
        { numRuns: 100 },
      );
    });

    it('should handle boundary case: exactly 5MB should be accepted', () => {
      const exactLimit = MAX_SIZE;
      expect(() => cvService.validateFileSize(exactLimit)).not.toThrow();
    });

    it('should handle boundary case: 5MB + 1 byte should be rejected', () => {
      const justOverLimit = MAX_SIZE + 1;
      expect(() => cvService.validateFileSize(justOverLimit)).toThrow(
        PayloadTooLargeException,
      );
    });
  });

  /**
   * Property 14: CV Default Marking Idempotence
   *
   * **Validates: Requirements 6.7**
   *
   * For any Candidate with multiple CVs, marking the same CV as default multiple times
   * SHALL result in the same state (only that CV marked as default).
   */
  describe('Property 14: CV default marking idempotence', () => {
    it('should produce the same result when marking the same CV as default multiple times', async () => {
      const candidateId = 'candidate-123';
      const cvId = 'cv-default';

      // Create mock CVs for the candidate
      const mockCvs = [
        {
          id: 'cv-1',
          candidate_id: candidateId,
          file_name: 'resume1.pdf',
          file_path: '/uploads/resume1.pdf',
          is_default: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: cvId,
          candidate_id: candidateId,
          file_name: 'resume2.pdf',
          file_path: '/uploads/resume2.pdf',
          is_default: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'cv-3',
          candidate_id: candidateId,
          file_name: 'resume3.pdf',
          file_path: '/uploads/resume3.pdf',
          is_default: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      // Generator for number of times to mark as default (1 to 10)
      const timesToMarkArb = fc.integer({ min: 1, max: 10 });

      await fc.assert(
        fc.asyncProperty(timesToMarkArb, async (timesToMark) => {
          // Reset mocks for each iteration
          jest.clearAllMocks();

          // Mock findUnique to return the CV
          jest
            .spyOn(prismaService.cvs, 'findUnique')
            .mockResolvedValue(mockCvs[1]);

          // Mock updateMany to unset all defaults
          jest
            .spyOn(prismaService.cvs, 'updateMany')
            .mockResolvedValue({ count: 3 } as any);

          // Mock update to set the CV as default
          const mockUpdatedCv = {
            ...mockCvs[1],
            is_default: true,
          };
          jest
            .spyOn(prismaService.cvs, 'update')
            .mockResolvedValue(mockUpdatedCv);

          // Mark the CV as default multiple times
          let result;
          for (let i = 0; i < timesToMark; i++) {
            result = await cvService.markCvAsDefault(candidateId, cvId);
          }

          // Verify the result is always the same: CV is marked as default
          expect(result.is_default).toBe(true);
          expect(result.id).toBe(cvId);

          // Verify updateMany was called to unset all defaults (once per call)
          expect(prismaService.cvs.updateMany).toHaveBeenCalledTimes(
            timesToMark,
          );

          // Verify update was called to set this CV as default (once per call)
          expect(prismaService.cvs.update).toHaveBeenCalledTimes(timesToMark);

          // The final state should always be the same regardless of how many times we called it
          expect(result).toEqual(mockUpdatedCv);
        }),
        { numRuns: 50 },
      );
    });

    it('should maintain idempotence when marking different CVs as default in sequence', async () => {
      const candidateId = 'candidate-123';

      // Create mock CVs
      const mockCvs = [
        {
          id: 'cv-1',
          candidate_id: candidateId,
          file_name: 'resume1.pdf',
          file_path: '/uploads/resume1.pdf',
          is_default: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'cv-2',
          candidate_id: candidateId,
          file_name: 'resume2.pdf',
          file_path: '/uploads/resume2.pdf',
          is_default: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'cv-3',
          candidate_id: candidateId,
          file_name: 'resume3.pdf',
          file_path: '/uploads/resume3.pdf',
          is_default: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      // Generator for CV index to mark as default
      const cvIndexArb = fc.integer({ min: 0, max: 2 });

      await fc.assert(
        fc.asyncProperty(
          fc.array(cvIndexArb, { minLength: 1, maxLength: 10 }),
          async (cvIndices) => {
            // Reset mocks for each iteration
            jest.clearAllMocks();

            let lastResult;

            // Mark different CVs as default in sequence
            for (const cvIndex of cvIndices) {
              const cvToMark = mockCvs[cvIndex];

              // Mock findUnique to return the CV
              jest
                .spyOn(prismaService.cvs, 'findUnique')
                .mockResolvedValue(cvToMark);

              // Mock updateMany to unset all defaults
              jest
                .spyOn(prismaService.cvs, 'updateMany')
                .mockResolvedValue({ count: 3 } as any);

              // Mock update to set the CV as default
              const mockUpdatedCv = {
                ...cvToMark,
                is_default: true,
              };
              jest
                .spyOn(prismaService.cvs, 'update')
                .mockResolvedValue(mockUpdatedCv);

              lastResult = await cvService.markCvAsDefault(
                candidateId,
                cvToMark.id,
              );
            }

            // The last marked CV should be the default
            expect(lastResult.is_default).toBe(true);

            // Verify that only one CV is marked as default at the end
            // (updateMany is called to unset all, then update sets one as default)
            expect(prismaService.cvs.updateMany).toHaveBeenCalled();
            expect(prismaService.cvs.update).toHaveBeenCalled();
          },
        ),
        { numRuns: 50 },
      );
    });

    it('should ensure only one CV is default after marking operations', async () => {
      const candidateId = 'candidate-123';
      const cvId = 'cv-target';

      const mockCv = {
        id: cvId,
        candidate_id: candidateId,
        file_name: 'resume.pdf',
        file_path: '/uploads/resume.pdf',
        is_default: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Mock findUnique
      jest.spyOn(prismaService.cvs, 'findUnique').mockResolvedValue(mockCv);

      // Mock updateMany - this is the key operation that ensures only one default
      const updateManySpy = jest
        .spyOn(prismaService.cvs, 'updateMany')
        .mockResolvedValue({ count: 3 } as any);

      // Mock update
      jest.spyOn(prismaService.cvs, 'update').mockResolvedValue({
        ...mockCv,
        is_default: true,
      });

      // Mark as default
      await cvService.markCvAsDefault(candidateId, cvId);

      // Verify that updateMany was called to unset ALL CVs for this candidate
      expect(updateManySpy).toHaveBeenCalledWith({
        where: { candidate_id: candidateId },
        data: { is_default: false },
      });

      // This ensures idempotence: all CVs are first set to false,
      // then only the target CV is set to true
    });
  });
});
