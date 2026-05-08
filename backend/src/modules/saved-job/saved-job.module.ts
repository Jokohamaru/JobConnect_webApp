import { Module } from '@nestjs/common';
import { SavedJobService } from './saved-job.service';
import { SavedJobController } from './saved-job.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SavedJobController],
  providers: [SavedJobService],
  exports: [SavedJobService],
})
export class SavedJobModule {}
