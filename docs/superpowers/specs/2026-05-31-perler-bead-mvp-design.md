# 拼豆图纸生成与辅助制作工具 — MVP 设计文档

## 1. 概述

面向拼豆爱好者和定制商家的"图片转拼豆图纸 + 可编辑制作助手"的 MVP 版本。核心闭环：上传图片 → 参数设置 → 像素化与色卡匹配 → 网格编辑器精修 → 色号统计 → PNG/PDF 导出。

### 1.1 产品目标

1. 让用户在 3 分钟内从图片得到第一版可预览的拼豆图纸。
2. 让用户能在图纸生成后按格子修改颜色。
3. 让系统基于 MARD 色卡输出色号、数量和坐标。
4. 让用户能导出可打印、可查看的图纸和色号统计表。
5. 让用户能保存项目并再次打开继续编辑。

### 1.2 技术栈

- **前端**: Next.js 15 + React 19 + TypeScript + Tailwind CSS 4
- **后端**: Next.js API Routes + better-sqlite3
- **图像处理**: 前端 Canvas API（像素读取 + 采样 + 色卡匹配）
- **PDF 导出**: jspdf
- **数据持久化**: SQLite 文件数据库

### 1.3 范围边界

**MVP 包含:**
- 图片上传（JPG/PNG/WEBP，最大 20MB）
- 参数设置（行列数、拼豆板、色卡、颜色上限、抖动开关）
- 像素化与色卡匹配（RGB 最近邻 → MARD 色号）
- 网格编辑器（单格编辑、填充、橡皮擦、取色器、撤销/重做、缩放、平移）
- 颜色面板（当前使用颜色列表、高亮、替换）
- 色号统计与导出（PNG 网格图、PDF 打印文件、色号表、坐标清单）
- 项目保存与重新打开

**MVP 不包含:**
- AI 风格化
- 多品牌色卡（Perler/Hama/Artkal）
- 自定义色卡导入
- 制作模式（坐标指引、完成标记）
- 长条豆/特殊豆识别
- 商家模式（订单、报价、库存）
- 用户认证
- 云端同步

---

## 2. 页面结构与路由

| 路由 | 页面 | 核心内容 |
|------|------|----------|
| `/` | 项目首页 | 最近项目网格卡片 + 新建按钮 |
| `/new` | 上传与参数设置 | 拖拽上传 + 参数面板 |
| `/editor/[projectId]` | 图纸编辑器 | 三栏布局：工具栏 / 画布 / 颜色面板 |
| `/export/[projectId]` | 统计与导出 | 预览 + 统计表 + 导出选项 |

### 2.1 项目首页

- 网格展示最近项目（缩略图、名称、尺寸、色数、状态）
- "+ 新建项目"入口跳转到 `/new`
- 点击项目卡片进入 `/editor/[id]`

### 2.2 上传与参数设置页

- **左侧**: 拖拽上传区域（支持点击选择文件）
- **右侧参数面板**:
  - 图纸尺寸（行列数，默认 50×50）
  - 拼豆板选择（29×29、49×69、自定义）
  - 色卡（MARD 标准色，200+ 色）
  - 颜色上限（16/32/64/无限制）
  - 抖动开关（默认关闭）
- "生成预览"按钮 → 调用后端图像处理 → 跳转到编辑器

### 2.3 图纸编辑器（核心页面）

**三栏布局**:

- **左侧工具栏**（48px 宽）:
  - 画笔（单格修改）
  - 填充（Flood Fill 连续区域）
  - 橡皮擦（设为透明/背景色）
  - 取色器（点击格子吸取颜色）
  - 分隔线
  - 撤销 / 重做
  - 分隔线
  - 放大 / 缩小

- **中间画布**（flex:1）:
  - HTML Canvas 绘制正方形网格
  - 每个格子 1:1 等宽等高
  - 滚轮缩放、拖拽平移
  - 悬停显示坐标（如 D7）和色号
  - 点击格子用当前选中颜色填充

- **右侧面板**（170px 宽）:
  - 当前使用颜色列表（色块 + 色号 + 颜色名 + 数量）
  - 点击颜色切换当前画笔颜色
  - 选中状态高亮
  - 操作按钮:
    - "高亮此色" — 高亮所有该颜色的格子
    - "替换颜色" — 全局替换
    - "保存项目" — 保存当前编辑状态

**底部状态栏**:
- 当前坐标 + 色号 + 颜色名
- 缩放比例
- 总格子数 / 已完成数（如有）

### 2.4 统计与导出页

**三栏布局**:

- **左侧**（220px）:
  - 图纸预览缩略图
  - 项目信息（尺寸、色数、总豆数）

- **中间**:
  - 用豆统计表（色块 / 色号 / 颜色名 / 数量 / 占比）
  - 合计行

