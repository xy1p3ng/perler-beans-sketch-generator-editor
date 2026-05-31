import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const palettes = db.prepare('SELECT * FROM palettes ORDER BY color_no').all();
    return NextResponse.json({ palettes });
  } catch (error) {
    console.error('Failed to fetch palettes:', error);
    return NextResponse.json({ error: 'Failed to fetch palettes' }, { status: 500 });
  }
}
