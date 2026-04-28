import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateCandidateDto } from './create-candidate.dto';

// Khi update sẽ kế thừa CreateCandidateDto nhưng KHÔNG lấy trường user_id
export class UpdateCandidateDto extends PartialType(
  OmitType(CreateCandidateDto, ['user_id'] as const)
) {}
