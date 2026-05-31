import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { cells, completed } = body as {
      cells?: Array<{ row: number; col: number; color_no: string; hex: string }>;
      completed?: Array<{ row: number; col: number; completed: number }>;
    };

    if (cells && Array.isArray(cells) && cells.length > 0) {
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
    }

    if (completed && Array.isArray(completed) && completed.length > 0) {
      const updateCompleted = db.prepare(
        `UPDATE cells SET completed = ? WHERE project_id = ? AND row = ? AND col = ?`
      );
      const updateManyCompleted = db.transaction((list: typeof completed) => {
        for (const item of list) {
          updateCompleted.run(item.completed, id, item.row, item.col);
        }
      });
      updateManyCompleted(completed);
    }

    if ((!cells || cells.length === 0) && (!completed || completed.length === 0)) {
      return NextResponse.json({ error: 'No cells or completed data provided' }, { status: 400 });
    }

    db.prepare('UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
    return NextResponse.json({ message: 'Cells updated', count: (cells?.length || 0) + (completed?.length || 0) });
  } catch (error) {
    console.error('Failed to update cells:', error);
    return NextResponse.json({ error: 'Failed to update cells' }, { status: 500 });
  }
}
