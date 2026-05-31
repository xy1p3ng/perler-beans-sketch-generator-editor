import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { cells } = body as { cells: Array<{ row: number; col: number; color_no: string; hex: string }> };
    if (!cells || !Array.isArray(cells) || cells.length === 0) {
      return NextResponse.json({ error: 'No cells provided' }, { status: 400 });
    }
    const updateCell = db.prepare(
      `INSERT INTO cells (project_id, row, col, color_no, hex)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(project_id, row, col)
       DO UPDATE SET color_no = excluded.color_no, hex = excluded.hex`
    );
    const updateMany = db.transaction((cellList: typeof cells) => {
      for (const cell of cellList) {
        updateCell.run(id, cell.row, cell.col, cell.color_no, cell.hex);
      }
    });
    updateMany(cells);
    db.prepare('UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
    return NextResponse.json({ message: 'Cells updated', count: cells.length });
  } catch (error) {
    console.error('Failed to update cells:', error);
    return NextResponse.json({ error: 'Failed to update cells' }, { status: 500 });
  }
}
