import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { PROVIDERS } from '@/lib/image-providers';

export async function GET() {
  try {
    const rows = db.prepare('SELECT provider, api_key, model, is_active FROM provider_configs').all() as Array<{ provider: string; api_key: string; model: string; is_active: number }>;
    const configs = rows.map(r => ({
      provider: r.provider,
      hasKey: !!r.api_key,
      model: r.model,
      isActive: !!r.is_active,
    }));
    return NextResponse.json({ providers: PROVIDERS.map(p => p.config), configs });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch configs' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, api_key, model, is_active } = body;

    const existing = db.prepare('SELECT id FROM provider_configs WHERE provider = ?').get(provider) as { id: number } | undefined;

    if (existing) {
      db.prepare(
        'UPDATE provider_configs SET api_key = ?, model = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE provider = ?'
      ).run(api_key || null, model || null, is_active ? 1 : 0, provider);
    } else {
      db.prepare(
        'INSERT INTO provider_configs (provider, api_key, model, is_active) VALUES (?, ?, ?, ?)'
      ).run(provider, api_key || null, model || null, is_active ? 1 : 0);
    }

    return NextResponse.json({ message: 'Config saved' });
  } catch (error) {
    console.error('Save config error:', error);
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}
