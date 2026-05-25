import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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
      console.warn('Gemini API error, using heuristic CV generator fallback:', error);
      
      const industryName = INDUSTRY_MAP[dto.industry] || dto.industry;
      const levelName = LEVEL_MAP[dto.level] || dto.level;
      
      const summary = `Tôi là một chuyên viên trong lĩnh vực ${industryName} định hướng phát triển ở cấp độ ${levelName}. Với mục tiêu tìm kiếm cơ hội ứng tuyển vào vị trí ${dto.jobTitle}, tôi mong muốn áp dụng các kỹ năng chuyên môn và kinh nghiệm tích lũy được để đóng góp tích cực cho mục tiêu phát triển của quý công ty. (CV tự động tạo dự phòng)`;
      
      const experiences = (dto.experiences || []).map((exp, index) => {
        const descBullets: string[] = [];
        if (exp.description) {
          const lines = exp.description.split(/\n+/).map(l => l.replace(/^[•\-\*\s]+/, '').trim()).filter(Boolean);
          if (lines.length > 0) {
            descBullets.push(...lines.map(l => `• ${l}`));
          } else {
            descBullets.push(`• Thực hiện công việc chuyên môn của vị trí ${exp.position} tại ${exp.company}`);
          }
        } else {
          descBullets.push(`• Đảm nhiệm vai trò ${exp.position}, phối hợp cùng đội ngũ thực hiện các nhiệm vụ chuyên môn.`);
          descBullets.push(`• Tham gia triển khai dự án và tối ưu hóa quy trình làm việc tại ${exp.company}.`);
        }
        if (exp.achievements) {
          descBullets.push(`• Đạt thành tích nổi bật: ${exp.achievements}`);
        }
        
        return {
          id: `exp${index + 1}`,
          position: exp.position,
          company: exp.company,
          duration: `${exp.startDate || ''} - ${exp.isCurrent ? 'Hiện tại' : (exp.endDate || '')}`,
          description: descBullets.join('\n')
        };
      });

      const education = (dto.educations || []).map((edu, index) => {
        const degreeName = DEGREE_MAP[edu.degree] || edu.degree;
        return {
          id: `edu${index + 1}`,
          school: edu.school,
          degree: degreeName,
          major: edu.major,
          duration: `${edu.startDate || ''} - ${edu.isCurrent ? 'Hiện tại' : (edu.endDate || '')}`,
          gpa: edu.gpa || '',
          description: edu.description || ''
        };
      });

      const skills = (dto.skills || []).map((skill, index) => {
        const levelStr = dto.skillLevels?.[skill] || 'Khá';
        let level = 3;
        if (levelStr === 'Thành thạo' || levelStr === 'Xuất sắc') level = 4;
        else if (levelStr === 'Cơ bản') level = 2;
        return {
          id: `sk${index + 1}`,
          skill,
          level
        };
      });

      const certificates = (dto.certificates || []).map((cert, index) => ({
        id: `cert${index + 1}`,
        name: cert.name,
        issuer: cert.issuer,
        date: cert.date || ''
      }));

      const hobbies = dto.industry === 'it' 
        ? 'Tìm hiểu công nghệ mới, lập trình mã nguồn mở, đọc sách kỹ thuật.'
        : 'Đọc sách phát triển bản thân, học hỏi kiến thức ngành, giao tiếp kết nối.';

      return {
        fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
        jobTitle: dto.jobTitle,
        email: user?.email || '',
        phone: user?.candidate?.phoneNumber || '',
        address: user?.candidate?.address || '',
        linkedin: '',
        website: '',
        dob: '',
        avatar: user?.avaUrl || '',
        summary,
        experiences,
        education,
        skills,
        projects: [],
        certificates,
        activities: [],
        awards: [],
        hobbies
      };
    }
  }

  async matchCVAndJob(
    cvId: string,
    jobId: string,
  ): Promise<{ score: number; matchLevel: string; feedback: string }> {
    const cv = await this.prisma.cV.findUnique({
      where: { id: cvId },
    });
    const job = await this.prisma.job.findUnique({
      where: { id: jobId, deletedAt: null },
      include: {
        skills: true,
      },
    });

    if (!cv) {
      throw new NotFoundException('Không tìm thấy CV');
    }
    if (!job) {
      throw new NotFoundException('Không tìm thấy tin tuyển dụng');
    }

    // Chuẩn bị nội dung CV
    let cvContent = '';
    if (cv.cvType === 'BUILDER' && cv.cvData) {
      cvContent = typeof cv.cvData === 'string' ? cv.cvData : JSON.stringify(cv.cvData, null, 2);
    } else {
      const candidate = await this.prisma.candidate.findUnique({
        where: { id: cv.candidateId },
        include: {
          user: true,
        },
      });
      cvContent = `
        Tên ứng viên: ${candidate?.user?.firstName || ''} ${candidate?.user?.lastName || ''}
        Email: ${candidate?.user?.email || ''}
        Số điện thoại: ${candidate?.phoneNumber || ''}
        Địa chỉ: ${candidate?.address || ''}, ${candidate?.city || ''}
        Vị trí công việc hiện tại/mong muốn: ${candidate?.careerRole || ''}
        Tiêu đề CV: ${cv.title}
        Đường dẫn file CV: ${cv.cvUrl}
      `;
    }

    // Chuẩn bị nội dung Job
    const jobContent = `
      Tiêu đề công việc: ${job.title}
      Mô tả công việc: ${job.description}
      Mức lương tối thiểu: ${job.minSalary || 'Thỏa thuận'}
      Mức lương tối đa: ${job.maxSalary || 'Thỏa thuận'}
      Kỹ năng yêu cầu: ${job.skills.map((s) => s.name).join(', ')}
    `;

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.2,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    const prompt = `
      Bạn là một chuyên gia tuyển dụng và đánh giá nhân sự bằng AI.
      Hãy phân tích mức độ phù hợp giữa CV của ứng viên và Mô tả công việc (JD) dưới đây.

      === MÔ TẢ CÔNG VIỆC (JD) ===
      ${jobContent}

      === CV ỨNG VIÊN ===
      ${cvContent}

      === YÊU CẦU ===
      1. Chấm điểm độ phù hợp của ứng viên này đối với công việc theo thang điểm từ 0 đến 100 (score).
      2. Xác định mức độ phù hợp (matchLevel):
         - "HIGH" (Phù hợp cao - nếu điểm >= 75)
         - "MEDIUM" (Phù hợp trung bình - nếu điểm từ 50 đến 74)
         - "LOW" (Phù hợp thấp - nếu điểm dưới 50)
      3. Cung cấp đánh giá nhận xét ngắn gọn (feedback) bằng tiếng Việt (khoảng 3-4 câu) chỉ rõ lý do điểm số này (ví dụ: các kỹ năng và kinh nghiệm tương đồng, những kỹ năng/yêu cầu còn thiếu so với JD).

      === FORMAT OUTPUT ===
      Trả về kết quả dưới định dạng JSON đúng theo cấu trúc sau:
      {
        "score": number,
        "matchLevel": "HIGH" | "MEDIUM" | "LOW",
        "feedback": "chuỗi nhận xét bằng tiếng Việt"
      }
    `;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const matchResult = this.parseJsonFromResponse(text);

      return {
        score: typeof matchResult.score === 'number' ? matchResult.score : 0,
        matchLevel: matchResult.matchLevel || 'LOW',
        feedback: matchResult.feedback || 'Không có nhận xét.',
      };
    } catch (error) {
      console.warn('Gemini matching API error, falling back to heuristic matching:', error);
      
      const jobSkills = job.skills.map((s) => s.name);
      const cvTextLower = cvContent.toLowerCase();
      
      const matchedSkills = jobSkills.filter((skill) =>
        cvTextLower.includes(skill.toLowerCase()),
      );
      const missingSkills = jobSkills.filter(
        (skill) => !cvTextLower.includes(skill.toLowerCase()),
      );
      
      let score = 50; // Base score
      if (jobSkills.length > 0) {
        const matchRatio = matchedSkills.length / jobSkills.length;
        score = Math.round(40 + matchRatio * 45); // 40 to 85
      }

      // Add score if job title is mentioned in CV
      const jobTitleLower = job.title.toLowerCase();
      if (cvTextLower.includes(jobTitleLower)) {
        score += 12;
      } else {
        const titleWords = jobTitleLower.split(/\s+/).filter(w => w.length > 2);
        let matchCount = 0;
        for (const word of titleWords) {
          if (cvTextLower.includes(word)) {
            matchCount++;
          }
        }
        if (titleWords.length > 0) {
          score += Math.round((matchCount / titleWords.length) * 8);
        }
      }

      score = Math.min(score, 100);

      let matchLevel = 'LOW';
      if (score >= 75) {
        matchLevel = 'HIGH';
      } else if (score >= 50) {
        matchLevel = 'MEDIUM';
      }

      let feedback = '';
      if (matchedSkills.length > 0) {
        feedback += `Ứng viên có các kỹ năng phù hợp với yêu cầu tuyển dụng như: ${matchedSkills.join(', ')}. `;
      }
      if (missingSkills.length > 0) {
        feedback += `Hồ sơ chưa thể hiện rõ một số kỹ năng yêu cầu như: ${missingSkills.join(', ')}. `;
      } else if (jobSkills.length > 0) {
        feedback += `Ứng viên đáp ứng đầy đủ tất cả các kỹ năng yêu cầu. `;
      }

      if (score >= 75) {
        feedback += `Đánh giá chung: Ứng viên rất tiềm năng, trình độ chuyên môn và kỹ năng phù hợp tốt với vị trí ${job.title}. Khuyến nghị đưa vào danh sách phỏng vấn. (Kết quả được tính toán bằng bộ lọc từ khóa tự động dự phòng)`;
      } else if (score >= 50) {
        feedback += `Đánh giá chung: Hồ sơ ở mức khá, đáp ứng được một phần yêu cầu cốt lõi. Có thể xem xét phỏng vấn nếu muốn tìm hiểu thêm về năng lực thực tế. (Kết quả được tính toán bằng bộ lọc từ khóa tự động dự phòng)`;
      } else {
        feedback += `Đánh giá chung: Hồ sơ chưa thực sự phù hợp với vị trí này. Kỹ năng và kinh nghiệm còn thiếu nhiều so với mô tả công việc. (Kết quả được tính toán bằng bộ lọc từ khóa tự động dự phòng)`;
      }

      return {
        score,
        matchLevel,
        feedback,
      };
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