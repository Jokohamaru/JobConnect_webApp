import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config'; // Dùng bản import chuẩn này nhé

@Module({
  imports: [
    // Giữ nguyên logic của Nam: Load biến môi trường cho toàn app
    ConfigModule.forRoot({ isGlobal: true }),
    
    // Giữ UserModule của Nam
    UserModule,
    
    // Thêm AuthModule của Triệu để chạy Đăng nhập/Đăng ký
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}