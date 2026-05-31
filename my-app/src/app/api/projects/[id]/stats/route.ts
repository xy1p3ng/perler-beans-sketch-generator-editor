import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const totalResult = db.prepare('SELECT COUNT(*) as total FROM cells WHERE project_id = ? AND color_no IS NOT NULL').get(id) as { total: number };
    const total = totalResult.total;
    const stats = db.prepare(
      `SELECT c.color_no, c.hex, p.name, COUNT(*) as count
       FROM cells c
       LEFT JOIN palettes p ON c.color_no = p.color_no
       WHERE c.project_id = ? AND c.color_no IS NOT NULL
       GROUP BY c.color_no, c.hex
       ORDER BY count DESC`
    ).all(id) as Array<{ color_no: string; hex: string; name: string | null; count: number }>;
    const statsWithPercentage = stats.map(s => ({
      ...s,
      name: s.name || 'Unknown',
      percentage: total > 0 ? Math.round((s.count / total) * 100) : 0
    }));
    return NextResponse.json({ total, stats: statsWithPercentage });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
