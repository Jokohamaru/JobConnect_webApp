import { Module } from '@nestjs/common';
import { CompanyTypeService } from './company-type.service';
import { CompanyTypeController } from './company-type.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CompanyTypeController],
  providers: [CompanyTypeService],
})
export class CompanyTypeModule {}