import { GoogleGenAI } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiInstance;
}

export async function callGemini(params: {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  jsonMode?: boolean;
}): Promise<string | null> {
  const ai = getGeminiClient();
  if (!ai) {
    return null;
  }

  try {
    const config: Record<string, any> = {
      temperature: params.temperature ?? 0.3
    };

    if (params.systemInstruction) {
      config.systemInstruction = params.systemInstruction;
    }

    if (params.jsonMode) {
      config.responseMimeType = 'application/json';
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: params.prompt,
      config
    });

    return response.text || null;
  } catch (err: any) {
    console.error('Gemini API execution error:', err?.message || err);
    return null;
  }
}
