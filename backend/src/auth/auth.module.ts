import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../modules/prisma/prisma.module';
import { TestRoleController } from './test-role.controller';
import { RolesGuard } from './guards/roles.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CandidateModule } from 'src/modules/candidate/candidate.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => CandidateModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), 
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, RolesGuard],
  controllers: [AuthController, TestRoleController],
  exports: [AuthService, JwtStrategy, RolesGuard], 
})
export class AuthModule {}