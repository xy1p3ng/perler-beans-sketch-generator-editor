export interface LongBead {
  row: number;
  col: number;
  length: number;
  direction: 'horizontal' | 'vertical';
  color_no: string;
  hex: string;
}

export function detectLongBeads(
  cells: Array<{ row: number; col: number; color_no: string | null; hex: string | null }>,
  rows: number,
  cols: number
): LongBead[] {
  const grid: Array<Array<{ color_no: string; hex: string } | null>> =
    Array.from({ length: rows }, () => Array(cols).fill(null));
  for (const cell of cells) {
    if (cell.row < rows && cell.col < cols && cell.color_no && cell.hex) {
      grid[cell.row][cell.col] = { color_no: cell.color_no, hex: cell.hex };
    }
  }

  const longBeads: LongBead[] = [];
  const visited = new Set<string>();

  // Horizontal scan
  for (let r = 0; r < rows; r++) {
    let c = 0;
    while (c < cols) {
      const start = grid[r][c];
      if (!start) { c++; continue; }
      let len = 1;
      while (c + len < cols && grid[r][c + len]?.color_no === start.color_no) {
        len++;
      }
      if (len >= 3) {
        for (let i = 0; i < len; i++) {
          const key = `h-${r}-${c + i}`;
          if (!visited.has(key)) {
            visited.add(key);
            longBeads.push({ row: r, col: c + i, length: len, direction: 'horizontal', color_no: start.color_no, hex: start.hex });
          }
        }
      }
      c += len;
    }
  }

  // Vertical scan
  for (let c = 0; c < cols; c++) {
    let r = 0;
    while (r < rows) {
      const start = grid[r][c];
      if (!start) { r++; continue; }
      let len = 1;
      while (r + len < rows && grid[r + len][c]?.color_no === start.color_no) {
        len++;
      }
      if (len >= 3) {
        for (let i = 0; i < len; i++) {
          const key = `v-${r + i}-${c}`;
          if (!visited.has(key)) {
            visited.add(key);
            longBeads.push({ row: r + i, col: c, length: len, direction: 'vertical', color_no: start.color_no, hex: start.hex });
          }
        }
      }
      r += len;
    }
  }

  return longBeads;
}
