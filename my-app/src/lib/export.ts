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
  doc.setFontSize(16);
  doc.text(projectName, 10, 15);
  doc.setFontSize(10);
  doc.text(`${rows}x${cols} · ${stats.length}色`, 10, 22);
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
  doc.setDrawColor(200);
  for (let i = 0; i <= cols; i++) {
    doc.line(offsetX + i * cellSize, offsetY, offsetX + i * cellSize, offsetY + rows * cellSize);
  }
  for (let i = 0; i <= rows; i++) {
    doc.line(offsetX, offsetY + i * cellSize, offsetX + cols * cellSize, offsetY + i * cellSize);
  }
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
    if (y > 280) { doc.addPage(); y = 15; }
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
    if (!groups.has(cell.color_no)) groups.set(cell.color_no, []);
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
