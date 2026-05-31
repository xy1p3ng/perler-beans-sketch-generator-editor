'use client';

interface StatsTableProps {
  stats: Array<{ color_no: string; name: string; hex: string; count: number; percentage: number }>;
  total: number;
  longBeadCount?: number;
}

export default function StatsTable({ stats, total, longBeadCount = 0 }: StatsTableProps) {
  const regularBeads = total - longBeadCount;

  return (
    <div>
      <h3 className="font-bold mb-3">
        用豆统计（共 {total} 颗
        {longBeadCount > 0 && (
          <span className="text-amber-600 font-normal">
            {' '}· {regularBeads} 常规 / {longBeadCount} 长条
          </span>
        )}
        ）
      </h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-3 py-2">色块</th>
            <th className="px-3 py-2">色号</th>
            <th className="px-3 py-2">颜色名</th>
            <th className="px-3 py-2 text-right">数量</th>
            <th className="px-3 py-2 text-right">占比</th>
          </tr>
        </thead>
        <tbody>
          {stats.map(stat => (
            <tr key={stat.color_no} className="border-b border-gray-100">
              <td className="px-3 py-2"><div className="w-5 h-5 rounded border border-gray-200" style={{ backgroundColor: stat.hex }} /></td>
              <td className="px-3 py-2 font-mono">{stat.color_no}</td>
              <td className="px-3 py-2">{stat.name}</td>
              <td className="px-3 py-2 text-right font-bold">{stat.count}</td>
              <td className="px-3 py-2 text-right">{stat.percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