- **右侧**（200px）:
  - 导出选项复选框:
    - 高清网格图 PNG
    - 打印 PDF（含图例）
    - 色号统计表（CSV）
    - 坐标清单（按颜色分组）
  - 文件名预设
  - "导出全部"按钮 → ZIP 压缩包

---

## 3. 数据模型

### 3.1 SQLite Schema

```sql
-- 项目表
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  source_image TEXT NOT NULL,        -- 原图路径
  preview_image TEXT,                -- 预览图路径
  rows INTEGER NOT NULL DEFAULT 50,
  cols INTEGER NOT NULL DEFAULT 50,
  board_type TEXT DEFAULT '29x29',   -- 拼豆板类型
  palette_id TEXT DEFAULT 'mard',    -- 色卡标识
  color_limit INTEGER DEFAULT 32,    -- 颜色上限
  dither_enabled INTEGER DEFAULT 0,  -- 是否启用抖动
  status TEXT DEFAULT 'editing',     -- editing | completed
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 格子表（每个项目 rows * cols 行）
CREATE TABLE cells (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  row INTEGER NOT NULL,
  col INTEGER NOT NULL,
  color_no TEXT,                     -- 色号，如 A01
  hex TEXT,                          -- 颜色值，如 #FF0000
  completed INTEGER DEFAULT 0,       -- 制作完成标记（MVP预留）
  FOREIGN KEY (project_id) REFERENCES projects(id),
  UNIQUE(project_id, row, col)
);
CREATE INDEX idx_cells_project ON cells(project_id);
CREATE INDEX idx_cells_project_row_col ON cells(project_id, row, col);

-- 色卡表（MARD 标准色）
CREATE TABLE palettes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  brand TEXT NOT NULL DEFAULT 'MARD',
  color_no TEXT NOT NULL,            -- 色号，如 A01
  name TEXT,                         -- 颜色名，如 Red
  hex TEXT NOT NULL,                 -- HEX 值
  rgb TEXT,                          -- RGB 值，如 255,0,0
  UNIQUE(brand, color_no)
);

-- 编辑历史表（用于撤销/重做）
CREATE TABLE edit_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  action TEXT NOT NULL,              -- 'single' | 'fill' | 'batch'
  data TEXT NOT NULL,                -- JSON: {cells: [{row,col,oldColor,newColor}]}
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
CREATE INDEX idx_history_project ON edit_history(project_id);
```

### 3.2 关键数据决策

- **图片存储**: 用户上传的原图存在 `/public/uploads/`，数据库只存相对路径。MVP 不引入对象存储。
- **cells 规模**: 50×50 = 2500 行/项目，100×100 = 10000 行。SQLite 完全可以胜任。批量更新用事务。
- **编辑历史**: 每次编辑操作记录一条 history，包含所有受影响格子的旧值和新值。前端维护撤销栈指针，支持 50+ 步。
- **自动保存**: 编辑器中每次操作后 debounce 1s 自动调用 `PUT /api/projects/:id/cells` 保存。

---

## 4. API 设计

### 4.1 项目 CRUD

```
GET    /api/projects              → 项目列表（含缩略图和基本信息）
POST   /api/projects              → 创建项目（multipart: 图片 + 参数）
GET    /api/projects/:id          → 项目详情（含 cells 网格数据）
PUT    /api/projects/:id          → 更新项目（名称、参数）
DELETE /api/projects/:id          → 删除项目（级联删除 cells 和 history）
```

### 4.2 格子编辑

```
PUT    /api/projects/:id/cells     → 批量更新格子（编辑时自动保存）
```

请求体:
```json
{
  "cells": [
    {"row": 5, "col": 10, "color_no": "A02", "hex": "#2196F3"}
  ]
}
```

### 4.3 统计与导出

```
GET    /api/projects/:id/stats     → 色号统计（聚合 cells 表）
POST   /api/export                 → 导出（生成 PNG/PDF/CSV）
```

### 4.4 色卡

```
GET    /api/palettes               → 色卡列表（MARD 全部色号）
```

---

## 5. 图像处理流程

### 5.1 流程图

```
上传图片
  ↓
前端预处理（Canvas API）
  - 将图片绘制到 canvas
  - 用 ctx.drawImage() 等比例缩放至目标行列数
  - 用 ctx.getImageData() 读取像素数据
  ↓
像素化
  - 每个目标格子 = 原图对应区域的平均颜色
  ↓
色彩量化（前端实现）
  - 中位切分算法将颜色减少到设定上限
  ↓
色卡匹配
  - 对每个量化后的颜色，计算与 MARD 色卡的 RGB 欧氏距离
  - 取距离最小的色号
  ↓
噪点清理（可选）
  - 遍历每个格子，检查 8 邻域
  - 如果 8 邻域中某颜色占多数，替换孤立点
  ↓
保存 cells 到数据库
  ↓
返回项目 ID → 跳转到编辑器
```

### 5.2 色卡匹配算法

**MVP 版本：RGB 欧氏距离**

