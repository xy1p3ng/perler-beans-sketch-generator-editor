'use client';
import { useState } from 'react';

interface ParameterPanelProps {
  onSubmit: (params: { name: string; rows: number; cols: number; boardType: string; colorLimit: number; ditherEnabled: boolean; colorBias: 'warm' | 'cool' | 'neutral' | null }) => void;
  disabled: boolean;
}

export default function ParameterPanel({ onSubmit, disabled }: ParameterPanelProps) {
  const [name, setName] = useState('');
  const [rows, setRows] = useState(50);
  const [cols, setCols] = useState(50);
  const [boardType, setBoardType] = useState('29x29');
  const [customRows, setCustomRows] = useState(50);
  const [customCols, setCustomCols] = useState(50);
  const [colorLimit, setColorLimit] = useState(32);
  const [ditherEnabled, setDitherEnabled] = useState(false);
  const [colorBias, setColorBias] = useState<'warm' | 'cool' | 'neutral' | null>(null);

  const handleSubmit = () => {
    const finalRows = boardType === 'custom' ? customRows : rows;
    const finalCols = boardType === 'custom' ? customCols : cols;
    onSubmit({ name: name || '未命名项目', rows: finalRows, cols: finalCols, boardType, colorLimit, ditherEnabled, colorBias });
  };

  return (
    <div className="border border-[var(--border)] rounded-xl bg-white shadow-sm">
      {/* Panel header */}
      <div className="px-5 py-3.5 border-b border-[var(--border)]">
        <h3 className="font-semibold text-[var(--foreground)] text-sm">参数设置</h3>
      </div>

      <div className="p-5 space-y-4">
        {/* Project name */}
        <div>
          <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5">
            项目名称
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="未命名项目"
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-white placeholder:text-[var(--muted-foreground)]/50 transition-all duration-150 focus:outline-none"
          />
        </div>

        {/* Board size */}
        <div>
          <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5">
            图纸尺寸
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={rows}
              onChange={e => setRows(Math.max(1, Math.min(200, parseInt(e.target.value) || 1)))}
              className="w-20 px-3 py-2 border border-[var(--border)] rounded-lg text-sm text-center bg-white transition-all duration-150 focus:outline-none"
            />
            <span className="text-[var(--muted-foreground)] text-sm">×</span>
            <input
              type="number"
              value={cols}
              onChange={e => setCols(Math.max(1, Math.min(200, parseInt(e.target.value) || 1)))}
              className="w-20 px-3 py-2 border border-[var(--border)] rounded-lg text-sm text-center bg-white transition-all duration-150 focus:outline-none"
            />
            <span className="text-xs text-[var(--muted-foreground)]">行列数</span>
          </div>
        </div>

        {/* Board type */}
        <div>
          <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5">
            拼豆板
          </label>
          <select
            value={boardType}
            onChange={e => setBoardType(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-white transition-all duration-150 focus:outline-none appearance-none cursor-pointer"
          >
            <option value="29x29">29×29 标准板</option>
            <option value="49x69">49×69 大号板</option>
            <option value="custom">自定义</option>
          </select>
        </div>

        {boardType === 'custom' && (
          <div className="pl-3 border-l-2 border-[var(--primary)]/30">
            <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5">
              自定义尺寸
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={customRows}
                onChange={e => setCustomRows(Math.max(1, Math.min(200, parseInt(e.target.value) || 1)))}
                className="w-20 px-3 py-2 border border-[var(--border)] rounded-lg text-sm text-center bg-white transition-all duration-150 focus:outline-none"
              />
              <span className="text-[var(--muted-foreground)] text-sm">×</span>
              <input
                type="number"
                value={customCols}
                onChange={e => setCustomCols(Math.max(1, Math.min(200, parseInt(e.target.value) || 1)))}
                className="w-20 px-3 py-2 border border-[var(--border)] rounded-lg text-sm text-center bg-white transition-all duration-150 focus:outline-none"
              />
            </div>
          </div>
        )}

        <div className="border-t border-[var(--border)]" />

        {/* Color limit */}
        <div>
          <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5">
            颜色上限
          </label>
          <input
            type="number"
            min={1}
            max={200}
            value={colorLimit}
            onChange={e => setColorLimit(Math.max(1, Math.min(200, parseInt(e.target.value) || 1)))}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-white transition-all duration-150 focus:outline-none"
          />
        </div>

        {/* Color bias */}
        <div>
          <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5">
            颜色偏向
          </label>
          <select
            value={colorBias ?? ''}
            onChange={e => {
              const val = e.target.value;
              setColorBias(val === '' ? null : val as 'warm' | 'cool' | 'neutral');
            }}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-white transition-all duration-150 focus:outline-none appearance-none cursor-pointer"
          >
            <option value="">无偏向</option>
            <option value="warm">暖色系</option>
            <option value="cool">冷色系</option>
            <option value="neutral">中性色</option>
          </select>
        </div>

        {/* Dither toggle */}
        <label className="flex items-center gap-2.5 cursor-pointer group p-2 -mx-2 rounded-lg hover:bg-[var(--muted)]/30 transition-colors">
          <div className="relative">
            <input
              type="checkbox"
              id="dither"
              checked={ditherEnabled}
              onChange={e => setDitherEnabled(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-9 h-5 rounded-full transition-colors duration-150 ${ditherEnabled ? 'bg-[var(--primary)]' : 'bg-gray-300'}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-150 mt-0.5 ${ditherEnabled ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
            </div>
          </div>
          <span className="text-sm text-[var(--muted-foreground)] select-none">
            启用抖动（增加散点过渡）
          </span>
        </label>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={disabled}
          className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all duration-150 ${
            disabled
              ? 'bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed'
              : 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] shadow-sm hover:shadow-md active:scale-[0.98]'
          }`}
        >
          {disabled ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              生成中...
            </span>
          ) : (
            '生成预览'
          )}
        </button>
      </div>
    </div>
  );
}
