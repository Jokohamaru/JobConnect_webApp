import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../modules/prisma/prisma.module';
import { TestRoleController } from './test-role.controller';
import { RolesGuard } from './guards/roles.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config'; 

@Module({
  imports: [
    PrismaModule,
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
  exports: [AuthService], 
})
export class AuthModule {}