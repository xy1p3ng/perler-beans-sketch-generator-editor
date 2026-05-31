'use client';
import { useState } from 'react';

interface ExportPanelProps {
  onExport: (options: { png: boolean; pdf: boolean; csv: boolean; coords: boolean }) => void;
  disabled: boolean;
}

export default function ExportPanel({ onExport, disabled }: ExportPanelProps) {
  const [png, setPng] = useState(true);
  const [pdf, setPdf] = useState(true);
  const [csv, setCsv] = useState(true);
  const [coords, setCoords] = useState(false);

  return (
    <div className="w-52 border border-gray-200 rounded-lg p-4 bg-white">
      <h3 className="font-bold mb-3">导出选项</h3>
      <div className="space-y-2 text-sm">
        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={png} onChange={e => setPng(e.target.checked)} /><span>高清网格图 PNG</span></label>
        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={pdf} onChange={e => setPdf(e.target.checked)} /><span>打印 PDF（含图例）</span></label>
        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={csv} onChange={e => setCsv(e.target.checked)} /><span>色号统计表（CSV）</span></label>
        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={coords} onChange={e => setCoords(e.target.checked)} /><span>坐标清单</span></label>
      </div>
      <button onClick={() => onExport({ png, pdf, csv, coords })} disabled={disabled || (!png && !pdf && !csv && !coords)}
        className="w-full mt-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
      >{disabled ? '导出中...' : '导出全部'}</button>
    </div>
  );
}
