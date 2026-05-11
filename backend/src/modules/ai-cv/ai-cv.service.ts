import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GenerateCVDto } from './dto/generate-cv.dto';

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

@Injectable()
export class AiCVService {
  private genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateCVData(dto: GenerateCVDto): Promise<Record<string, any>> {
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
      return this.parseJsonFromResponse(text);
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
    const experienceSection =
      dto.experiences && dto.experiences.length > 0
        ? dto.experiences
            .map((exp, i) => {
              const workType = exp.workType
                ? WORKTYPE_MAP[exp.workType] || exp.workType
                : '';
              const duration =
                exp.isCurrent
                  ? `${exp.startDate || ''} - Hiện tại`
                  : `${exp.startDate || ''} - ${exp.endDate || ''}`;
              return `  Kinh nghiệm ${i + 1}:
    - Công ty: ${exp.company}
    - Vị trí: ${exp.position}${workType ? ` (${workType})` : ''}
    - Thời gian: ${duration}
    - Mô tả công việc: ${exp.description || 'Không có'}
    - Thành tựu nổi bật: ${exp.achievements || 'Không có'}`;
            })
            .join('\n\n')
        : '  Chưa có kinh nghiệm làm việc (fresher/sinh viên)';

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

    return `Bạn là chuyên gia viết CV chuyên nghiệp cho người Việt Nam.
Hãy tạo nội dung CV hoàn chỉnh bằng TIẾNG VIỆT dựa trên thông tin ứng viên dưới đây.

=== THÔNG TIN ỨNG VIÊN ===
- Ngành nghề: ${industryText}
- Vị trí ứng tuyển: ${dto.jobTitle}
- Cấp độ kinh nghiệm: ${levelText}

=== KINH NGHIỆM LÀM VIỆC ===
${experienceSection}

=== KỸ NĂNG ===
${skillsText}

=== ĐIỂM MẠNH ===
${strengthsText}

=== YÊU CẦU ===
1. Viết "summary" (mục tiêu nghề nghiệp) chuyên nghiệp, 3-4 câu, phù hợp với vị trí và cấp độ
2. Với mỗi kinh nghiệm: viết lại "description" theo chuẩn CV chuyên nghiệp:
   - Dùng bullet points (mỗi điểm bắt đầu bằng "•")
   - Dùng động từ hành động mạnh (Phát triển, Quản lý, Triển khai, Tối ưu hóa, Xây dựng...)
   - Thêm số liệu cụ thể nếu có thể suy ra từ mô tả gốc
3. Tạo danh sách kỹ năng từ thông tin đã cung cấp
4. Đề xuất "hobbies" phù hợp với ngành nghề (ví dụ: IT → đọc blog công nghệ, lập trình mã nguồn mở)
5. Để trống các field cá nhân chưa có: fullName, email, phone, address, linkedin, website, dob, avatar
6. Tất cả nội dung PHẢI bằng tiếng Việt

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
  "education": [],
  "skills": [
    { "id": "sk1", "skill": "tên kỹ năng", "level": 4 }
  ],
  "projects": [],
  "certificates": [],
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
