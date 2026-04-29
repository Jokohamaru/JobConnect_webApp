import { validate } from 'class-validator';
import {
  IsValidFileUpload,
  IsAllowedFileFormat,
} from './file-upload.validator';

class TestFileUploadDto {
  @IsValidFileUpload()
  file_name: string;

  mime_type?: string;
}

class TestFileFormatDto {
  @IsAllowedFileFormat(['.pdf', '.doc', '.docx'])
  file_name: string;
}

describe('IsValidFileUpload Validator', () => {
  it('should validate PDF file with matching MIME type', async () => {
    const dto = new TestFileUploadDto();
    dto.file_name = 'document.pdf';
    dto.mime_type = 'application/pdf';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate DOC file with matching MIME type', async () => {
    const dto = new TestFileUploadDto();
    dto.file_name = 'document.doc';
    dto.mime_type = 'application/msword';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate DOCX file with matching MIME type', async () => {
    const dto = new TestFileUploadDto();
    dto.file_name = 'document.docx';
    dto.mime_type =
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate when no MIME type is provided', async () => {
    const dto = new TestFileUploadDto();
    dto.file_name = 'document.pdf';
    dto.mime_type = undefined;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject PDF file with DOC MIME type', async () => {
    const dto = new TestFileUploadDto();
    dto.file_name = 'document.pdf';
    dto.mime_type = 'application/msword';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isValidFileUpload).toBe(
      'File extension does not match declared MIME type',
    );
  });

  it('should reject DOC file with PDF MIME type', async () => {
    const dto = new TestFileUploadDto();
    dto.file_name = 'document.doc';
    dto.mime_type = 'application/pdf';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should validate unknown MIME type (permissive)', async () => {
    const dto = new TestFileUploadDto();
    dto.file_name = 'document.xyz';
    dto.mime_type = 'application/unknown';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject non-string file name', async () => {
    const dto = new TestFileUploadDto();
    dto.file_name = 123 as any;
    dto.mime_type = 'application/pdf';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should validate JPEG file with matching MIME type', async () => {
    const dto = new TestFileUploadDto();
    dto.file_name = 'image.jpg';
    dto.mime_type = 'image/jpeg';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate PNG file with matching MIME type', async () => {
    const dto = new TestFileUploadDto();
    dto.file_name = 'image.png';
    dto.mime_type = 'image/png';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});

describe('IsAllowedFileFormat Validator', () => {
  it('should validate PDF file', async () => {
    const dto = new TestFileFormatDto();
    dto.file_name = 'document.pdf';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate DOC file', async () => {
    const dto = new TestFileFormatDto();
    dto.file_name = 'document.doc';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate DOCX file', async () => {
    const dto = new TestFileFormatDto();
    dto.file_name = 'document.docx';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate file with uppercase extension', async () => {
    const dto = new TestFileFormatDto();
    dto.file_name = 'document.PDF';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject TXT file', async () => {
    const dto = new TestFileFormatDto();
    dto.file_name = 'document.txt';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isAllowedFileFormat).toBe(
      'File format must be one of: .pdf, .doc, .docx',
    );
  });

  it('should reject file without extension', async () => {
    const dto = new TestFileFormatDto();
    dto.file_name = 'document';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject non-string file name', async () => {
    const dto = new TestFileFormatDto();
    dto.file_name = 123 as any;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject empty string', async () => {
    const dto = new TestFileFormatDto();
    dto.file_name = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
