import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GenerateCVDto } from './dto/generate-cv.dto';
import { PrismaService } from '../prisma/prisma.service';

// Mapping level sang tiếng Việt
const LEVEL_MAP: Record<string, string> = {
  fresher: 'Sinh viên / Fresher (chưa có hoặc dưới 6 tháng kinh nghiệm)',
  under_1: 'Dưới 1 năm kinh nghiệm',
  '1_to_3': '1 đến 3 năm kinh nghiệm',
  '3_to_5': '3 đến 5 năm kinh nghiệm',
  senior: 'Senior (trên 5 năm kinh nghiệm)',
};

const INDUSTRY_MAP: Record<string, string> = {
  it: 'Công nghệ thông tin / Phần mềm',
  marketing: 'Marketing / Truyền thông',
  business: 'Kinh doanh / Bán hàng',
  design: 'Thiết kế / Sáng tạo',
  education: 'Giáo dục / Đào tạo',
  finance: 'Tài chính / Kế toán',
  hr: 'Nhân sự / Hành chính',
  other: 'Khác',
};

const WORKTYPE_MAP: Record<string, string> = {
  fulltime: 'Toàn thời gian',
  parttime: 'Bán thời gian',
  freelance: 'Tự do',
  intern: 'Thực tập',
};

const DEGREE_MAP: Record<string, string> = {
  highschool: 'Trung học phổ thông',
  diploma: 'Trung cấp / Cao đẳng',
  bachelor: 'Đại học (Cử nhân)',
  master: 'Thạc sĩ',
  phd: 'Tiến sĩ',
  other: 'Khác',
};

