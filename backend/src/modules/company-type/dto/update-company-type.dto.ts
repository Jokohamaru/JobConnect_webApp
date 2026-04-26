import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanyTypeDto } from './create-company-type.dto';

export class UpdateCompanyTypeDto extends PartialType(CreateCompanyTypeDto) {}
