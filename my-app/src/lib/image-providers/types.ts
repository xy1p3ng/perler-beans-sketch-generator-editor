export interface GenerateOptions {
  prompt?: string;
  size?: string;
  style?: string;
  model?: string;
}

export interface ProviderModel {
  id: string;
  name: string;
}

export interface ImageProviderConfig {
  id: string;
  name: string;
  models: ProviderModel[];
  defaultModel: string;
  requiresBaseUrl: boolean;
}

export interface ImageProvider {
  config: ImageProviderConfig;
  generate(apiKey: string, prompt: string, options?: GenerateOptions): Promise<string>;
}
