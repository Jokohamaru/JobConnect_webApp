import { Module } from '@nestjs/common';
import { CandidateService } from './candidate.service';
import { CandidateController } from './candidate.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CandidateController],
  exports: [CandidateService],
  providers: [CandidateService,PrismaService],
})
export class CandidateModule {}
