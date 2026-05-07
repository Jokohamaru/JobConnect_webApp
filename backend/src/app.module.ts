import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './modules/user/user.module'; // Thêm modules/
import { ConfigModule } from '@nestjs/config';
import { CandidateModule } from './modules/candidate/candidate.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    AuthModule,
    CandidateModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
