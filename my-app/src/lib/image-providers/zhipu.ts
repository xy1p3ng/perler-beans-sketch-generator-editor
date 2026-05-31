import { ImageProvider, GenerateOptions } from './types';

export const zhipuProvider: ImageProvider = {
  config: {
    id: 'zhipu',
    name: '智谱 AI',
    models: [
      { id: 'cogview-3-plus', name: 'CogView-3-Plus' },
      { id: 'cogview-3', name: 'CogView-3' },
    ],
    defaultModel: 'cogview-3-plus',
    requiresBaseUrl: false,
  },
  async generate(apiKey: string, prompt: string, options?: GenerateOptions): Promise<string> {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options?.model || 'cogview-3-plus',
        prompt,
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Zhipu API error');
    }
    const data = await response.json() as { data: Array<{ url: string }> };
    const imageUrl = data.data?.[0]?.url;
    if (!imageUrl) throw new Error('No image returned from Zhipu');
    // Fetch image and convert to base64
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) throw new Error('Failed to fetch generated image');
    const buffer = await imgRes.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
  },
};
