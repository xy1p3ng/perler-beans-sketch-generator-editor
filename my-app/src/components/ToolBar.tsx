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
}

const TOOLS = [
  { id: 'brush', icon: '✏️', label: '画笔' },
  { id: 'fill', icon: '🪣', label: '填充' },
  { id: 'eraser', icon: '🧽', label: '橡皮' },
  { id: 'picker', icon: '💧', label: '取色' },
];

export default function ToolBar({ activeTool, onToolChange, onUndo, onRedo, canUndo, canRedo, scale, onZoomIn, onZoomOut }: ToolBarProps) {
  return (
    <div className="w-12 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-2 gap-1">
      {TOOLS.map(tool => (
        <button key={tool.id} onClick={() => onToolChange(tool.id)} title={tool.label}
          className={`w-9 h-9 rounded-md flex items-center justify-center text-lg transition-colors ${activeTool === tool.id ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
        >{tool.icon}</button>
      ))}
      <div className="w-7 h-px bg-gray-300 my-1" />
      <button onClick={onUndo} disabled={!canUndo} title="撤销" className="w-9 h-9 rounded-md flex items-center justify-center text-lg hover:bg-gray-100 disabled:opacity-30">↩️</button>
      <button onClick={onRedo} disabled={!canRedo} title="重做" className="w-9 h-9 rounded-md flex items-center justify-center text-lg hover:bg-gray-100 disabled:opacity-30">↪️</button>
      <div className="w-7 h-px bg-gray-300 my-1" />
      <button onClick={onZoomIn} title="放大" className="w-9 h-9 rounded-md flex items-center justify-center text-lg hover:bg-gray-100">+</button>
      <div className="text-xs text-gray-500 font-mono">{Math.round(scale * 100)}%</div>
      <button onClick={onZoomOut} title="缩小" className="w-9 h-9 rounded-md flex items-center justify-center text-lg hover:bg-gray-100">−</button>
    </div>
  );
}
