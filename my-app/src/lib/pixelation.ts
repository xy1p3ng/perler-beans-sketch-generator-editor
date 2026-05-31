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
  _colorLimit: number,
  palette: PaletteColor[],
  colorBias: 'warm' | 'cool' | 'neutral' | null = null
): Promise<PixelatedResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetCols;
      canvas.height = targetRows;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, targetCols, targetRows);
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
          const closest = findClosestPaletteColor(hex, palette, colorBias);
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
