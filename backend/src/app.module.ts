import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './modules/user/user.module'; // Thêm modules/
import { ConfigModule } from '@nestjs/config';
import { CandidateModule } from './modules/candidate/candidate.module'; // Thêm modules/
import { RecruiterModule } from './modules/recruiter/recruiter.module'; // Thêm modules/
import { CompanyModule } from './modules/company/company.module'; // Thêm modules/
import { JobModule } from './modules/job/job.module'; // Thêm modules/
import { CityModule } from './modules/city/city.module'; // Thêm modules/
import { TagModule } from './modules/tag/tag.module'; // Thêm modules/
import { RequirementSkillModule } from './modules/requirement-skill/requirement-skill.module'; // Thêm modules/
import { CompanyTypeModule } from './modules/company-type/company-type.module'; // Thêm modules/
import { PrismaModule } from './modules/prisma/prisma.module'; // Thêm dòng này để các service không bị lỗi database
import { CvModule } from './modules/cv/cv.module';
import { ApplicationModule } from './modules/application/application.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UserModule,
    AuthModule,
    CityModule,
    CandidateModule,
    RecruiterModule,
    CompanyModule,
    JobModule,
    TagModule,
    RequirementSkillModule,
    CompanyTypeModule,
    CvModule,
    ApplicationModule,
    AdminModule,
    CvModule,
    ApplicationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
