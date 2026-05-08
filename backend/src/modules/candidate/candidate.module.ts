import { Module, forwardRef } from '@nestjs/common';
import { CandidateService } from './candidate.service';
import { CandidateController } from './candidate.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule)],
  controllers: [CandidateController],
  exports: [CandidateService],
  providers: [CandidateService],
})
export class CandidateModule {}
