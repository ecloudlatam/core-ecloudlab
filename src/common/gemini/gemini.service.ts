import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
  }

  // Generador reutilizable de embeddings
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.ai.models.embedContent({
        model: 'gemini-embedding-2-preview',
        contents: text,
        config: {
          outputDimensionality: 384, // <-- camelCase para Node.js/TS
        },
      });
      const list = response.embeddings[0].values;
      return list;
    } catch (error) {}
  }
}
