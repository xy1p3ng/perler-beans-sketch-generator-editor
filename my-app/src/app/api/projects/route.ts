import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const projects = db.prepare(
      `SELECT p.*, COUNT(c.id) as total_cells
       FROM projects p
       LEFT JOIN cells c ON p.id = c.project_id
       GROUP BY p.id
       ORDER BY p.updated_at DESC`
    ).all();
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string || '未命名项目';
    const rows = parseInt(formData.get('rows') as string) || 50;
    const cols = parseInt(formData.get('cols') as string) || 50;
    const boardType = formData.get('board_type') as string || '29x29';
    const paletteId = formData.get('palette_id') as string || 'mard';
    const colorLimit = parseInt(formData.get('color_limit') as string) || 32;
    const ditherEnabled = parseInt(formData.get('dither_enabled') as string) || 0;
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}_${imageFile.name}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    const result = db.prepare(
      `INSERT INTO projects (name, source_image, rows, cols, board_type, palette_id, color_limit, dither_enabled)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(name, `/uploads/${filename}`, rows, cols, boardType, paletteId, colorLimit, ditherEnabled);

    const projectId = result.lastInsertRowid;
    return NextResponse.json({ id: projectId, message: 'Project created' }, { status: 201 });
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
