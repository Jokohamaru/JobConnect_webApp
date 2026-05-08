import { Module, forwardRef } from '@nestjs/common';
import { CVService } from './cv.service';
import { CVController } from './cv.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule)],
  controllers: [CVController],
  providers: [CVService],
  exports: [CVService],
})
export class CVModule {}
