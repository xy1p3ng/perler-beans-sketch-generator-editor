import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const settings = db.prepare('SELECT id, default_model, default_style FROM user_settings ORDER BY id DESC LIMIT 1').get();
    return NextResponse.json({ settings: settings || null });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { openai_api_key, default_model, default_style } = body;

    const existing = db.prepare('SELECT id FROM user_settings LIMIT 1').get() as { id: number } | undefined;

    if (existing) {
      db.prepare(
        'UPDATE user_settings SET openai_api_key = ?, default_model = ?, default_style = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).run(openai_api_key || null, default_model || 'dall-e-3', default_style || 'cartoon', existing.id);
    } else {
      db.prepare(
        'INSERT INTO user_settings (openai_api_key, default_model, default_style) VALUES (?, ?, ?)'
      ).run(openai_api_key || null, default_model || 'dall-e-3', default_style || 'cartoon');
    }

    return NextResponse.json({ message: 'Settings saved' });
  } catch (error) {
    console.error('Save settings error:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
