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

export default function ColorPanel({
  cells,
  selectedColor,
  highlightedColor,
  onColorSelect,
  onHighlightColor,
  onReplaceColor,
  onSave,
}: ColorPanelProps) {
  const colorStats = useMemo(() => {
    const stats = new Map<string, { color_no: string; hex: string; count: number }>();
    for (const cell of cells) {
      if (cell.color_no && cell.hex) {
        const existing = stats.get(cell.color_no);
        if (existing) {
          existing.count++;
        } else {
          stats.set(cell.color_no, { color_no: cell.color_no, hex: cell.hex, count: 1 });
        }
      }
    }
    return Array.from(stats.values()).sort((a, b) => b.count - a.count);
  }, [cells]);

  const totalCount = colorStats.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="w-44 bg-white border-l border-[var(--border)] flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-[var(--border)]">
        <div className="text-xs font-semibold text-[var(--foreground)]">
          当前使用颜色
        </div>
        <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
          共 {colorStats.length} 色 · {totalCount} 颗
        </div>
      </div>

      {/* Color list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {colorStats.map((stat) => {
          const isSelected = selectedColor?.color_no === stat.color_no;
          const isHighlighted = highlightedColor === stat.color_no;

          return (
            <div
              key={stat.color_no}
              onClick={() => {
                onColorSelect(stat.color_no, stat.hex);
                onHighlightColor(null);
              }}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all duration-150 ${
                isSelected
                  ? 'bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]/30'
                  : isHighlighted
                    ? 'ring-2 ring-yellow-400 bg-yellow-50'
                    : 'hover:bg-[var(--muted)]/40'
              }`}
            >
              {/* Color swatch */}
              <div
                className="w-6 h-6 rounded-md border border-[var(--border)] flex-shrink-0 shadow-sm"
                style={{
                  backgroundColor: stat.hex,
                  boxShadow: isSelected
                    ? `0 0 0 3px ${stat.hex}33, inset 0 1px 2px rgba(0,0,0,0.1)`
                    : 'inset 0 1px 2px rgba(0,0,0,0.06)',
                }}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate text-[var(--foreground)]">
                  {stat.color_no}
                </div>
                <div className="text-[10px] text-[var(--muted-foreground)]">
                  {stat.count} 颗
                </div>
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] flex-shrink-0" />
              )}
            </div>
          );
        })}

        {colorStats.length === 0 && (
          <div className="text-center text-[10px] text-[var(--muted-foreground)] py-8">
            暂无颜色数据
          </div>
        )}
      </div>

      {/* Actions footer */}
      <div className="p-3 border-t border-[var(--border)] space-y-2 bg-[var(--muted)]/20">
        <div className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
          操作
        </div>
        <button
          onClick={() =>
            onHighlightColor(highlightedColor ? null : selectedColor?.color_no || null)
          }
          disabled={!selectedColor}
          className="w-full py-1.5 px-2 bg-white border border-[var(--border)] rounded-lg text-xs font-medium transition-all duration-150 hover:bg-[var(--muted)]/30 disabled:opacity-40 disabled:cursor-not-allowed text-[var(--foreground)]"
        >
          {highlightedColor ? '取消高亮' : '高亮此色'}
        </button>
        <button
          onClick={() => selectedColor && onReplaceColor(selectedColor.color_no)}
          disabled={!selectedColor}
          className="w-full py-1.5 px-2 bg-white border border-[var(--border)] rounded-lg text-xs font-medium transition-all duration-150 hover:bg-[var(--muted)]/30 disabled:opacity-40 disabled:cursor-not-allowed text-[var(--foreground)]"
        >
          替换颜色
        </button>
        <button
          onClick={onSave}
          className="w-full py-1.5 px-2 bg-[var(--primary)] text-white rounded-lg text-xs font-medium transition-all duration-150 hover:bg-[var(--primary-hover)] shadow-sm"
        >
          保存项目
        </button>
      </div>
    </div>
  );
}
