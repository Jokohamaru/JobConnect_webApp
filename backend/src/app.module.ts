import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './modules/user/user.module'; // Thêm modules/
import { ConfigModule } from '@nestjs/config';
import { CandidateModule } from './modules/candidate/candidate.module';
import { JobModule } from './modules/job/job.module';
import { CityModule } from './modules/city/city.module';
import { CompanyModule } from './modules/company/company.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    AuthModule,
    CandidateModule,
    JobModule,
    CityModule,
    CompanyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
