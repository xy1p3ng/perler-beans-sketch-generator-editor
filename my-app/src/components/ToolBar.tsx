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
  showLongBeads?: boolean;
  onToggleLongBeads?: () => void;
}

interface ToolDef {
  id: string;
  icon: string;
  label: string;
}

const TOOLS: ToolDef[] = [
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
  showLongBeads = false,
  onToggleLongBeads,
}: ToolBarProps) {
  return (
    <div className="w-12 bg-white border-r border-[var(--border)] flex flex-col items-center py-3 gap-1">
      {TOOLS.map((tool) => (
        <div key={tool.id} className="relative group/tool">
          <button
            onClick={() => onToolChange(tool.id)}
            aria-label={tool.label}
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all duration-150 ${
              activeTool === tool.id
                ? 'bg-[var(--primary)]/10 text-[var(--primary)] shadow-sm ring-1 ring-[var(--primary)]/20'
                : 'hover:bg-[var(--muted)]/50'
            }`}
          >
            {tool.icon}
          </button>
          {/* Tooltip label */}
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-[#2d3436] text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover/tool:opacity-100 transition-opacity duration-100 pointer-events-none z-50">
            {tool.label}
          </div>
        </div>
      ))}

      <div className="w-7 h-px bg-[var(--border)] my-1.5" />

      <div className="relative group/tool">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          aria-label="撤销"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all duration-150 hover:bg-[var(--muted)]/50 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          ↩️
        </button>
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-[#2d3436] text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover/tool:opacity-100 transition-opacity duration-100 pointer-events-none z-50">
          撤销
        </div>
      </div>

      <div className="relative group/tool">
        <button
          onClick={onRedo}
          disabled={!canRedo}
          aria-label="重做"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all duration-150 hover:bg-[var(--muted)]/50 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          ↪️
        </button>
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-[#2d3436] text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover/tool:opacity-100 transition-opacity duration-100 pointer-events-none z-50">
          重做
        </div>
      </div>

      <div className="w-7 h-px bg-[var(--border)] my-1.5" />

      <div className="relative group/tool">
        <button
          onClick={onZoomIn}
          aria-label="放大"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold transition-all duration-150 hover:bg-[var(--muted)]/50"
        >
          +
        </button>
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-[#2d3436] text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover/tool:opacity-100 transition-opacity duration-100 pointer-events-none z-50">
          放大
        </div>
      </div>

      <div className="text-xs text-[var(--muted-foreground)] font-mono font-medium">
        {Math.round(scale * 100)}%
      </div>

      <div className="relative group/tool">
        <button
          onClick={onZoomOut}
          aria-label="缩小"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold transition-all duration-150 hover:bg-[var(--muted)]/50"
        >
          −
        </button>
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-[#2d3436] text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover/tool:opacity-100 transition-opacity duration-100 pointer-events-none z-50">
          缩小
        </div>
      </div>

      {onToggleLongBeads && (
        <>
          <div className="w-7 h-px bg-[var(--border)] my-1.5" />
          <div className="relative group/tool">
            <button
              onClick={onToggleLongBeads}
              aria-label="长条豆"
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all duration-150 ${
                showLongBeads
                  ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300'
                  : 'hover:bg-[var(--muted)]/50'
              }`}
            >
              ➡️
            </button>
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-[#2d3436] text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover/tool:opacity-100 transition-opacity duration-100 pointer-events-none z-50">
              长条豆
            </div>
          </div>
        </>
      )}
    </div>
  );
}
