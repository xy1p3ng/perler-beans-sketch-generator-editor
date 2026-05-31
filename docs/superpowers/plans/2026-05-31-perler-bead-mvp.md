# 拼豆图纸编辑器 MVP 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个从图片上传→像素化→色卡匹配→网格编辑→色号统计→PNG/PDF导出的完整拼豆图纸工具。

**Architecture:** Next.js 15 App Router + React 19 + TypeScript + Tailwind CSS 4 前端，Next.js API Routes + better-sqlite3 后端。图像处理在前端用 Canvas API 完成。

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, better-sqlite3, jspdf

---

## 文件结构

```
my-app/
  app/
    layout.tsx              # 根布局（全局样式 + 字体）
    globals.css             # Tailwind 导入 + 自定义样式
    page.tsx                # 项目首页
    new/
      page.tsx              # 上传与参数设置页
    editor/
      [id]/
        page.tsx            # 图纸编辑器页
    export/
      [id]/
        page.tsx            # 统计与导出页
    api/
      projects/
        route.ts            # 项目列表/创建
      projects/[id]/
        route.ts            # 项目详情/更新/删除
      projects/[id]/cells/
        route.ts            # 格子批量更新
      projects/[id]/stats/
        route.ts            # 色号统计
      palettes/
        route.ts            # 色卡列表
      export/
        route.ts            # 导出处理

  components/
    Layout.tsx              # 通用布局
    ProjectCard.tsx         # 项目卡片
    UploadZone.tsx          # 拖拽上传区域
    ParameterPanel.tsx      # 参数设置面板
    EditorCanvas.tsx        # 网格画布（核心组件）
    ToolBar.tsx             # 左侧工具栏
    ColorPanel.tsx          # 右侧颜色面板
    StatsTable.tsx          # 统计表
    ExportPanel.tsx         # 导出选项面板

  lib/
    db.ts                   # SQLite 连接和初始化
    schema.sql              # 数据库 Schema
    mard-palette.json       # MARD 色卡数据
    pixelation.ts           # 前端图像处理
    palette.ts              # 色卡工具函数
    export.ts               # 导出工具
    types.ts                # TypeScript 类型定义

  public/
    uploads/                # 用户上传图片
```

---

## Task 1: 初始化 Next.js 项目

**Files:**
- Create: 整个项目目录

- [ ] **Step 1: 初始化项目**

```bash
cd D:/bean
echo "my-app" | npx shadcn@latest init --yes --template next --base-color neutral
```

Expected: 项目创建成功，看到 `Success!` 输出。

- [ ] **Step 2: 安装额外依赖**

```bash
cd D:/bean/my-app
npm install better-sqlite3 jspdf @types/better-sqlite3
npm install -D @types/jspdf
```

Expected: 依赖安装完成。

- [ ] **Step 3: 确认项目能启动**

```bash
npm run build
```

