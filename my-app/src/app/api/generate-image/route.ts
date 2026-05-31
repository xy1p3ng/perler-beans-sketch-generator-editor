import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getProvider } from '@/lib/image-providers';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider: providerId, prompt, model, size, style } = body;

    if (!providerId || !prompt) {
      return NextResponse.json({ error: 'Provider and prompt are required' }, { status: 400 });
    }

    const provider = getProvider(providerId);
    if (!provider) {
      return NextResponse.json({ error: `Unknown provider: ${providerId}` }, { status: 400 });
    }

    // Get API key from provider_configs
    const config = db.prepare('SELECT api_key FROM provider_configs WHERE provider = ?').get(providerId) as { api_key: string } | undefined;
    if (!config?.api_key) {
      return NextResponse.json({ error: `API key not configured for ${provider.config.name}. Please set up in Settings.` }, { status: 400 });
    }

    // Generate image
    const b64Data = await provider.generate(config.api_key, prompt, { model, size, style });

    // Save to file
    const buffer = Buffer.from(b64Data, 'base64');
    const filename = `ai_${Date.now()}.png`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ imageUrl: `/uploads/${filename}` });
  } catch (error) {
    console.error('Generate image error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to generate image' }, { status: 500 });
  }
}
