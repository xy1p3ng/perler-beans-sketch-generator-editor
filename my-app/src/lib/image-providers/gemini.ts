import { ImageProvider, GenerateOptions } from './types';

export const geminiProvider: ImageProvider = {
  config: {
    id: 'gemini',
    name: 'Google Gemini',
    models: [
      { id: 'gemini-2.0-flash-exp-image-generation', name: 'Gemini 2.0 Flash' },
    ],
    defaultModel: 'gemini-2.0-flash-exp-image-generation',
    requiresBaseUrl: false,
  },
  async generate(apiKey: string, prompt: string, options?: GenerateOptions): Promise<string> {
    const model = options?.model || 'gemini-2.0-flash-exp-image-generation';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ['Text', 'Image'] },
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Gemini API error');
    }
    const data = await response.json() as {
      candidates: Array<{ content: { parts: Array<{ inlineData?: { data: string; mimeType: string }; text?: string }> } }>;
    };
    const parts = data.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find(p => p.inlineData);
    if (!imagePart?.inlineData?.data) {
      throw new Error('No image returned from Gemini');
    }
    return imagePart.inlineData.data;
  },
};
