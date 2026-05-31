'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import EditorCanvas from '@/components/EditorCanvas';
import type { CellData } from '@/components/EditorCanvas';

interface ProjectData {
  id: number;
  name: string;
  rows: number;
  cols: number;
  source_image: string;
}

interface ColorStat {
  color_no: string;
  name: string;
  hex: string;
  count: number;
  percentage: number;
}

interface ColorTask {
  color_no: string;
  name: string;
  hex: string;
  total: number;
  completed: number;
  remaining: number;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 3600 % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function FocusPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectData | null>(null);
  const [cells, setCells] = useState<CellData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scale, setScale] = useState(1.2);
  const [taskColor, setTaskColor] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  // Timer state
  const [elapsed, setElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch project data
  useEffect(() => {
    Promise.all([
      fetch(`/api/projects/${projectId}`).then(r => r.json()),
      fetch(`/api/projects/${projectId}/stats`).then(r => r.json()),
    ]).then(([projectData]) => {
      setProject(projectData.project);
      setCells(projectData.cells || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [projectId]);

  // Timer
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setElapsed(e => e + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  // Compute color tasks
  const colorTasks: ColorTask[] = (() => {
    const map = new Map<string, ColorTask>();
    for (const cell of cells) {
      if (!cell.color_no || !cell.hex) continue;
      const existing = map.get(cell.color_no);
      if (existing) {
        existing.total++;
        if (cell.completed === 1) existing.completed++;
      } else {
        map.set(cell.color_no, {
          color_no: cell.color_no,
          name: cell.color_no,
          hex: cell.hex,
          total: 1,
          completed: cell.completed === 1 ? 1 : 0,
          remaining: 0,
        });
      }
    }
    const tasks = Array.from(map.values()).map(t => ({
      ...t,
      remaining: t.total - t.completed,
    }));
    // Sort: incomplete first, then by color_no
    tasks.sort((a, b) => {
      if (a.remaining === 0 && b.remaining > 0) return 1;
      if (a.remaining > 0 && b.remaining === 0) return -1;
      return a.color_no.localeCompare(b.color_no);
    });
    return tasks;
  })();

  const overallTotal = colorTasks.reduce((sum, t) => sum + t.total, 0);
  const overallCompleted = colorTasks.reduce((sum, t) => sum + t.completed, 0);
  const overallProgress = overallTotal > 0 ? overallCompleted / overallTotal : 0;

  const currentTask = colorTasks.find(t => t.color_no === taskColor) || null;

  // Toggle cell completed status
  const handleToggleComplete = useCallback(async (row: number, col: number) => {
    const cell = cells.find(c => c.row === row && c.col === col);
    if (!cell || !cell.color_no) return;

    const newCompleted = cell.completed === 1 ? 0 : 1;

    // Optimistic update
    setCells(prev => prev.map(c =>
      c.row === row && c.col === col ? { ...c, completed: newCompleted } : c
    ));

    // Save to server
    try {
      await fetch(`/api/projects/${projectId}/cells`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: [{ row, col, completed: newCompleted }] }),
      });
    } catch (err) {
      console.error('Failed to update completed status:', err);
      // Revert on error
      setCells(prev => prev.map(c =>
        c.row === row && c.col === col ? { ...c, completed: cell.completed } : c
      ));
    }
  }, [cells, projectId]);

  // Locate next uncompleted cell of current task color
  const handleLocate = useCallback(() => {
    if (!taskColor) return;
    const uncompleted = cells
      .filter(c => c.color_no === taskColor && c.completed !== 1)
      .sort((a, b) => a.row - b.row || a.col - b.col);
    if (uncompleted.length > 0) {
      const next = uncompleted[0];
      setHoveredCell({ row: next.row, col: next.col });
      // Could scroll to cell here if needed
    }
  }, [taskColor, cells]);

  // Select next uncompleted color as task
  const handleNextColor = useCallback(() => {
    const incomplete = colorTasks.filter(t => t.remaining > 0);
    if (incomplete.length > 0) {
      // If current task is incomplete, keep it; otherwise pick first incomplete
      if (taskColor) {
        const currentIdx = incomplete.findIndex(t => t.color_no === taskColor);
        if (currentIdx >= 0) {
          const nextIdx = (currentIdx + 1) % incomplete.length;
          setTaskColor(incomplete[nextIdx].color_no);
          return;
        }
      }
      setTaskColor(incomplete[0].color_no);
    }
  }, [colorTasks, taskColor]);

  if (loading) return <div className="flex items-center justify-center h-screen">加载中...</div>;
  if (!project) return <div className="flex items-center justify-center h-screen">项目不存在</div>;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-4">
          <Link href={`/editor/${projectId}`} className="text-gray-600 hover:text-gray-900 text-sm">← 返回编辑器</Link>
          <h1 className="font-bold text-sm">{project.name}</h1>
          <span className="text-xs text-gray-500">{project.rows}×{project.cols}</span>
        </div>
        <div className="flex items-center gap-4">
          {currentTask && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border border-gray-200" style={{ backgroundColor: currentTask.hex }} />
              <span className="text-sm font-medium">{currentTask.color_no}</span>
              <span className="text-xs text-gray-500">剩余 {currentTask.remaining}/{currentTask.total}</span>
            </div>
          )}
          <div className="flex items-center gap-2 w-48">
            <span className="text-xs text-gray-500">{Math.round(overallProgress * 100)}%</span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${overallProgress * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{overallCompleted}/{overallTotal}</span>
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar: Color task list */}
        <div className="w-[200px] bg-white border-r border-gray-200 flex flex-col shrink-0">
          <div className="px-3 py-2 border-b border-gray-200 text-xs font-bold text-gray-700">
            颜色任务 ({colorTasks.filter(t => t.remaining > 0).length}/{colorTasks.length})
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {colorTasks.map(task => {
              const isActive = taskColor === task.color_no;
              const isDone = task.remaining === 0;
              const progress = task.total > 0 ? task.completed / task.total : 0;
              return (
                <div
                  key={task.color_no}
                  onClick={() => setTaskColor(isActive ? null : task.color_no)}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                    isActive ? 'bg-blue-50 border border-blue-200' : 'border border-transparent hover:bg-gray-50'
                  } ${isDone ? 'opacity-50' : ''}`}
                >
                  <div className="relative">
                    <div className="w-5 h-5 rounded border border-gray-200 flex-shrink-0" style={{ backgroundColor: task.hex }} />
                    {isDone && (
                      <div className="absolute inset-0 flex items-center justify-center text-[10px]">✓</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium truncate">{task.color_no}</span>
                      <span className="text-[10px] text-gray-500">{task.remaining}</span>
                    </div>
                    <div className="w-full h-1 bg-gray-100 rounded-full mt-0.5 overflow-hidden">
                      <div
                        className="h-full bg-green-400 rounded-full"
                        style={{ width: `${progress * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-4">
          <EditorCanvas
            rows={project.rows}
            cols={project.cols}
            cells={cells}
            selectedColor={null}
            highlightedColor={null}
            scale={scale}
            onCellClick={() => {}}
            onCellHover={(row, col) => setHoveredCell({ row, col })}
            showCoordinates={true}
            taskColor={taskColor}
            onCellToggleComplete={handleToggleComplete}
          />
        </div>
      </div>

      {/* Bottom toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-t border-gray-200 shrink-0">
        <div className="flex items-center gap-2">
          {/* Color select button */}
          <button
            onClick={handleNextColor}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
          >
            <span>🎨</span>
            <span>切换颜色</span>
          </button>

          {/* Locate button */}
          <button
            onClick={handleLocate}
            disabled={!taskColor}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <span>📍</span>
            <span>定位</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={() => setScale(s => Math.min(s + 0.2, 3))}
              className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-sm hover:bg-gray-50"
            >+</button>
            <span className="text-xs text-gray-500 w-10 text-center">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => setScale(s => Math.max(s - 0.2, 0.4))}
              className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-sm hover:bg-gray-50"
            >−</button>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded">{formatTime(elapsed)}</span>
          <button
            onClick={() => setTimerRunning(r => !r)}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              timerRunning ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {timerRunning ? '⏸ 暂停' : '▶ 开始'}
          </button>
          <button
            onClick={() => { setElapsed(0); setTimerRunning(false); }}
            className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200 transition-colors"
          >
            重置
          </button>
        </div>

        {/* Hovered cell info */}
        {hoveredCell && (
          <div className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
            {String.fromCharCode(65 + hoveredCell.col)}{hoveredCell.row + 1}
          </div>
        )}
      </div>

      {/* Saving indicator */}
      {saving && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded text-sm">保存中...</div>
      )}
    </div>
  );
}