@Injectable()
export class AiCVService {
  private genAI: GoogleGenerativeAI;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY is not configured in environment variables',
      );
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateCVData(
    dto: GenerateCVDto,
    userId: string,
  ): Promise<Record<string, any>> {
    // Lấy thông tin user từ database
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        candidate: true,
      },
    });

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 4096,
      },
    });

    const prompt = this.buildPrompt(dto);

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cvData = this.parseJsonFromResponse(text);

      // Điền thông tin user vào CV data
      if (user) {
        cvData.fullName =
          `${user.firstName || ''} ${user.lastName || ''}`.trim() || '';
        cvData.email = user.email || '';
        cvData.phone = user.candidate?.phoneNumber || '';
        cvData.avatar = user.avaUrl || '';
      }

      return cvData;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new InternalServerErrorException(
        'Không thể kết nối với AI. Vui lòng thử lại sau.',
      );
    }
  }

  private buildPrompt(dto: GenerateCVDto): string {
    const levelText = LEVEL_MAP[dto.level] || dto.level;
    const industryText = INDUSTRY_MAP[dto.industry] || dto.industry;

    // Xây dựng phần kinh nghiệm
    const isFresher = dto.level === 'fresher';
    const experienceSection =
      dto.experiences && dto.experiences.length > 0
        ? dto.experiences
            .map((exp, i) => {
              const workType = exp.workType
                ? WORKTYPE_MAP[exp.workType] || exp.workType
                : '';
              const duration = exp.isCurrent
                ? `${exp.startDate || ''} - Hiện tại`
                : `${exp.startDate || ''} - ${exp.endDate || ''}`;
              const label = isFresher ? `Dự án ${i + 1}` : `Kinh nghiệm ${i + 1}`;
              const companyLabel = isFresher ? 'Tên dự án / Tổ chức' : 'Công ty';
              const positionLabel = isFresher ? 'Vai trò' : 'Vị trí';
              return `  ${label}:
    - ${companyLabel}: ${exp.company}
    - ${positionLabel}: ${exp.position}${workType ? ` (${workType})` : ''}
    - Thời gian: ${duration}
    - Mô tả công việc: ${exp.description || 'Không có'}
    - Thành tựu nổi bật: ${exp.achievements || 'Không có'}`;
            })
            .join('\n\n')
        : isFresher
          ? '  Chưa có dự án cá nhân (fresher/sinh viên)'
          : '  Chưa có kinh nghiệm làm việc (fresher/sinh viên)';

    // Xây dựng phần học vấn
    const educationSection =
      dto.educations && dto.educations.length > 0
        ? dto.educations
            .map((edu, i) => {
              const degreeText = DEGREE_MAP[edu.degree] || edu.degree;
              const duration = edu.isCurrent
                ? `${edu.startDate || ''} - Hiện tại`
                : `${edu.startDate || ''} - ${edu.endDate || ''}`;
              return `  Học vấn ${i + 1}:
    - Trường: ${edu.school}
    - Bằng cấp: ${degreeText}
    - Chuyên ngành: ${edu.major}
    - Thời gian: ${duration}${edu.gpa ? `\n    - GPA: ${edu.gpa}` : ''}
    - Thành tích/Hoạt động: ${edu.description || 'Không có'}`;
            })
            .join('\n\n')
        : '  Chưa có thông tin học vấn';

    // Xây dựng phần kỹ năng
    const skillsText =
      dto.skills && dto.skills.length > 0
        ? dto.skills
            .map((s) => {
              const lvl = dto.skillLevels?.[s];
              return lvl ? `${s} (${lvl})` : s;
            })
            .join(', ')
        : 'Không có';

    const strengthsText =
      dto.strengths && dto.strengths.length > 0
        ? dto.strengths.join(', ')
        : 'Không có';

    const certificatesText =
      dto.certificates && dto.certificates.length > 0
        ? dto.certificates
            .map((cert, i) => {
              return `  Chứng chỉ ${i + 1}:
    - Tên: ${cert.name}
    - Tổ chức cấp: ${cert.issuer}${cert.date ? `\n    - Thời gian: ${cert.date}` : ''}`;
            })
            .join('\n\n')
        : 'Không có';

    return `Bạn là chuyên gia viết CV chuyên nghiệp cho người Việt Nam.
Hãy tạo nội dung CV hoàn chỉnh bằng TIẾNG VIỆT dựa trên thông tin ứng viên dưới đây.

=== THÔNG TIN ỨNG VIÊN ===
- Ngành nghề: ${industryText}
- Vị trí ứng tuyển: ${dto.jobTitle}
- Cấp độ kinh nghiệm: ${levelText}

=== ${isFresher ? 'DỰ ÁN CÁ NHÂN / KINH NGHIỆM' : 'KINH NGHIỆM LÀM VIỆC'} ===
${experienceSection}

=== HỌC VẤN ===
${educationSection}

=== KỸ NĂNG ===
${skillsText}

=== ĐIỂM MẠNH ===
${strengthsText}

=== CHỨNG CHỈ ===
${certificatesText}

=== YÊU CẦU ===
1. Viết "summary" (mục tiêu nghề nghiệp) chuyên nghiệp, 3-4 câu, phù hợp với vị trí và cấp độ
2. Với mỗi ${isFresher ? 'dự án' : 'kinh nghiệm'}: viết lại "description" theo chuẩn CV chuyên nghiệp:
   - Dùng bullet points (mỗi điểm bắt đầu bằng "•")
   - Dùng động từ hành động mạnh (Phát triển, Quản lý, Triển khai, Tối ưu hóa, Xây dựng...)
   - Thêm số liệu cụ thể nếu có thể suy ra từ mô tả gốc
3. Với mỗi học vấn: tạo entry trong mảng "education" với đầy đủ thông tin
4. Với mỗi chứng chỉ: tạo entry trong mảng "certificates" với đầy đủ thông tin
5. Tạo danh sách kỹ năng từ thông tin đã cung cấp
6. Đề xuất "hobbies" phù hợp với ngành nghề (ví dụ: IT → đọc blog công nghệ, lập trình mã nguồn mở)
7. Để trống các field cá nhân chưa có: fullName, email, phone, address, linkedin, website, dob, avatar
8. Tất cả nội dung PHẢI bằng tiếng Việt

=== ĐỊNH DẠNG OUTPUT ===
Trả về CHỈ JSON thuần túy (không có markdown, không có \`\`\`json), theo đúng interface sau:
{
  "fullName": "",
  "jobTitle": "${dto.jobTitle}",
  "email": "",
  "phone": "",
  "address": "",
  "linkedin": "",
  "website": "",
  "dob": "",
  "avatar": "",
  "summary": "Nội dung mục tiêu nghề nghiệp chuyên nghiệp...",
  "experiences": [
    {
      "id": "exp1",
      "position": "tên vị trí",
      "company": "tên công ty",
      "duration": "MM/YYYY - MM/YYYY hoặc MM/YYYY - Hiện tại",
      "description": "• Điểm 1\\n• Điểm 2\\n• Điểm 3"
    }
  ],
  "education": [
    {
      "id": "edu1",
      "school": "tên trường",
      "degree": "bằng cấp",
      "major": "chuyên ngành",
      "duration": "MM/YYYY - MM/YYYY hoặc MM/YYYY - Hiện tại",
      "gpa": "điểm GPA nếu có",
      "description": "thành tích, hoạt động nếu có"
    }
  ],
  "skills": [
    { "id": "sk1", "skill": "tên kỹ năng", "level": 4 }
  ],
  "projects": [],
  "certificates": [
    {
      "id": "cert1",
      "name": "tên chứng chỉ",
      "issuer": "tổ chức cấp",
      "date": "thời gian nếu có"
    }
  ],
  "activities": [],
  "awards": [],
  "hobbies": "sở thích phù hợp với ngành"
}

Ghi chú về field "level" trong skills: 1=Cơ bản, 2=Khá, 3=Trung bình, 4=Thành thạo, 5=Xuất sắc
Mapping từ đánh giá của ứng viên: "Cơ bản"→2, "Khá"→3, "Thành thạo"→5`;
  }

  private parseJsonFromResponse(text: string): Record<string, any> {
    // Thử parse trực tiếp
    try {
      return JSON.parse(text.trim());
    } catch {}

    // Thử extract từ markdown code block
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1].trim());
      } catch {}
    }

    // Thử tìm JSON object đầu tiên trong text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {}
    }

    throw new InternalServerErrorException(
      'AI trả về dữ liệu không hợp lệ. Vui lòng thử lại.',
    );
  }
}