import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
<<<<<<< HEAD
import { AuthModule } from './auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';

@Module({
<<<<<<< HEAD
  imports: [AuthModule, AiModule],
=======
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { AiService } from './ai/ai.service';
import { AiModule } from './ai/ai.module';
import { AiController } from './ai/ai.controller';
import { AiService } from './ai/ai.service';
import { AiService } from './ai/ai.service';

@Module({
  imports: [
  ConfigModule.forRoot({ isGlobal: true }),
  UserModule
],
>>>>>>> nam
=======
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule],
>>>>>>> trieu/jwt
  controllers: [AppController, AiController],
  providers: [AppService, AiService],
})
export class AppModule {}
