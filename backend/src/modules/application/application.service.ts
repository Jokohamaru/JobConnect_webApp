import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApplicationService {
  constructor(private prisma: PrismaService) {}

  // Đã sửa để nhận CreateApplicationDto chuẩn (đã có sẵn candidate_id kiểu string)
  async create(createApplicationDto: CreateApplicationDto) {
    const { job_id, cv_id, candidate_id, content } = createApplicationDto;

    // 1. Kiểm tra trùng lặp dựa trên String ID
    const isApplied = await this.prisma.application.findFirst({
      where: { 
        job_id, 
        candidate_id 
      }
    });

    if (isApplied) {
      throw new BadRequestException('Bạn đã nộp đơn ứng tuyển cho công việc này rồi!');
    }

    try {
      // 2. Tạo đơn ứng tuyển bằng cách connect các ID dạng String
      return await this.prisma.application.create({
        data: {
          status: createApplicationDto.status || 'APPLIED',
          job: { connect: { id: job_id } },
          cv: { connect: { id: cv_id } },
          candidate: { connect: { id: candidate_id } }
        },
      });
    } catch (error) {
      // Log lỗi ra console để Nam dễ debug nếu ID gửi lên bị sai
      console.error(error);
      throw new BadRequestException('Lỗi tạo đơn ứng tuyển. Vui lòng kiểm tra lại tính chính xác của các ID.');
    }
  }

  async findAll() {
    return await this.prisma.application.findMany({
      where: { deleted_at: null }, // Chỉ lấy các đơn chưa bị xóa mềm
      include: { 
        job: { include: { company: true } }, 
        cv: true,
        candidate: { include: { user: true } }
      },
    });
  }

  async findOne(id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: { job: true, cv: true, candidate: true },
    });
    if (!application) throw new NotFoundException('Không tìm thấy đơn ứng tuyển!');
    return application;
  }

  async update(id: string, updateApplicationDto: UpdateApplicationDto) {
    try {
      return await this.prisma.application.update({
        where: { id },
        data: updateApplicationDto,
      });
    } catch (error) {
      throw new NotFoundException('Đơn ứng tuyển không tồn tại hoặc đã bị xóa!');
    }
  }

  async remove(id: string) {
    // Thực hiện Soft Delete bằng cách cập nhật deleted_at
    try {
      return await this.prisma.application.update({
        where: { id },
        data: { deleted_at: new Date() }
      });
    } catch (error) {
      throw new NotFoundException('Không tìm thấy đơn ứng tuyển để xóa!');
    }
  }
}
