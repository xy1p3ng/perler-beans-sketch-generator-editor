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

export default function EditorCanvas({ rows, cols, cells, selectedColor, highlightedColor, scale, onCellClick, onCellHover }: EditorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
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
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = cellMap.get(`${row},${col}`);
        const x = col * scaledCellSize;
        const y = row * scaledCellSize;
        if (cell?.hex) {
          ctx.fillStyle = cell.hex;
          ctx.fillRect(x, y, scaledCellSize, scaledCellSize);
        }
        if (highlightedColor && cell?.color_no === highlightedColor) {
          ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
          ctx.fillRect(x, y, scaledCellSize, scaledCellSize);
        }
        ctx.strokeStyle = GRID_COLOR;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, scaledCellSize, scaledCellSize);
      }
    }

    if (hoveredCell) {
      const x = hoveredCell.col * scaledCellSize;
      const y = hoveredCell.row * scaledCellSize;
      ctx.strokeStyle = '#2196f3';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, scaledCellSize, scaledCellSize);
    }
  }, [rows, cols, cells, highlightedColor, scale, hoveredCell, cellMap]);

  useEffect(() => { draw(); }, [draw]);

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
    if (cell) { setHoveredCell(cell); onCellHover(cell.row, cell.col); }
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const cell = getCellFromEvent(e);
    if (cell) { onCellClick(cell.row, cell.col); }
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onMouseLeave={() => setHoveredCell(null)}
      style={{ cursor: selectedColor ? 'crosshair' : 'default', maxWidth: '100%', maxHeight: '100%' }}
    />
  );
}
