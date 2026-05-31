import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import fs from 'fs';
import path from 'path';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    const cells = db.prepare('SELECT * FROM cells WHERE project_id = ? ORDER BY row, col').all(id);
    return NextResponse.json({ project, cells });
  } catch (error) {
    console.error('Failed to fetch project:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, status } = body;
    const updates: string[] = [];
    const values: (string | number)[] = [];
    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }
    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }
    values.push(id);
    db.prepare(`UPDATE projects SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
    return NextResponse.json({ message: 'Project updated' });
  } catch (error) {
    console.error('Failed to update project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as { source_image: string } | undefined;
    if (project) {
      const imagePath = path.join(process.cwd(), 'public', project.source_image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    db.prepare('DELETE FROM projects WHERE id = ?').run(id);
    return NextResponse.json({ message: 'Project deleted' });
  } catch (error) {
    console.error('Failed to delete project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
