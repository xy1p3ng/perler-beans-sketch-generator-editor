import { ImageProvider, GenerateOptions } from './types';

export const qwenProvider: ImageProvider = {
  config: {
    id: 'qwen',
    name: '通义万相',
    models: [
      { id: 'wanx-v1', name: '通义万相' },
    ],
    defaultModel: 'wanx-v1',
    requiresBaseUrl: false,
  },
  async generate(apiKey: string, prompt: string, options?: GenerateOptions): Promise<string> {
    // Step 1: Submit async task
    const submitRes = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify({
        model: options?.model || 'wanx-v1',
        input: { prompt },
        parameters: { size: '1024*1024', n: 1 },
      }),
    });
    if (!submitRes.ok) {
      const err = await submitRes.json().catch(() => ({}));
      throw new Error(err.message || 'Qwen API submit error');
    }
    const submitData = await submitRes.json() as { output: { task_id: string } };
    const taskId = submitData.output.task_id;

    // Step 2: Poll for result (max 60s)
    const pollUrl = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const pollRes = await fetch(pollUrl, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      if (!pollRes.ok) continue;
      const pollData = await pollRes.json() as {
        output: { task_status: string; results?: Array<{ url: string }> };
      };
      if (pollData.output.task_status === 'SUCCEEDED') {
        const url = pollData.output.results?.[0]?.url;
        if (url) {
          const imgRes = await fetch(url);
          if (imgRes.ok) {
            const buffer = await imgRes.arrayBuffer();
            return Buffer.from(buffer).toString('base64');
          }
        }
        throw new Error('Qwen returned no image URL');
      }
      if (pollData.output.task_status === 'FAILED') {
        throw new Error('Qwen generation failed');
      }
    }
    throw new Error('Qwen generation timeout');
  },
};
