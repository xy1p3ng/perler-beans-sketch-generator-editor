import { ImageProvider } from './types';
import { openaiProvider } from './openai';
import { geminiProvider } from './gemini';
import { zhipuProvider } from './zhipu';
import { qwenProvider } from './qwen';

export * from './types';

export const PROVIDERS: ImageProvider[] = [
  openaiProvider,
  geminiProvider,
  zhipuProvider,
  qwenProvider,
];

export const PROVIDER_MAP = new Map(PROVIDERS.map(p => [p.config.id, p]));

export function getProvider(id: string): ImageProvider | undefined {
  return PROVIDER_MAP.get(id);
}
