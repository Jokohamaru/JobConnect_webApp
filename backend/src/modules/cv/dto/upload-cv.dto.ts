import { IsString, IsBoolean, IsOptional } from 'class-validator';
import {
  IsAllowedFileFormat,
  IsValidFileUpload,
} from '../../../common/validators';

export class UploadCvDto {
  @IsString({ message: 'File name must be a string' })
  @IsAllowedFileFormat(['.pdf', '.doc', '.docx'], {
    message: 'File format must be PDF, DOC, or DOCX',
  })
  @IsValidFileUpload({
    message: 'File extension does not match declared MIME type',
  })
  file_name: string;

  @IsString({ message: 'File path must be a string' })
  file_path: string;

  @IsOptional()
  @IsString({ message: 'MIME type must be a string' })
  mime_type?: string;

  @IsOptional()
  @IsBoolean({ message: 'is_default must be a boolean' })
  is_default?: boolean;
}
