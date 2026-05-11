import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiCVController } from './ai-cv.controller';
import { AiCVService } from './ai-cv.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [AiCVController],
  providers: [AiCVService],
  exports: [AiCVService],
})
export class AiCVModule {}
