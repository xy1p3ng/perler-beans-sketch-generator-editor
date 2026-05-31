export interface ComplexityScore {
  colorCount: number;      // number of unique colors used
  scatterRatio: number;    // isolated cells / total cells (0-100)
  edgeComplexity: number;  // color boundary changes / total boundaries (0-100)
  boardCount: number;      // estimated pegboard count (based on board_type)
  totalScore: string;      // 'easy' | 'medium' | 'hard'
}

export function calculateComplexity(
  cells: Array<{ row: number; col: number; color_no: string | null }>,
  rows: number,
  cols: number,
  boardType: string
): ComplexityScore {
  // 1. Color count
  const uniqueColors = new Set(cells.map(c => c.color_no).filter(Boolean));
  const colorCount = uniqueColors.size;

  // 2. Scatter ratio: count cells where all 4 neighbors (up/down/left/right) have different colors
  const grid: (string | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));
  for (const cell of cells) {
    if (cell.row < rows && cell.col < cols) grid[cell.row][cell.col] = cell.color_no;
  }
  let isolatedCount = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const color = grid[r][c];
      if (!color) continue;
      const neighbors = [
        r > 0 ? grid[r-1][c] : null,
        r < rows-1 ? grid[r+1][c] : null,
        c > 0 ? grid[r][c-1] : null,
        c < cols-1 ? grid[r][c+1] : null,
      ].filter(Boolean);
      if (neighbors.length > 0 && neighbors.every(n => n !== color)) {
        isolatedCount++;
      }
    }
  }
  const totalCells = cells.filter(c => c.color_no).length;
  const scatterRatio = totalCells > 0 ? isolatedCount / totalCells : 0;

  // 3. Edge complexity: count color changes between adjacent cells
  let boundaryChanges = 0;
  let totalBoundaries = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (c < cols - 1) {
        totalBoundaries++;
        if (grid[r][c] !== grid[r][c+1]) boundaryChanges++;
      }
      if (r < rows - 1) {
        totalBoundaries++;
        if (grid[r][c] !== grid[r+1][c]) boundaryChanges++;
      }
    }
  }
  const edgeComplexity = totalBoundaries > 0 ? boundaryChanges / totalBoundaries : 0;

  // 4. Board count
  let boardCount = 1;
  if (boardType === '29x29') {
    boardCount = Math.ceil(rows / 29) * Math.ceil(cols / 29);
  } else if (boardType === '49x69') {
    boardCount = Math.ceil(rows / 49) * Math.ceil(cols / 69);
  }

  // 5. Total score
  let totalScore: 'easy' | 'medium' | 'hard' = 'easy';
  const score = colorCount * 0.3 + scatterRatio * 100 * 0.4 + edgeComplexity * 100 * 0.3;
  if (score > 40) totalScore = 'hard';
  else if (score > 20) totalScore = 'medium';

  return {
    colorCount,
    scatterRatio: Math.round(scatterRatio * 100),
    edgeComplexity: Math.round(edgeComplexity * 100),
    boardCount,
    totalScore
  };
}
