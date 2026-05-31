import { ImageProvider, GenerateOptions } from './types';

export const openaiProvider: ImageProvider = {
  config: {
    id: 'openai',
    name: 'OpenAI',
    models: [
      { id: 'dall-e-3', name: 'DALL-E 3' },
      { id: 'dall-e-2', name: 'DALL-E 2' },
    ],
    defaultModel: 'dall-e-3',
    requiresBaseUrl: false,
  },
  async generate(apiKey: string, prompt: string, options?: GenerateOptions): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options?.model || 'dall-e-3',
        prompt,
        n: 1,
        size: options?.size || '1024x1024',
        response_format: 'b64_json',
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || 'OpenAI API error');
    }
    const data = await response.json() as { data: Array<{ b64_json: string }> };
    return data.data[0].b64_json;
  },
};
