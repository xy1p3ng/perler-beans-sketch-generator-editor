'use client';
import { useMemo } from 'react';

interface ColorPanelProps {
  cells: Array<{ color_no: string | null; hex: string | null }>;
  selectedColor: { hex: string; color_no: string } | null;
  highlightedColor: string | null;
  onColorSelect: (color_no: string, hex: string) => void;
  onHighlightColor: (color_no: string | null) => void;
  onReplaceColor: (oldColorNo: string) => void;
  onSave: () => void;
}

export default function ColorPanel({ cells, selectedColor, highlightedColor, onColorSelect, onHighlightColor, onReplaceColor, onSave }: ColorPanelProps) {
  const colorStats = useMemo(() => {
    const stats = new Map<string, { color_no: string; hex: string; count: number }>();
    for (const cell of cells) {
      if (cell.color_no && cell.hex) {
        const existing = stats.get(cell.color_no);
        if (existing) { existing.count++; } else { stats.set(cell.color_no, { color_no: cell.color_no, hex: cell.hex, count: 1 }); }
      }
    }
    return Array.from(stats.values()).sort((a, b) => b.count - a.count);
  }, [cells]);

  return (
    <div className="w-44 bg-gray-50 border-l border-gray-200 p-3 overflow-y-auto">
      <div className="text-xs font-bold mb-2 text-gray-700">当前使用颜色（{colorStats.length}色）</div>
      <div className="space-y-1">
        {colorStats.map(stat => (
          <div key={stat.color_no} onClick={() => { onColorSelect(stat.color_no, stat.hex); onHighlightColor(null); }}
            className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${selectedColor?.color_no === stat.color_no ? 'bg-blue-100 border border-blue-300' : 'bg-white border border-transparent hover:bg-gray-100'} ${highlightedColor === stat.color_no ? 'ring-2 ring-yellow-400' : ''}`}
          >
            <div className="w-5 h-5 rounded border border-gray-200 flex-shrink-0" style={{ backgroundColor: stat.hex }} />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{stat.color_no}</div>
              <div className="text-[10px] text-gray-500">{stat.count}颗</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-gray-200 space-y-2">
        <div className="text-xs text-gray-500">操作</div>
        <button onClick={() => onHighlightColor(highlightedColor ? null : selectedColor?.color_no || null)} disabled={!selectedColor}
          className="w-full py-1.5 px-2 bg-white border border-gray-200 rounded text-xs hover:bg-gray-50 disabled:opacity-50"
        >{highlightedColor ? '取消高亮' : '高亮此色'}</button>
        <button onClick={() => selectedColor && onReplaceColor(selectedColor.color_no)} disabled={!selectedColor}
          className="w-full py-1.5 px-2 bg-white border border-gray-200 rounded text-xs hover:bg-gray-50 disabled:opacity-50"
        >替换颜色</button>
        <button onClick={onSave} className="w-full py-1.5 px-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">保存项目</button>
      </div>
    </div>
  );
}
