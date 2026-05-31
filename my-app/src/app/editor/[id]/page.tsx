'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import EditorCanvas from '@/components/EditorCanvas';
import ToolBar from '@/components/ToolBar';
import ColorPanel from '@/components/ColorPanel';
import { floodFill } from '@/lib/pixelation';
import Link from 'next/link';

interface CellData { row: number; col: number; hex: string | null; color_no: string | null; }
interface ProjectData { id: number; name: string; rows: number; cols: number; source_image: string; }
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
      .then(data => { setProject(data.project); setCells(data.cells || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [projectId]);

  const pushHistory = useCallback((changedCells: HistoryEntry['cells']) => {
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
          historyEntry.push({ row: update.row, col: update.col, oldHex: oldCell.hex, oldColorNo: oldCell.color_no, newHex: update.hex, newColorNo: update.color_no });
          newCells[idx] = { ...oldCell, hex: update.hex, color_no: update.color_no };
        } else {
          historyEntry.push({ row: update.row, col: update.col, oldHex: null, oldColorNo: null, newHex: update.hex, newColorNo: update.color_no });
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
      const fillCells = cells.filter((c): c is { row: number; col: number; hex: string; color_no: string } => c.hex !== null && c.color_no !== null);
      const filled = floodFill(fillCells, project?.rows || 50, project?.cols || 50, row, col, selectedColor.hex);
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
      const updates = cells.filter(c => c.hex && c.color_no).map(c => ({ row: c.row, col: c.col, color_no: c.color_no!, hex: c.hex! }));
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
    const updates = cells.filter(c => c.color_no === oldColorNo).map(c => ({ row: c.row, col: c.col, hex: selectedColor.hex, color_no: selectedColor.color_no }));
    updateCells(updates);
  }, [selectedColor, cells, updateCells]);

  if (loading) return <div className="flex items-center justify-center h-screen">加载中...</div>;
  if (!project) return <div className="flex items-center justify-center h-screen">项目不存在</div>;

  return (
    <div className="h-screen flex flex-col">
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
            <button className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700">导出</button>
          </Link>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <ToolBar activeTool={activeTool} onToolChange={setActiveTool} onUndo={handleUndo} onRedo={handleRedo}
          canUndo={historyIndexRef.current >= 0} canRedo={historyIndexRef.current < historyRef.current.length - 1}
          scale={scale} onZoomIn={() => setScale(s => Math.min(s + 0.2, 3))} onZoomOut={() => setScale(s => Math.max(s - 0.2, 0.4))}
        />
        <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-4">
          <EditorCanvas rows={project.rows} cols={project.cols} cells={cells} selectedColor={selectedColor}
            highlightedColor={highlightedColor} scale={scale}
            onCellClick={handleCellClick} onCellHover={(row, col) => setHoveredCell({ row, col })}
          />
        </div>
        <ColorPanel cells={cells} selectedColor={selectedColor} highlightedColor={highlightedColor}
          onColorSelect={(color_no, hex) => setSelectedColor({ color_no, hex })}
          onHighlightColor={setHighlightedColor} onReplaceColor={handleReplaceColor} onSave={handleSave}
        />
      </div>
      {saving && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded text-sm">保存中...</div>
      )}
    </div>
  );
}
