'use client';
import { useState } from 'react';

interface ParameterPanelProps {
  onSubmit: (params: { name: string; rows: number; cols: number; boardType: string; colorLimit: number; ditherEnabled: boolean }) => void;
  disabled: boolean;
}

export default function ParameterPanel({ onSubmit, disabled }: ParameterPanelProps) {
  const [name, setName] = useState('');
  const [rows, setRows] = useState(50);
  const [cols, setCols] = useState(50);
  const [boardType, setBoardType] = useState('29x29');
  const [colorLimit, setColorLimit] = useState(32);
  const [ditherEnabled, setDitherEnabled] = useState(false);

  const handleSubmit = () => {
    onSubmit({ name: name || '未命名项目', rows, cols, boardType, colorLimit, ditherEnabled });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-5 bg-white">
      <h3 className="font-bold mb-4">参数设置</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">项目名称</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="未命名项目" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">图纸尺寸（行列数）</label>
          <div className="flex items-center gap-2">
            <input type="number" value={rows} onChange={e => setRows(Math.max(1, Math.min(200, parseInt(e.target.value) || 1)))} className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm text-center" />
            <span className="text-gray-400">×</span>
            <input type="number" value={cols} onChange={e => setCols(Math.max(1, Math.min(200, parseInt(e.target.value) || 1)))} className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm text-center" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">拼豆板</label>
          <select value={boardType} onChange={e => setBoardType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
            <option value="29x29">29×29 标准板</option>
            <option value="49x69">49×69 大号板</option>
            <option value="custom">自定义</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">颜色上限</label>
          <select value={colorLimit} onChange={e => setColorLimit(parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
            <option value={16}>16色（新手）</option>
            <option value={32}>32色（进阶）</option>
            <option value={64}>64色（复杂）</option>
            <option value={999}>无限制</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="dither" checked={ditherEnabled} onChange={e => setDitherEnabled(e.target.checked)} className="w-4 h-4" />
          <label htmlFor="dither" className="text-sm text-gray-600">启用抖动（增加散点）</label>
        </div>
        <button onClick={handleSubmit} disabled={disabled} className={`w-full py-2.5 rounded-md font-medium ${disabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
          {disabled ? '生成中...' : '生成预览'}
        </button>
      </div>
    </div>
  );
}
