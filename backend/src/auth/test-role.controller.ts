import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from './decorators/roles.decorator';
import { Role } from './enums/role.enum';
import { RolesGuard } from './guards/roles.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard'; 

@Controller('test-role')
export class TestRoleController {

  @Get('recruiter-only')
  @Roles(Role.RECRUITER) // Thay EMPLOYER bằng RECRUITER
  @UseGuards(JwtAuthGuard, RolesGuard)
  testEmployer() {
    return { 
      message: 'Chúc mừng bạn! Guard đã cho phép bạn vào vì bạn là Nhà tuyển dụng (Role 2).' 
    };
  }

  @Get('candidate-only')
  @Roles(Role.CANDIDATE) // Chỉ Role 1 (Ứng viên) mới được vào
  @UseGuards(JwtAuthGuard, RolesGuard)
  testCandidate() {
    return { 
      message: 'Chào bạn! Bạn đang ở khu vực dành cho Ứng viên (Role 1).' 
    };
  }
}