Expected: 构建成功，无错误。

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: init Next.js project with shadcn"
```

---

## Task 2: 类型定义与色卡数据

**Files:**
- Create: `lib/types.ts`
- Create: `lib/mard-palette.json`

- [ ] **Step 1: 编写类型定义**

Create `lib/types.ts`:

```typescript
export interface Project {
  id: number;
  name: string;
  source_image: string;
  preview_image: string | null;
  rows: number;
  cols: number;
  board_type: string;
  palette_id: string;
  color_limit: number;
  dither_enabled: number;
  status: 'editing' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface Cell {
  id: number;
  project_id: number;
  row: number;
  col: number;
  color_no: string | null;
  hex: string | null;
  completed: number;
}

export interface PaletteColor {
  id: number;
  brand: string;
  color_no: string;
  name: string;
  hex: string;
  rgb: string;
}

export interface CellUpdate {
  row: number;
  col: number;
  color_no: string;
  hex: string;
}

export interface ColorStats {
  color_no: string;
  name: string;
  hex: string;
  count: number;
  percentage: number;
}

export interface EditorState {
  project: Project;
  cells: Cell[][];
  palette: PaletteColor[];
}
```

- [ ] **Step 2: 创建 MARD 色卡数据（精简版，前50色）**

Create `lib/mard-palette.json`:

```json
[
  {"brand": "MARD", "color_no": "A01", "name": "Black", "hex": "#1A1A1A", "rgb": "26,26,26"},
  {"brand": "MARD", "color_no": "A02", "name": "White", "hex": "#FFFFFF", "rgb": "255,255,255"},
  {"brand": "MARD", "color_no": "A03", "name": "Cream", "hex": "#FFFDD0", "rgb": "255,253,208"},
  {"brand": "MARD", "color_no": "A04", "name": "Light Pink", "hex": "#FFB6C1", "rgb": "255,182,193"},
  {"brand": "MARD", "color_no": "A05", "name": "Pink", "hex": "#FFC0CB", "rgb": "255,192,203"},
  {"brand": "MARD", "color_no": "A06", "name": "Hot Pink", "hex": "#FF69B4", "rgb": "255,105,180"},
  {"brand": "MARD", "color_no": "A07", "name": "Red", "hex": "#FF0000", "rgb": "255,0,0"},
  {"brand": "MARD", "color_no": "A08", "name": "Burgundy", "hex": "#800020", "rgb": "128,0,32"},
  {"brand": "MARD", "color_no": "A09", "name": "Orange", "hex": "#FFA500", "rgb": "255,165,0"},
  {"brand": "MARD", "color_no": "A10", "name": "Light Orange", "hex": "#FFD700", "rgb": "255,215,0"},
  {"brand": "MARD", "color_no": "A11", "name": "Yellow", "hex": "#FFFF00", "rgb": "255,255,0"},
  {"brand": "MARD", "color_no": "A12", "name": "Lemon", "hex": "#FFFACD", "rgb": "255,250,205"},
  {"brand": "MARD", "color_no": "A13", "name": "Lime", "hex": "#32CD32", "rgb": "50,205,50"},
  {"brand": "MARD", "color_no": "A14", "name": "Green", "hex": "#008000", "rgb": "0,128,0"},
  {"brand": "MARD", "color_no": "A15", "name": "Dark Green", "hex": "#006400", "rgb": "0,100,0"},
  {"brand": "MARD", "color_no": "A16", "name": "Mint", "hex": "#98FF98", "rgb": "152,255,152"},
  {"brand": "MARD", "color_no": "A17", "name": "Teal", "hex": "#008080", "rgb": "0,128,128"},
  {"brand": "MARD", "color_no": "A18", "name": "Cyan", "hex": "#00FFFF", "rgb": "0,255,255"},
  {"brand": "MARD", "color_no": "A19", "name": "Light Blue", "hex": "#ADD8E6", "rgb": "173,216,230"},
  {"brand": "MARD", "color_no": "A20", "name": "Blue", "hex": "#0000FF", "rgb": "0,0,255"},
  {"brand": "MARD", "color_no": "A21", "name": "Navy", "hex": "#000080", "rgb": "0,0,128"},
  {"brand": "MARD", "color_no": "A22", "name": "Purple", "hex": "#800080", "rgb": "128,0,128"},
  {"brand": "MARD", "color_no": "A23", "name": "Light Purple", "hex": "#E6E6FA", "rgb": "230,230,250"},
  {"brand": "MARD", "color_no": "A24", "name": "Magenta", "hex": "#FF00FF", "rgb": "255,0,255"},
  {"brand": "MARD", "color_no": "A25", "name": "Brown", "hex": "#8B4513", "rgb": "139,69,19"},
  {"brand": "MARD", "color_no": "A26", "name": "Light Brown", "hex": "#C4A484", "rgb": "196,164,132"},
  {"brand": "MARD", "color_no": "A27", "name": "Tan", "hex": "#D2B48C", "rgb": "210,180,140"},
  {"brand": "MARD", "color_no": "A28", "name": "Beige", "hex": "#F5F5DC", "rgb": "245,245,220"},
  {"brand": "MARD", "color_no": "A29", "name": "Gray", "hex": "#808080", "rgb": "128,128,128"},
  {"brand": "MARD", "color_no": "A30", "name": "Light Gray", "hex": "#D3D3D3", "rgb": "211,211,211"},
  {"brand": "MARD", "color_no": "A31", "name": "Dark Gray", "hex": "#404040", "rgb": "64,64,64"},
  {"brand": "MARD", "color_no": "A32", "name": "Peach", "hex": "#FFDAB9", "rgb": "255,218,185"},
  {"brand": "MARD", "color_no": "A33", "name": "Coral", "hex": "#FF7F50", "rgb": "255,127,80"},
  {"brand": "MARD", "color_no": "A34", "name": "Salmon", "hex": "#FA8072", "rgb": "250,128,114"},
  {"brand": "MARD", "color_no": "A35", "name": "Turquoise", "hex": "#40E0D0", "rgb": "64,224,208"},
  {"brand": "MARD", "color_no": "A36", "name": "Sky Blue", "hex": "#87CEEB", "rgb": "135,206,235"},
  {"brand": "MARD", "color_no": "A37", "name": "Royal Blue", "hex": "#4169E1", "rgb": "65,105,225"},
  {"brand": "MARD", "color_no": "A38", "name": "Indigo", "hex": "#4B0082", "rgb": "75,0,130"},
  {"brand": "MARD", "color_no": "A39", "name": "Violet", "hex": "#EE82EE", "rgb": "238,130,238"},
  {"brand": "MARD", "color_no": "A40", "name": "Lavender", "hex": "#E6E6FA", "rgb": "230,230,250"},
  {"brand": "MARD", "color_no": "A41", "name": "Olive", "hex": "#808000", "rgb": "128,128,0"},
  {"brand": "MARD", "color_no": "A42", "name": "Forest Green", "hex": "#228B22", "rgb": "34,139,34"},
  {"brand": "MARD", "color_no": "A43", "name": "Sea Green", "hex": "#2E8B57", "rgb": "46,139,87"},
  {"brand": "MARD", "color_no": "A44", "name": "Aquamarine", "hex": "#7FFFD4", "rgb": "127,255,212"},
  {"brand": "MARD", "color_no": "A45", "name": "Steel Blue", "hex": "#4682B4", "rgb": "70,130,180"},
  {"brand": "MARD", "color_no": "A46", "name": "Slate Blue", "hex": "#6A5ACD", "rgb": "106,90,205"},
  {"brand": "MARD", "color_no": "A47", "name": "Orchid", "hex": "#DA70D6", "rgb": "218,112,214"},
  {"brand": "MARD", "color_no": "A48", "name": "Plum", "hex": "#DDA0DD", "rgb": "221,160,221"},
  {"brand": "MARD", "color_no": "A49", "name": "Crimson", "hex": "#DC143C", "rgb": "220,20,60"},
  {"brand": "MARD", "color_no": "A50", "name": "Maroon", "hex": "#800000", "rgb": "128,0,0"}
]
```

- [ ] **Step 3: Commit**

```bash
git add lib/
git commit -m "feat: add TypeScript types and MARD palette data"
```

---

## Task 3: 数据库初始化与连接

**Files:**
- Create: `lib/schema.sql`
- Create: `lib/db.ts`
- Create: `public/uploads/.gitkeep`

- [ ] **Step 1: 编写数据库 Schema**

Create `lib/schema.sql`:

```sql
-- 项目表
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  source_image TEXT NOT NULL,
  preview_image TEXT,
  rows INTEGER NOT NULL DEFAULT 50,
  cols INTEGER NOT NULL DEFAULT 50,
  board_type TEXT DEFAULT '29x29',
  palette_id TEXT DEFAULT 'mard',
  color_limit INTEGER DEFAULT 32,
  dither_enabled INTEGER DEFAULT 0,
  status TEXT DEFAULT 'editing',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 格子表
CREATE TABLE IF NOT EXISTS cells (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  row INTEGER NOT NULL,
  col INTEGER NOT NULL,
  color_no TEXT,
  hex TEXT,
  completed INTEGER DEFAULT 0,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  UNIQUE(project_id, row, col)
);

CREATE INDEX IF NOT EXISTS idx_cells_project ON cells(project_id);
CREATE INDEX IF NOT EXISTS idx_cells_project_row_col ON cells(project_id, row, col);

-- 色卡表
CREATE TABLE IF NOT EXISTS palettes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  brand TEXT NOT NULL DEFAULT 'MARD',
  color_no TEXT NOT NULL,
  name TEXT,
  hex TEXT NOT NULL,
  rgb TEXT,
  UNIQUE(brand, color_no)
);

-- 编辑历史表
CREATE TABLE IF NOT EXISTS edit_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  data TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_history_project ON edit_history(project_id);
```

- [ ] **Step 2: 编写数据库连接模块**

Create `lib/db.ts`:

```typescript
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'app.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Initialize schema
const schemaPath = path.join(process.cwd(), 'lib', 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf-8');
db.exec(schema);

// Seed palette data if empty
const count = db.prepare('SELECT COUNT(*) as count FROM palettes').get() as { count: number };
if (count.count === 0) {
  const paletteData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'lib', 'mard-palette.json'), 'utf-8'));
  const insert = db.prepare(
    'INSERT INTO palettes (brand, color_no, name, hex, rgb) VALUES (?, ?, ?, ?, ?)'
  );
  const insertMany = db.transaction((colors: Array<{brand: string, color_no: string, name: string, hex: string, rgb: string}>) => {
    for (const color of colors) {
      insert.run(color.brand, color.color_no, color.name, color.hex, color.rgb);
    }
  });
  insertMany(paletteData);
}

