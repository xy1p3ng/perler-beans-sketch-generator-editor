import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, size = '1024x1024', style = 'vivid' } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Get API key from settings
    const settings = db.prepare('SELECT openai_api_key, default_model FROM user_settings ORDER BY id DESC LIMIT 1').get() as { openai_api_key: string; default_model: string } | undefined;
    const apiKey = settings?.openai_api_key;
    const model = settings?.default_model || 'dall-e-3';

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured. Please set up in Settings.' }, { status: 400 });
    }

    // Call OpenAI DALL-E API
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        prompt,
        n: 1,
        size,
        style,
        response_format: 'b64_json',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      return NextResponse.json({ error: errorData.error?.message || 'Image generation failed' }, { status: 500 });
    }

    const data = await response.json() as { data: Array<{ b64_json: string }> };
    const b64Json = data.data[0]?.b64_json;

    if (!b64Json) {
      return NextResponse.json({ error: 'No image returned from API' }, { status: 500 });
    }

    // Save base64 image to file
    const buffer = Buffer.from(b64Json, 'base64');
    const filename = `ai_${Date.now()}.png`;
    const fs = await import('fs');
    const path = await import('path');
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ imageUrl: `/uploads/${filename}` });
  } catch (error) {
    console.error('Generate image error:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}