```python
def find_closest_color(pixel_rgb, palette):
    min_dist = float('inf')
    closest = None
    for color in palette:
        dist = sqrt((pixel_rgb[0]-color.rgb[0])**2 +
                    (pixel_rgb[1]-color.rgb[1])**2 +
                    (pixel_rgb[2]-color.rgb[2])**2)
        if dist < min_dist:
            min_dist = dist
            closest = color
    return closest
```

**V1.1 升级方向**: Lab 色彩空间 + CIEDE2000 色差算法（更接近人眼感知）。

### 5.3 噪点清理

```
对每个格子 (r, c):
  收集 8 邻域的颜色
  如果当前颜色在邻域中出现次数 <= 1:
    替换为邻域中出现最多的颜色
```

可开关，默认开启。

---

## 6. 导出实现

### 6.1 PNG 网格图

- HTML Canvas 绘制
- 每个格子：填充色 + 1px 细网格线
- 可选：坐标标注（行列号）
- `canvas.toDataURL('image/png')` → 下载

### 6.2 PDF 打印文件

- `jspdf` 库生成
- 内容:
  - 第1页：图纸（带网格和色块）
  - 第2页：色号图例表（色块 + 色号 + 颜色名 + 数量）
  - 页脚：坐标规则说明（A=列, 1=行）

### 6.3 色号统计表（CSV）

```csv
色号,颜色名,HEX,数量,占比
A01,Red,#FF0000,24,18%
A02,Blue,#2196F3,18,14%
```

### 6.4 坐标清单

按颜色分组:
```
A02 蓝色 (18颗):
  A1, B3, C5, D7, E2, ...
A01 红色 (24颗):
  A3, B1, C8, D4, ...
```

---

## 7. 组件架构

```
app/
  page.tsx              → 项目首页
  new/page.tsx          → 上传与参数设置
  editor/[id]/page.tsx  → 编辑器（客户端组件）
  export/[id]/page.tsx  → 统计与导出
  api/
    projects/route.ts
    projects/[id]/route.ts
    projects/[id]/cells/route.ts
    projects/[id]/stats/route.ts
    palettes/route.ts
    export/route.ts

components/
  Layout.tsx            → 通用布局（导航栏）
  ProjectCard.tsx       → 项目卡片
  UploadZone.tsx        → 拖拽上传区域
  ParameterPanel.tsx    → 参数设置面板
  EditorCanvas.tsx      → 网格画布（核心组件）
  ToolBar.tsx           → 左侧工具栏
  ColorPanel.tsx        → 右侧颜色面板
  StatsTable.tsx        → 统计表
  ExportPanel.tsx       → 导出选项面板

lib/
  db.ts                 → SQLite 数据库连接和初始化
  pixelation.ts         → 前端图像处理（Canvas 像素读取 + 采样 + 量化）
  palette.ts            → 色卡数据管理
  export.ts             → 导出工具（PNG/PDF/CSV）

public/
  uploads/              → 用户上传的图片
```

---

## 8. 性能考虑

- **小图纸**（≤80×80）：参数调整 1 秒内完成预览刷新
- **中等图纸**（≤150×150）：编辑器缩放、拖拽保持流畅
- **大图渲染**: Canvas 虚拟渲染，只绘制视口内的格子
- **批量保存**: cells 更新用 SQLite 事务，避免逐行插入
- **撤销栈**: 前端内存维护，后端仅持久化（不实时查询 history）

---

## 9. 验收标准

| 编号 | 验收标准 |
|------|----------|
| AC-01 | 用户可上传图片并生成拼豆图纸预览 |
| AC-02 | 用户可选择图纸行列数、拼豆板尺寸 |
| AC-03 | 系统可把图片颜色匹配为 MARD 色号，并展示颜色图例 |
| AC-04 | 用户可点击单个格子修改颜色，并支持撤销/重做 |
| AC-05 | 系统可统计每个色号的数量、总豆数 |
| AC-06 | 系统可显示坐标，例如 D7 |
| AC-07 | 用户可按颜色高亮显示所有对应格子 |
| AC-08 | 用户可导出 PNG 图纸和 PDF 打印文件 |
| AC-09 | 导出文件包含图纸、色号表、坐标规则和基础制作说明 |
| AC-10 | 用户可保存项目并再次打开继续编辑 |

---

## 10. 风险与缓解

| 风险 | 影响 | 缓解方案 |
|------|------|----------|
| RGB 匹配色差大 | 颜色不准 | 用户可手动替换；V1.1 升级 CIEDE2000 |
| 大图性能差 | 编辑器卡顿 | Canvas 虚拟渲染 + 分块加载 |
| 图片存储空间 | 磁盘占用 | MVP 限制单图 20MB；定期清理未关联图片 |
| 抖动散豆过多 | 制作难度上升 | 默认关闭，开启时显示散点比例提示 |

---

*设计文档版本: 1.0*
*日期: 2026-05-31*
