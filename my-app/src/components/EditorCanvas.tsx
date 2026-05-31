'use client';
import { useRef, useEffect, useState, useCallback } from 'react';
import { LongBead } from '@/lib/longBeads';

export interface CellData {
  row: number;
  col: number;
  hex: string | null;
  color_no: string | null;
  completed?: number;
}

interface EditorCanvasProps {
  rows: number;
  cols: number;
  cells: CellData[];
  selectedColor: { hex: string; color_no: string } | null;
  highlightedColor: string | null;
  scale: number;
  longBeads?: LongBead[];
  showLongBeads?: boolean;
  onCellClick: (row: number, col: number) => void;
  onCellHover: (row: number, col: number) => void;
  // Focus mode props
  showCoordinates?: boolean;
  taskColor?: string | null;
  onCellToggleComplete?: (row: number, col: number) => void;
}

const CELL_SIZE = 20;
const GRID_COLOR = '#e0e0e0';
const DIM_FACTOR = 0.25;

function dimHex(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const nr = Math.round(r * DIM_FACTOR + 255 * (1 - DIM_FACTOR));
  const ng = Math.round(g * DIM_FACTOR + 255 * (1 - DIM_FACTOR));
  const nb = Math.round(b * DIM_FACTOR + 255 * (1 - DIM_FACTOR));
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}

export default function EditorCanvas({ rows, cols, cells, selectedColor, highlightedColor, scale, longBeads = [], showLongBeads = false, onCellClick, onCellHover, showCoordinates, taskColor, onCellToggleComplete }: EditorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const cellMap = new Map<string, CellData>();
  for (const cell of cells) {
    cellMap.set(`${cell.row},${cell.col}`, cell);
  }

  const longBeadMap = new Map<string, LongBead>();
  if (showLongBeads) {
    for (const lb of longBeads) {
      longBeadMap.set(`${lb.row},${lb.col}`, lb);
    }
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

        const isHighlighted = highlightedColor && cell?.color_no === highlightedColor;
        const isDimmed = highlightedColor && cell?.color_no !== highlightedColor;
        const isTaskColor = taskColor && cell?.color_no === taskColor;
        const isTaskDimmed = taskColor && cell?.color_no !== taskColor;
        const isCompleted = cell?.completed === 1;

        if (cell?.hex) {
          if (isTaskDimmed) {
            // Very dimmed for non-task colors in focus mode
            ctx.fillStyle = dimHex(cell.hex);
            ctx.globalAlpha = 0.15;
            ctx.fillRect(x, y, scaledCellSize, scaledCellSize);
            ctx.globalAlpha = 1.0;
          } else if (isDimmed) {
            ctx.fillStyle = dimHex(cell.hex);
            ctx.fillRect(x, y, scaledCellSize, scaledCellSize);
          } else if (isCompleted) {
            // Slightly dimmed for completed cells
            ctx.fillStyle = dimHex(cell.hex);
            ctx.fillRect(x, y, scaledCellSize, scaledCellSize);
          } else {
            ctx.fillStyle = cell.hex;
            ctx.fillRect(x, y, scaledCellSize, scaledCellSize);
          }
        }

        // Draw long bead indicator
        const lb = longBeadMap.get(`${row},${col}`);
        if (lb && !isDimmed && !isTaskDimmed) {
          const borderWidth = Math.max(2, scaledCellSize * 0.12);
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = borderWidth;
          // Draw double-line gold border
          const inset = borderWidth / 2;
          ctx.strokeRect(x + inset, y + inset, scaledCellSize - borderWidth, scaledCellSize - borderWidth);
          // Second line for double-line effect
          ctx.strokeStyle = '#B8860B';
          ctx.lineWidth = borderWidth * 0.5;
          const inset2 = inset + borderWidth;
          if (scaledCellSize > inset2 * 2) {
            ctx.strokeRect(x + inset2, y + inset2, scaledCellSize - inset2 * 2, scaledCellSize - inset2 * 2);
          }
        }

        if (isHighlighted) {
          ctx.strokeStyle = '#2196f3';
          ctx.lineWidth = Math.max(2, scaledCellSize * 0.15);
          ctx.strokeRect(x + ctx.lineWidth / 2, y + ctx.lineWidth / 2, scaledCellSize - ctx.lineWidth, scaledCellSize - ctx.lineWidth);
        } else {
          ctx.strokeStyle = isDimmed || isTaskDimmed ? 'rgba(224,224,224,0.5)' : GRID_COLOR;
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, scaledCellSize, scaledCellSize);
        }

        // Show coordinates
        if (showCoordinates && scaledCellSize >= 14) {
          ctx.fillStyle = cell?.hex ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.3)';
          ctx.font = `${Math.max(6, Math.min(10, scaledCellSize * 0.35))}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const coordText = `${String.fromCharCode(65 + col)}${row + 1}`;
          ctx.fillText(coordText, x + scaledCellSize / 2, y + scaledCellSize / 2);
        }

        // Show checkmark for completed cells
        if (isCompleted && !isTaskDimmed) {
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.font = `bold ${Math.max(8, scaledCellSize * 0.5)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('✓', x + scaledCellSize / 2, y + scaledCellSize / 2);
        }
      }
    }

    if (hoveredCell) {
      const x = hoveredCell.col * scaledCellSize;
      const y = hoveredCell.row * scaledCellSize;
      ctx.strokeStyle = '#2196f3';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, scaledCellSize, scaledCellSize);
    }
  }, [rows, cols, cells, highlightedColor, scale, hoveredCell, cellMap, showCoordinates, taskColor, longBeadMap]);

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
    if (cell) {
      if (onCellToggleComplete) {
        onCellToggleComplete(cell.row, cell.col);
      } else {
        onCellClick(cell.row, cell.col);
      }
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onMouseLeave={() => setHoveredCell(null)}
      style={{ cursor: onCellToggleComplete ? 'pointer' : (selectedColor ? 'crosshair' : 'default'), maxWidth: '100%', maxHeight: '100%' }}
    />
  );
}
