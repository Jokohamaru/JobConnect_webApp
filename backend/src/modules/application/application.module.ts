import { Module } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
import { AiCVModule } from '../ai-cv/ai-cv.module';

@Module({
  imports: [PrismaModule, AuthModule, AiCVModule],
  controllers: [ApplicationController],
  providers: [ApplicationService],
  exports: [ApplicationService],
})
export class ApplicationModule {}
