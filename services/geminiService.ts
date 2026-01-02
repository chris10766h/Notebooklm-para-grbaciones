
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: API_KEY });
  }

  async analyzeAudio(blob: Blob, prompt: string): Promise<string> {
    const base64Data = await this.blobToBase64(blob);
    
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: blob.type,
              data: base64Data
            }
          },
          { text: prompt }
        ]
      },
      config: {
        systemInstruction: "You are an expert academic assistant. Your goal is to transcribe classes accurately and help students understand complex concepts. If asked for a summary, be concise and highlight key takeaways.",
      }
    });

    return response.text || "No se pudo generar una respuesta.";
  }

  async getChatResponse(history: {role: 'user'|'model', content: string}[], message: string, recordings: {blob: Blob, title: string}[]): Promise<string> {
    // Combine context from recordings
    const parts: any[] = recordings.map(r => ({
      text: `Contexto de la grabación "${r.title}":`
    }));

    // Add audio data if small enough or just focus on text for the chat if many recordings
    // For simplicity, we send text context of history
    const chat = this.ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: "Eres un asistente de estudio personal. Responde preguntas basadas en las grabaciones de las clases del usuario."
      }
    });

    // Note: in a real NotebookLM, we would send the transcriptions as context.
    const response = await chat.sendMessage({ message });
    return response.text || "Lo siento, hubo un error al procesar tu pregunta.";
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

export const gemini = new GeminiService();
