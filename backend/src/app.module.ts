import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
<<<<<<< HEAD
import { AuthModule } from './auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';

@Module({
<<<<<<< HEAD
  imports: [AuthModule],
=======
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config/dist/config.module';

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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