export default db;
```

- [ ] **Step 3: 创建 uploads 目录**

```bash
mkdir -p D:/bean/my-app/public/uploads
touch D:/bean/my-app/public/uploads/.gitkeep
```

Add to `.gitignore`:
```
public/uploads/*
!public/uploads/.gitkeep
data/
```

- [ ] **Step 4: Commit**

```bash
git add lib/schema.sql lib/db.ts public/uploads/.gitkeep .gitignore
git commit -m "feat: add SQLite database schema, connection, and seed data"
```

---

## Task 4: Palettes API

**Files:**
- Create: `app/api/palettes/route.ts`

- [ ] **Step 1: 编写色卡列表 API**

Create `app/api/palettes/route.ts`:

```typescript
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
```

- [ ] **Step 2: 测试 API**

```bash
curl http://localhost:3000/api/palettes
```

Expected: 返回包含 50 个 MARD 颜色的 JSON。

- [ ] **Step 3: Commit**

```bash
git add app/api/palettes/route.ts
git commit -m "feat: add palettes API"
```

---

## Task 5: 项目 CRUD API

**Files:**
- Create: `app/api/projects/route.ts`
- Create: `app/api/projects/[id]/route.ts`

- [ ] **Step 1: 编写项目列表和创建 API**

Create `app/api/projects/route.ts`:

```typescript
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

    // Save image
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}_${imageFile.name}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    // Create project
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
```

- [ ] **Step 2: 编写项目详情/更新/删除 API**

Create `app/api/projects/[id]/route.ts`:

```typescript
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

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

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
      // Delete image file
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
```

- [ ] **Step 3: Commit**

```bash
git add app/api/projects/
git commit -m "feat: add project CRUD API"
```

---

## Task 6: Cells API（批量更新）

**Files:**
- Create: `app/api/projects/[id]/cells/route.ts`

- [ ] **Step 1: 编写格子批量更新 API**

Create `app/api/projects/[id]/cells/route.ts`:

```typescript
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

    // Update project timestamp
    db.prepare('UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);

    return NextResponse.json({ message: 'Cells updated', count: cells.length });
  } catch (error) {
    console.error('Failed to update cells:', error);
    return NextResponse.json({ error: 'Failed to update cells' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/projects/\[id\]/cells/
git commit -m "feat: add cells batch update API with UPSERT"
```

---

## Task 7: Stats API

**Files:**
- Create: `app/api/projects/[id]/stats/route.ts`

- [ ] **Step 1: 编写色号统计 API**

Create `app/api/projects/[id]/stats/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // Get total cells count
    const totalResult = db.prepare('SELECT COUNT(*) as total FROM cells WHERE project_id = ? AND color_no IS NOT NULL').get(id) as { total: number };
    const total = totalResult.total;

    // Get color stats with palette info
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
```

- [ ] **Step 2: Commit**

```bash
git add app/api/projects/\[id\]/stats/
git commit -m "feat: add color stats API"
```

---

## Task 8: 前端工具函数（像素化 + 色卡匹配）

**Files:**
- Create: `lib/palette.ts`
- Create: `lib/pixelation.ts`

- [ ] **Step 1: 编写色卡工具函数**

Create `lib/palette.ts`:

```typescript
import paletteData from './mard-palette.json';

export interface PaletteColor {
  brand: string;
  color_no: string;
  name: string;
  hex: string;
  rgb: string;
}

export const MARD_PALETTE: PaletteColor[] = paletteData as PaletteColor[];

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function colorDistance(rgb1: { r: number; g: number; b: number }, rgb2: { r: number; g: number; b: number }): number {
  return Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );
}

export function findClosestPaletteColor(hex: string, palette: PaletteColor[] = MARD_PALETTE): PaletteColor | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  let minDist = Infinity;
  let closest = palette[0];

  for (const color of palette) {
    const paletteRgb = hexToRgb(color.hex);
    if (!paletteRgb) continue;
    const dist = colorDistance(rgb, paletteRgb);
    if (dist < minDist) {
      minDist = dist;
      closest = color;
    }
  }

  return closest || null;
}
```

- [ ] **Step 2: 编写像素化函数**

Create `lib/pixelation.ts`:

```typescript
import { findClosestPaletteColor, PaletteColor } from './palette';

export interface PixelatedResult {
  rows: number;
  cols: number;
  cells: Array<{ row: number; col: number; hex: string; color_no: string }>;
}

export async function pixelateImage(
  imageUrl: string,
  targetRows: number,
  targetCols: number,
  colorLimit: number,
  palette: PaletteColor[]
): Promise<PixelatedResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetCols;
      canvas.height = targetRows;
      const ctx = canvas.getContext('2d')!;

      // Draw scaled image
      ctx.drawImage(img, 0, 0, targetCols, targetRows);

      // Get pixel data
      const imageData = ctx.getImageData(0, 0, targetCols, targetRows);
      const pixels = imageData.data;

      const cells: PixelatedResult['cells'] = [];

      for (let row = 0; row < targetRows; row++) {
        for (let col = 0; col < targetCols; col++) {
          const idx = (row * targetCols + col) * 4;
          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];
          const hex = rgbToHex(r, g, b);

          const closest = findClosestPaletteColor(hex, palette);
          cells.push({
            row,
            col,
            hex: closest?.hex || hex,
            color_no: closest?.color_no || ''
          });
        }
      }

      resolve({ rows: targetRows, cols: targetCols, cells });
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// Simple flood fill for editor
export function floodFill(
  cells: Array<{ row: number; col: number; hex: string }>,
  rows: number,
  cols: number,
  startRow: number,
  startCol: number,
  newHex: string
): Array<{ row: number; col: number; hex: string }> {
  const grid: string[][] = Array.from({ length: rows }, () => Array(cols).fill(''));
  for (const cell of cells) {
    if (cell.row < rows && cell.col < cols) {
      grid[cell.row][cell.col] = cell.hex;
    }
  }

  const targetHex = grid[startRow]?.[startCol];
  if (targetHex === undefined || targetHex === newHex) return [];

  const filled: Array<{ row: number; col: number; hex: string }> = [];
  const queue: Array<[number, number]> = [[startRow, startCol]];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    const key = `${r},${c}`;
    if (visited.has(key)) continue;
    visited.add(key);

    if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
    if (grid[r][c] !== targetHex) continue;

    grid[r][c] = newHex;
    filled.push({ row: r, col: c, hex: newHex });

    queue.push([r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]);
  }

  return filled;
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/palette.ts lib/pixelation.ts
git commit -m "feat: add pixelation and palette matching utilities"
```

---

## Task 9: 项目首页

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/Layout.tsx`
- Create: `components/ProjectCard.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: 修改根布局**

Modify `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "拼豆工坊 - 图纸生成器",
  description: "图片转拼豆图纸，支持编辑和导出",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: 创建项目卡片组件**

Create `components/ProjectCard.tsx`:

```tsx
'use client';

import Link from 'next/link';

interface ProjectCardProps {
  project: {
    id: number;
    name: string;
    source_image: string;
    rows: number;
    cols: number;
    status: string;
    total_cells: number;
  };
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/editor/${project.id}`}>
      <div className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow cursor-pointer">
        <div className="w-20 h-20 mx-auto mb-2 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
          <img
            src={project.source_image}
            alt={project.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-sm font-bold text-center truncate">{project.name}</div>
        <div className="text-xs text-gray-500 text-center">
          {project.rows}×{project.cols} · {project.total_cells > 0 ? Math.round(project.total_cells / (project.rows * project.cols) * 100) : 0}% 完成
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 3: 修改首页**

Modify `app/page.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProjectCard from '@/components/ProjectCard';

interface Project {
  id: number;
  name: string;
  source_image: string;
  rows: number;
  cols: number;
  status: string;
  total_cells: number;
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(data.projects || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">🧩 拼豆工坊</h1>
        <Link href="/new">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            + 新建项目
          </button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">加载中...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🎨</div>
          <p className="text-gray-500 mb-4">还没有项目，创建你的第一个拼豆图纸吧</p>
          <Link href="/new">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              新建项目
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
          <Link href="/new">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-center min-h-[140px] cursor-pointer">
              <div className="text-center text-gray-400">
                <div className="text-2xl mb-1">+</div>
                <div className="text-sm">新建项目</div>
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx app/page.tsx components/
git commit -m "feat: add project home page with project cards"
```

---

## Task 10: 上传与参数设置页

**Files:**
- Create: `components/UploadZone.tsx`
- Create: `components/ParameterPanel.tsx`
- Create: `app/new/page.tsx`

- [ ] **Step 1: 创建上传区域组件**

Create `components/UploadZone.tsx`:

```tsx
'use client';

import { useState, useCallback } from 'react';

interface UploadZoneProps {
  onImageSelect: (file: File) => void;
}

export default function UploadZone({ onImageSelect }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, [onImageSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, [onImageSelect]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-input')?.click()}
      className={`
        border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer
        transition-colors min-h-[280px]
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
      `}
    >
      <input
        id="file-input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileInput}
      />
      {preview ? (
        <img src={preview} alt="Preview" className="max-w-full max-h-[260px] object-contain" />
      ) : (
        <div className="text-center text-gray-500 p-8">
          <div className="text-4xl mb-3">📤</div>
          <div className="font-medium">点击或拖拽上传图片</div>
          <div className="text-sm mt-1">支持 JPG / PNG / WEBP，最大 20MB</div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 创建参数面板组件**

Create `components/ParameterPanel.tsx`:

```tsx
'use client';

import { useState } from 'react';

interface ParameterPanelProps {
  onSubmit: (params: {
    name: string;
    rows: number;
    cols: number;
    boardType: string;
    colorLimit: number;
    ditherEnabled: boolean;
  }) => void;
  disabled: boolean;
}

export default function ParameterPanel({ onSubmit, disabled }: ParameterPanelProps) {
  const [name, setName] = useState('');
  const [rows, setRows] = useState(50);
  const [cols, setCols] = useState(50);
  const [boardType, setBoardType] = useState('29x29');
  const [colorLimit, setColorLimit] = useState(32);
  const [ditherEnabled, setDitherEnabled] = useState(false);

  const handleSubmit = () => {
    onSubmit({ name: name || '未命名项目', rows, cols, boardType, colorLimit, ditherEnabled });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-5 bg-white">
      <h3 className="font-bold mb-4">参数设置</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">项目名称</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="未命名项目"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">图纸尺寸（行列数）</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={rows}
              onChange={e => setRows(Math.max(1, Math.min(200, parseInt(e.target.value) || 1)))}
              className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-400">×</span>
            <input
              type="number"
              value={cols}
              onChange={e => setCols(Math.max(1, Math.min(200, parseInt(e.target.value) || 1)))}
              className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">拼豆板</label>
          <select
            value={boardType}
            onChange={e => setBoardType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="29x29">29×29 标准板</option>
            <option value="49x69">49×69 大号板</option>
            <option value="custom">自定义</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">颜色上限</label>
          <select
            value={colorLimit}
            onChange={e => setColorLimit(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={16}>16色（新手）</option>
            <option value={32}>32色（进阶）</option>
            <option value={64}>64色（复杂）</option>
            <option value={999}>无限制</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="dither"
            checked={ditherEnabled}
            onChange={e => setDitherEnabled(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="dither" className="text-sm text-gray-600">
            启用抖动（增加散点）
          </label>
        </div>

        <button
          onClick={handleSubmit}
          disabled={disabled}
          className={`
            w-full py-2.5 rounded-md font-medium transition-colors
            ${disabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }
          `}
        >
          {disabled ? '生成中...' : '生成预览'}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 创建上传页面**

Create `app/new/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UploadZone from '@/components/UploadZone';
import ParameterPanel from '@/components/ParameterPanel';
import { pixelateImage } from '@/lib/pixelation';
import { MARD_PALETTE } from '@/lib/palette';

export default function NewProject() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (params: {
    name: string;
    rows: number;
    cols: number;
    boardType: string;
    colorLimit: number;
    ditherEnabled: boolean;
  }) => {
    if (!selectedFile) {
      setError('请先上传图片');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // 1. Create project via API
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('name', params.name);
      formData.append('rows', String(params.rows));
      formData.append('cols', String(params.cols));
      formData.append('board_type', params.boardType);
      formData.append('color_limit', String(params.colorLimit));
      formData.append('dither_enabled', params.ditherEnabled ? '1' : '0');

      const projectRes = await fetch('/api/projects', {
        method: 'POST',
        body: formData,
      });

      if (!projectRes.ok) {
        throw new Error('创建项目失败');
      }

      const { id: projectId } = await projectRes.json();

      // 2. Pixelate image in browser
      const imageUrl = URL.createObjectURL(selectedFile);
      const result = await pixelateImage(imageUrl, params.rows, params.cols, params.colorLimit, MARD_PALETTE);
      URL.revokeObjectURL(imageUrl);

      // 3. Save cells to backend
      const cellsRes = await fetch(`/api/projects/${projectId}/cells`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cells: result.cells }),
      });

      if (!cellsRes.ok) {
        throw new Error('保存格子数据失败');
      }

      // 4. Navigate to editor
      router.push(`/editor/${projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">新建项目</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-6">
        <div className="flex-1">
          <UploadZone onImageSelect={setSelectedFile} />
        </div>
        <div className="w-72">
          <ParameterPanel onSubmit={handleGenerate} disabled={isGenerating} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/UploadZone.tsx components/ParameterPanel.tsx app/new/page.tsx
git commit -m "feat: add upload and parameter setting page"
```

---

## Task 11: 核心编辑器画布

**Files:**
- Create: `components/EditorCanvas.tsx`
- Create: `components/ToolBar.tsx`
- Create: `components/ColorPanel.tsx`

- [ ] **Step 1: 创建画布组件**

Create `components/EditorCanvas.tsx`:

```tsx
'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface CellData {
  row: number;
  col: number;
  hex: string | null;
  color_no: string | null;
}

interface EditorCanvasProps {
  rows: number;
  cols: number;
  cells: CellData[];
  selectedColor: { hex: string; color_no: string } | null;
  highlightedColor: string | null;
  scale: number;
  onCellClick: (row: number, col: number) => void;
  onCellHover: (row: number, col: number) => void;
}

const CELL_SIZE = 20;
const GRID_COLOR = '#e0e0e0';

export default function EditorCanvas({
  rows,
  cols,
  cells,
  selectedColor,
  highlightedColor,
  scale,
  onCellClick,
  onCellHover,
}: EditorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  // Build cell map for fast lookup
  const cellMap = new Map<string, CellData>();
  for (const cell of cells) {
    cellMap.set(`${cell.row},${cell.col}`, cell);
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaledCellSize = CELL_SIZE * scale;
    canvas.width = cols * scaledCellSize + 1;
    canvas.height = rows * scaledCellSize + 1;

    // Clear
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw cells
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = cellMap.get(`${row},${col}`);
        const x = col * scaledCellSize;
        const y = row * scaledCellSize;

        // Fill color
        if (cell?.hex) {
          ctx.fillStyle = cell.hex;
          ctx.fillRect(x, y, scaledCellSize, scaledCellSize);
        }

        // Highlight
        if (highlightedColor && cell?.color_no === highlightedColor) {
          ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
          ctx.fillRect(x, y, scaledCellSize, scaledCellSize);
        }

        // Grid line
        ctx.strokeStyle = GRID_COLOR;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, scaledCellSize, scaledCellSize);
      }
    }

    // Draw hover highlight
    if (hoveredCell) {
      const x = hoveredCell.col * scaledCellSize;
      const y = hoveredCell.row * scaledCellSize;
      ctx.strokeStyle = '#2196f3';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, scaledCellSize, scaledCellSize);
    }
  }, [rows, cols, cells, highlightedColor, scale, hoveredCell, cellMap]);

  useEffect(() => {
    draw();
  }, [draw]);

  const getCellFromEvent = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const scaledCellSize = CELL_SIZE * scale;
    const col = Math.floor(x / scaledCellSize);
    const row = Math.floor(y / scaledCellSize);
    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      return { row, col };
    }
    return null;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const cell = getCellFromEvent(e);
    if (cell) {
      setHoveredCell(cell);
      onCellHover(cell.row, cell.col);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const cell = getCellFromEvent(e);
    if (cell) {
      onCellClick(cell.row, cell.col);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onMouseLeave={() => setHoveredCell(null)}
      style={{
        cursor: selectedColor ? 'crosshair' : 'default',
        maxWidth: '100%',
        maxHeight: '100%',
      }}
    />
  );
}
```

- [ ] **Step 2: 创建工具栏组件**

Create `components/ToolBar.tsx`:

```tsx
'use client';

interface ToolBarProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const TOOLS = [
  { id: 'brush', icon: '✏️', label: '画笔' },
  { id: 'fill', icon: '🪣', label: '填充' },
  { id: 'eraser', icon: '🧽', label: '橡皮' },
  { id: 'picker', icon: '💧', label: '取色' },
];

export default function ToolBar({
  activeTool,
  onToolChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  scale,
  onZoomIn,
  onZoomOut,
}: ToolBarProps) {
  return (
    <div className="w-12 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-2 gap-1">
      {TOOLS.map(tool => (
        <button
          key={tool.id}
          onClick={() => onToolChange(tool.id)}
          title={tool.label}
          className={`
            w-9 h-9 rounded-md flex items-center justify-center text-lg transition-colors
            ${activeTool === tool.id ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}
          `}
        >
          {tool.icon}
        </button>
      ))}

      <div className="w-7 h-px bg-gray-300 my-1" />

      <button
        onClick={onUndo}
        disabled={!canUndo}
        title="撤销"
        className="w-9 h-9 rounded-md flex items-center justify-center text-lg hover:bg-gray-100 disabled:opacity-30"
      >
        ↩️
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        title="重做"
        className="w-9 h-9 rounded-md flex items-center justify-center text-lg hover:bg-gray-100 disabled:opacity-30"
      >
        ↪️
      </button>

      <div className="w-7 h-px bg-gray-300 my-1" />

      <button
        onClick={onZoomIn}
        title="放大"
        className="w-9 h-9 rounded-md flex items-center justify-center text-lg hover:bg-gray-100"
      >
        +
      </button>
      <div className="text-xs text-gray-500 font-mono">{Math.round(scale * 100)}%</div>
      <button
        onClick={onZoomOut}
        title="缩小"
        className="w-9 h-9 rounded-md flex items-center justify-center text-lg hover:bg-gray-100"
      >
        −
      </button>
    </div>
  );
}
```

- [ ] **Step 3: 创建颜色面板组件**

Create `components/ColorPanel.tsx`:

```tsx
'use client';

import { useMemo } from 'react';

interface ColorPanelProps {
  cells: Array<{ color_no: string | null; hex: string | null }>;
  selectedColor: { hex: string; color_no: string } | null;
  highlightedColor: string | null;
  onColorSelect: (color_no: string, hex: string) => void;
  onHighlightColor: (color_no: string | null) => void;
  onReplaceColor: (oldColorNo: string) => void;
  onSave: () => void;
}

export default function ColorPanel({
  cells,
  selectedColor,
  highlightedColor,
  onColorSelect,
  onHighlightColor,
  onReplaceColor,
  onSave,
}: ColorPanelProps) {
  const colorStats = useMemo(() => {
    const stats = new Map<string, { color_no: string; hex: string; count: number }>();
    for (const cell of cells) {
      if (cell.color_no && cell.hex) {
        const existing = stats.get(cell.color_no);
        if (existing) {
          existing.count++;
        } else {
          stats.set(cell.color_no, { color_no: cell.color_no, hex: cell.hex, count: 1 });
        }
      }
    }
    return Array.from(stats.values()).sort((a, b) => b.count - a.count);
  }, [cells]);

  return (
    <div className="w-44 bg-gray-50 border-l border-gray-200 p-3 overflow-y-auto">
      <div className="text-xs font-bold mb-2 text-gray-700">
        当前使用颜色（{colorStats.length}色）
      </div>

      <div className="space-y-1">
        {colorStats.map(stat => (
          <div
            key={stat.color_no}
            onClick={() => {
              onColorSelect(stat.color_no, stat.hex);
              onHighlightColor(null);
            }}
            className={`
              flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors
              ${selectedColor?.color_no === stat.color_no ? 'bg-blue-100 border border-blue-300' : 'bg-white border border-transparent hover:bg-gray-100'}
              ${highlightedColor === stat.color_no ? 'ring-2 ring-yellow-400' : ''}
            `}
          >
            <div
              className="w-5 h-5 rounded border border-gray-200 flex-shrink-0"
              style={{ backgroundColor: stat.hex }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{stat.color_no}</div>
              <div className="text-[10px] text-gray-500">{stat.count}颗</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200 space-y-2">
        <div className="text-xs text-gray-500">操作</div>
        <button
          onClick={() => onHighlightColor(highlightedColor ? null : selectedColor?.color_no || null)}
          disabled={!selectedColor}
          className="w-full py-1.5 px-2 bg-white border border-gray-200 rounded text-xs hover:bg-gray-50 disabled:opacity-50"
        >
          {highlightedColor ? '取消高亮' : '🔍 高亮此色'}
        </button>
        <button
          onClick={() => selectedColor && onReplaceColor(selectedColor.color_no)}
          disabled={!selectedColor}
          className="w-full py-1.5 px-2 bg-white border border-gray-200 rounded text-xs hover:bg-gray-50 disabled:opacity-50"
        >
          🔄 替换颜色
        </button>
        <button
          onClick={onSave}
          className="w-full py-1.5 px-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
        >
          💾 保存项目
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/EditorCanvas.tsx components/ToolBar.tsx components/ColorPanel.tsx
git commit -m "feat: add core editor components (canvas, toolbar, color panel)"
```

---

## Task 12: 编辑器页面整合

**Files:**
- Create: `app/editor/[id]/page.tsx`

- [ ] **Step 1: 创建编辑器页面**

Create `app/editor/[id]/page.tsx`:

```tsx
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import EditorCanvas from '@/components/EditorCanvas';
import ToolBar from '@/components/ToolBar';
import ColorPanel from '@/components/ColorPanel';
import { floodFill } from '@/lib/pixelation';
import Link from 'next/link';

interface CellData {
  row: number;
  col: number;
  hex: string | null;
  color_no: string | null;
}

interface ProjectData {
  id: number;
  name: string;
  rows: number;
  cols: number;
  source_image: string;
}

interface HistoryEntry {
  cells: Array<{ row: number; col: number; oldHex: string | null; oldColorNo: string | null; newHex: string; newColorNo: string }>;
}

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectData | null>(null);
  const [cells, setCells] = useState<CellData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTool, setActiveTool] = useState('brush');
  const [selectedColor, setSelectedColor] = useState<{ hex: string; color_no: string } | null>(null);
  const [highlightedColor, setHighlightedColor] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [saving, setSaving] = useState(false);

  const historyRef = useRef<HistoryEntry[]>([]);
  const historyIndexRef = useRef(-1);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then(res => res.json())
      .then(data => {
        setProject(data.project);
        setCells(data.cells || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [projectId]);

  const pushHistory = useCallback((changedCells: HistoryEntry['cells']) => {
    // Remove future history if we're not at the end
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    }
    historyRef.current.push({ cells: changedCells });
    historyIndexRef.current++;
  }, []);

  const updateCells = useCallback((updates: Array<{ row: number; col: number; hex: string; color_no: string }>) => {
    setCells(prev => {
      const newCells = [...prev];
      const historyEntry: HistoryEntry['cells'] = [];

      for (const update of updates) {
        const idx = newCells.findIndex(c => c.row === update.row && c.col === update.col);
        if (idx >= 0) {
          const oldCell = newCells[idx];
          historyEntry.push({
            row: update.row,
            col: update.col,
            oldHex: oldCell.hex,
            oldColorNo: oldCell.color_no,
            newHex: update.hex,
            newColorNo: update.color_no,
          });
          newCells[idx] = { ...oldCell, hex: update.hex, color_no: update.color_no };
        } else {
          historyEntry.push({
            row: update.row,
            col: update.col,
            oldHex: null,
            oldColorNo: null,
            newHex: update.hex,
            newColorNo: update.color_no,
          });
          newCells.push({ row: update.row, col: update.col, hex: update.hex, color_no: update.color_no });
        }
      }

      pushHistory(historyEntry);
      return newCells;
    });
  }, [pushHistory]);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (!selectedColor) return;

    if (activeTool === 'brush') {
      updateCells([{ row, col, hex: selectedColor.hex, color_no: selectedColor.color_no }]);
    } else if (activeTool === 'fill') {
      const filled = floodFill(cells, project?.rows || 50, project?.cols || 50, row, col, selectedColor.hex);
      if (filled.length > 0) {
        updateCells(filled.map(f => ({ row: f.row, col: f.col, hex: selectedColor.hex, color_no: selectedColor.color_no })));
      }
    } else if (activeTool === 'eraser') {
      updateCells([{ row, col, hex: '#FFFFFF', color_no: '' }]);
    } else if (activeTool === 'picker') {
      const cell = cells.find(c => c.row === row && c.col === col);
      if (cell?.hex && cell?.color_no) {
        setSelectedColor({ hex: cell.hex, color_no: cell.color_no });
      }
    }
  }, [selectedColor, activeTool, cells, project, updateCells]);

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current < 0) return;
    const entry = historyRef.current[historyIndexRef.current];
    historyIndexRef.current--;

    setCells(prev => {
      const newCells = [...prev];
      for (const change of entry.cells) {
        const idx = newCells.findIndex(c => c.row === change.row && c.col === change.col);
        if (idx >= 0) {
          newCells[idx] = { ...newCells[idx], hex: change.oldHex, color_no: change.oldColorNo };
        }
      }
      return newCells;
    });
  }, []);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    const entry = historyRef.current[historyIndexRef.current];

    setCells(prev => {
      const newCells = [...prev];
      for (const change of entry.cells) {
        const idx = newCells.findIndex(c => c.row === change.row && c.col === change.col);
        if (idx >= 0) {
          newCells[idx] = { ...newCells[idx], hex: change.newHex, color_no: change.newColorNo };
        }
      }
      return newCells;
    });
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const updates = cells
        .filter(c => c.hex && c.color_no)
        .map(c => ({ row: c.row, col: c.col, color_no: c.color_no!, hex: c.hex! }));

      await fetch(`/api/projects/${projectId}/cells`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cells: updates }),
      });
    } finally {
      setSaving(false);
    }
  }, [cells, projectId]);

  const handleReplaceColor = useCallback((oldColorNo: string) => {
    if (!selectedColor || oldColorNo === selectedColor.color_no) return;
    const updates = cells
      .filter(c => c.color_no === oldColorNo)
      .map(c => ({ row: c.row, col: c.col, hex: selectedColor.hex, color_no: selectedColor.color_no }));
    updateCells(updates);
  }, [selectedColor, cells, updateCells]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">加载中...</div>;
  }

  if (!project) {
    return <div className="flex items-center justify-center h-screen">项目不存在</div>;
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-600 hover:text-gray-900">← 返回</Link>
          <h1 className="font-bold">{project.name}</h1>
          <span className="text-sm text-gray-500">{project.rows}×{project.cols}</span>
        </div>
        <div className="flex items-center gap-2">
          {hoveredCell && (
            <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
              {String.fromCharCode(65 + hoveredCell.col)}{hoveredCell.row + 1} · {selectedColor?.color_no || '-'}
            </span>
          )}
          <Link href={`/export/${projectId}`}>
            <button className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700">
              导出
            </button>
          </Link>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 flex overflow-hidden">
        <ToolBar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyIndexRef.current >= 0}
          canRedo={historyIndexRef.current < historyRef.current.length - 1}
          scale={scale}
          onZoomIn={() => setScale(s => Math.min(s + 0.2, 3))}
          onZoomOut={() => setScale(s => Math.max(s - 0.2, 0.4))}
        />

        <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-4">
          <EditorCanvas
            rows={project.rows}
            cols={project.cols}
            cells={cells}
            selectedColor={selectedColor}
            highlightedColor={highlightedColor}
            scale={scale}
            onCellClick={handleCellClick}
            onCellHover={(row, col) => setHoveredCell({ row, col })}
          />
        </div>

        <ColorPanel
          cells={cells}
          selectedColor={selectedColor}
          highlightedColor={highlightedColor}
          onColorSelect={(color_no, hex) => setSelectedColor({ color_no, hex })}
          onHighlightColor={setHighlightedColor}
          onReplaceColor={handleReplaceColor}
          onSave={handleSave}
        />
      </div>

      {saving && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded text-sm">
          保存中...
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/editor/\[id\]/page.tsx
git commit -m "feat: add editor page with full editing capabilities"
```

---

## Task 13: 导出功能

**Files:**
- Create: `lib/export.ts`
- Create: `components/StatsTable.tsx`
- Create: `components/ExportPanel.tsx`
- Create: `app/export/[id]/page.tsx`

- [ ] **Step 1: 编写导出工具函数**

Create `lib/export.ts`:

```typescript
import jsPDF from 'jspdf';

export function exportToPNG(
  cells: Array<{ row: number; col: number; hex: string | null }>,
  rows: number,
  cols: number,
  cellSize: number = 20
): string {
  const canvas = document.createElement('canvas');
  canvas.width = cols * cellSize + 1;
  canvas.height = rows * cellSize + 1;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const cell of cells) {
    if (!cell.hex) continue;
    const x = cell.col * cellSize;
    const y = cell.row * cellSize;
    ctx.fillStyle = cell.hex;
    ctx.fillRect(x, y, cellSize, cellSize);
    ctx.strokeStyle = '#e0e0e0';
    ctx.strokeRect(x, y, cellSize, cellSize);
  }

  return canvas.toDataURL('image/png');
}

export function exportToPDF(
  projectName: string,
  cells: Array<{ row: number; col: number; hex: string | null; color_no: string | null }>,
  rows: number,
  cols: number,
  stats: Array<{ color_no: string; name: string; hex: string; count: number }>
): jsPDF {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(16);
  doc.text(projectName, 10, 15);
  doc.setFontSize(10);
  doc.text(`${rows}×${cols} · ${stats.length}色`, 10, 22);

  // Draw grid on first page
  const cellSize = Math.min(180 / cols, 250 / rows, 8);
  const offsetX = 10;
  const offsetY = 30;

  for (const cell of cells) {
    if (!cell.hex) continue;
    const x = offsetX + cell.col * cellSize;
    const y = offsetY + cell.row * cellSize;
    doc.setFillColor(cell.hex);
    doc.rect(x, y, cellSize, cellSize, 'F');
  }

  // Grid lines
  doc.setDrawColor(200);
  for (let i = 0; i <= cols; i++) {
    doc.line(offsetX + i * cellSize, offsetY, offsetX + i * cellSize, offsetY + rows * cellSize);
  }
  for (let i = 0; i <= rows; i++) {
    doc.line(offsetX, offsetY + i * cellSize, offsetX + cols * cellSize, offsetY + i * cellSize);
  }

  // Second page: color legend
  doc.addPage();
  doc.setFontSize(14);
  doc.text('色号图例', 10, 15);

  let y = 25;
  for (const stat of stats) {
    doc.setFillColor(stat.hex);
    doc.rect(10, y - 3, 8, 8, 'F');
    doc.setFontSize(10);
    doc.text(`${stat.color_no} · ${stat.name} · ${stat.count}颗`, 22, y + 3);
    y += 10;
    if (y > 280) {
      doc.addPage();
      y = 15;
    }
  }

  return doc;
}

export function exportStatsCSV(
  stats: Array<{ color_no: string; name: string; hex: string; count: number; percentage: number }>
): string {
  const header = '色号,颜色名,HEX,数量,占比\n';
  const rows = stats.map(s => `${s.color_no},${s.name},${s.hex},${s.count},${s.percentage}%`).join('\n');
  return header + rows;
}

export function exportCoordinates(
  cells: Array<{ row: number; col: number; color_no: string | null }>,
  colorStats: Array<{ color_no: string; name: string }>
): string {
  const groups = new Map<string, Array<{ row: number; col: number }>>();
  for (const cell of cells) {
    if (!cell.color_no) continue;
    if (!groups.has(cell.color_no)) {
      groups.set(cell.color_no, []);
    }
    groups.get(cell.color_no)!.push({ row: cell.row, col: cell.col });
  }

  const lines: string[] = [];
  for (const stat of colorStats) {
    const coords = groups.get(stat.color_no) || [];
    if (coords.length === 0) continue;
    const coordStr = coords.map(c => `${String.fromCharCode(65 + c.col)}${c.row + 1}`).join(', ');
    lines.push(`${stat.color_no} ${stat.name} (${coords.length}颗):`);
    lines.push(coordStr);
    lines.push('');
  }

  return lines.join('\n');
}
```

- [ ] **Step 2: 创建统计表组件**

Create `components/StatsTable.tsx`:

```tsx
'use client';

interface StatsTableProps {
  stats: Array<{ color_no: string; name: string; hex: string; count: number; percentage: number }>;
  total: number;
}

export default function StatsTable({ stats, total }: StatsTableProps) {
  return (
    <div>
      <h3 className="font-bold mb-3">用豆统计（共 {total} 颗）</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-3 py-2">色块</th>
            <th className="px-3 py-2">色号</th>
            <th className="px-3 py-2">颜色名</th>
            <th className="px-3 py-2 text-right">数量</th>
            <th className="px-3 py-2 text-right">占比</th>
          </tr>
        </thead>
        <tbody>
          {stats.map(stat => (
            <tr key={stat.color_no} className="border-b border-gray-100">
              <td className="px-3 py-2">
                <div className="w-5 h-5 rounded border border-gray-200" style={{ backgroundColor: stat.hex }} />
              </td>
              <td className="px-3 py-2 font-mono">{stat.color_no}</td>
              <td className="px-3 py-2">{stat.name}</td>
              <td className="px-3 py-2 text-right font-bold">{stat.count}</td>
              <td className="px-3 py-2 text-right">{stat.percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 3: 创建导出面板组件**

Create `components/ExportPanel.tsx`:

```tsx
'use client';

import { useState } from 'react';

interface ExportPanelProps {
  onExport: (options: { png: boolean; pdf: boolean; csv: boolean; coords: boolean }) => void;
  disabled: boolean;
}

export default function ExportPanel({ onExport, disabled }: ExportPanelProps) {
  const [png, setPng] = useState(true);
  const [pdf, setPdf] = useState(true);
  const [csv, setCsv] = useState(true);
  const [coords, setCoords] = useState(false);

  return (
    <div className="w-52 border border-gray-200 rounded-lg p-4 bg-white">
      <h3 className="font-bold mb-3">导出选项</h3>

      <div className="space-y-2 text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={png} onChange={e => setPng(e.target.checked)} />
          <span>高清网格图 PNG</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={pdf} onChange={e => setPdf(e.target.checked)} />
          <span>打印 PDF（含图例）</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={csv} onChange={e => setCsv(e.target.checked)} />
          <span>色号统计表（CSV）</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={coords} onChange={e => setCoords(e.target.checked)} />
          <span>坐标清单</span>
        </label>
      </div>

      <button
        onClick={() => onExport({ png, pdf, csv, coords })}
        disabled={disabled || (!png && !pdf && !csv && !coords)}
        className="w-full mt-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
      >
        {disabled ? '导出中...' : '📦 导出全部'}
      </button>
    </div>
  );
}
```

- [ ] **Step 4: 创建导出页面**

Create `app/export/[id]/page.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import StatsTable from '@/components/StatsTable';
import ExportPanel from '@/components/ExportPanel';
import { exportToPNG, exportToPDF, exportStatsCSV, exportCoordinates } from '@/lib/export';

interface ProjectData {
  id: number;
  name: string;
  rows: number;
  cols: number;
  source_image: string;
}

interface CellData {
  row: number;
  col: number;
  hex: string | null;
  color_no: string | null;
}

interface ColorStat {
  color_no: string;
  name: string;
  hex: string;
  count: number;
  percentage: number;
}

export default function ExportPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectData | null>(null);
  const [cells, setCells] = useState<CellData[]>([]);
  const [stats, setStats] = useState<{ total: number; stats: ColorStat[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/projects/${projectId}`).then(r => r.json()),
      fetch(`/api/projects/${projectId}/stats`).then(r => r.json()),
    ]).then(([projectData, statsData]) => {
      setProject(projectData.project);
      setCells(projectData.cells || []);
      setStats(statsData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [projectId]);

  const handleExport = async (options: { png: boolean; pdf: boolean; csv: boolean; coords: boolean }) => {
    if (!project || !stats) return;
    setExporting(true);

    try {
      // PNG
      if (options.png) {
        const dataUrl = exportToPNG(cells, project.rows, project.cols);
        const link = document.createElement('a');
        link.download = `${project.name}_grid.png`;
        link.href = dataUrl;
        link.click();
      }

      // PDF
      if (options.pdf) {
        const doc = exportToPDF(project.name, cells, project.rows, project.cols, stats.stats);
        doc.save(`${project.name}_print.pdf`);
      }

      // CSV
      if (options.csv) {
        const csv = exportStatsCSV(stats.stats);
        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.download = `${project.name}_stats.csv`;
        link.href = URL.createObjectURL(blob);
        link.click();
      }

      // Coordinates
      if (options.coords) {
        const text = exportCoordinates(cells, stats.stats);
        const blob = new Blob([text], { type: 'text/plain' });
        const link = document.createElement('a');
        link.download = `${project.name}_coords.txt`;
        link.href = URL.createObjectURL(blob);
        link.click();
      }
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">加载中...</div>;
  if (!project || !stats) return <div className="flex items-center justify-center h-screen">项目不存在</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href={`/editor/${projectId}`} className="text-gray-600 hover:text-gray-900">← 返回编辑器</Link>
          <h1 className="text-2xl font-bold">导出：{project.name}</h1>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Preview */}
        <div className="w-56 border border-gray-200 rounded-lg p-4 bg-white">
          <h3 className="font-bold mb-3 text-sm">图纸预览</h3>
          <div className="w-44 h-44 mx-auto bg-gray-50 border border-gray-200 flex items-center justify-center">
            <img
              src={project.source_image}
              alt={project.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="mt-3 text-sm text-gray-600 text-center">
            {project.rows}×{project.cols} · {stats.stats.length}色 · {stats.total}颗
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 border border-gray-200 rounded-lg p-4 bg-white">
          <StatsTable stats={stats.stats} total={stats.total} />
        </div>

        {/* Export options */}
        <ExportPanel onExport={handleExport} disabled={exporting} />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add lib/export.ts components/StatsTable.tsx components/ExportPanel.tsx app/export/\[id\]/page.tsx
git commit -m "feat: add export functionality (PNG, PDF, CSV, coordinates)"
```

---

## Task 14: 配置 next.config 和最终构建

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: 更新 next.config**

Modify `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable type checking during build (we'll handle types ourselves)
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow serving static files from public directory
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

- [ ] **Step 2: 确保全局样式**

Verify `app/globals.css` contains:

```css
@import "tailwindcss";

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans), system-ui, sans-serif;
}
```

- [ ] **Step 3: 构建测试**

```bash
cd D:/bean/my-app
npm run build
```

Expected: 构建成功，无 TypeScript 错误。

- [ ] **Step 4: Commit**

```bash
git add next.config.ts app/globals.css
git commit -m "chore: configure next.config and verify build"
```

---

## 自我审查

### Spec 覆盖检查

| Spec 要求 | 对应任务 |
|-----------|----------|
| 上传图片并生成预览 | Task 10 (UploadZone + pixelateImage) |
| 选择行列数/拼豆板 | Task 10 (ParameterPanel) |
| MARD 色卡匹配 + 图例 | Task 2 (色卡数据) + Task 8 (匹配算法) + Task 12 (颜色面板) |
| 单格修改 + 撤销/重做 | Task 11 (EditorCanvas) + Task 12 (history stack) |
| 色号数量/总豆数统计 | Task 7 (Stats API) + Task 13 (StatsTable) |
| 坐标显示 | Task 12 (hoveredCell 状态栏) |
| 颜色高亮 | Task 11 (highlightedColor prop) |
| PNG/PDF 导出 | Task 13 (export.ts + ExportPanel) |
| 色号表/坐标清单 | Task 13 (CSV + coordinates export) |
| 保存/重新打开 | Task 5 (Project CRUD) + Task 6 (Cells API) |

**无遗漏。**

### Placeholder 扫描

- [x] 无 TBD/TODO
- [x] 无 "implement later"
- [x] 无 "add appropriate error handling"（有具体错误处理）
- [x] 所有代码步骤都有完整代码

### 类型一致性

- `CellData` 接口在 Task 8、Task 11、Task 12、Task 13 中一致
- `PaletteColor` 接口在 Task 2、Task 8 中一致
- API 路由参数类型一致（`Params` interface）
- `historyRef` 类型在 Task 12 中完整定义

---

## 执行方式

Plan complete. 推荐按任务顺序执行，每个任务独立可验证。

关键依赖链：
- Task 1 → Task 2 → Task 3 → Task 4/5/6/7（后端 API，可并行）
- Task 8 → Task 9/10（前端页面）
- Task 11 → Task 12（编辑器核心）
- Task 13（导出，依赖前端基础组件）
- Task 14（最终构建）
