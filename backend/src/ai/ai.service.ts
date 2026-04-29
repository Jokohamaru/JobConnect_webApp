import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI, GenerationConfig } from '@google/generative-ai';

@Injectable()
export class AiService {

    private genAi: GoogleGenerativeAI;
    private model: any;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new InternalServerErrorException("API KEY is missing...");
        }

        this.genAi = new GoogleGenerativeAI(apiKey);

        this.model = this.genAi.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }

    async optimizeCVoptimizeCvContent(rawJson: any): Promise<any> {
        const generationConfig: GenerationConfig = {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 2048,
            responseMimeType: "application/json", // QUAN TRỌNG: Ép Gemini trả về JSON chuẩn
        };

        const prompt = `
      Bạn là một chuyên gia viết CV và tối ưu hóa hồ sơ năng lực.
      Dưới đây là dữ liệu JSON thô từ người dùng: ${JSON.stringify(rawJson)}
      
      Nhiệm vụ:
      1. Hãy viết lại các mô tả dự án và kinh nghiệm làm việc bằng ngôn ngữ chuyên nghiệp.
      2. Sử dụng các động từ hành động (ví dụ: "Phát triển", "Tối ưu hóa", "Dẫn dắt").
      3. Đảm bảo nội dung chuẩn ATS (Applicant Tracking System).
      4. Giữ nguyên cấu trúc các key trong JSON ban đầu.
      
      Hãy trả về kết quả dưới dạng JSON duy nhất.
    `;

        try {
            const result = await this.model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig,
            });

            const response = result.response;
            return JSON.parse(response.text());
        } catch (error) {
            console.error('Gemini AI Error:', error);
            throw new InternalServerErrorException('Lỗi khi xử lý nội dung CV qua AI');
        }
    }

    async compareCvWithJobRequirements(){
        
    }
}
