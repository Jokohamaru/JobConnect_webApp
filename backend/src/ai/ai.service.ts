import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {

    private genAi: GoogleGenerativeAI;
    private model: any;

    constructor(){
        const apiKey = process.env.GEMINI_API_KEY;
        if(!apiKey){
            throw new InternalServerErrorException("API KEY is missing...");
        }

        this.genAi = new GoogleGenerativeAI(apiKey);

        this.model = this.genAi.getGenerativeModel({ model: 'gemini-1.5-flash'})
    }
}
