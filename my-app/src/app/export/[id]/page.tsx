'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import StatsTable from '@/components/StatsTable';
import ExportPanel from '@/components/ExportPanel';
import { exportToPNG, exportToPDF, exportStatsCSV, exportCoordinates } from '@/lib/export';

interface ProjectData { id: number; name: string; rows: number; cols: number; source_image: string; }
interface CellData { row: number; col: number; hex: string | null; color_no: string | null; }
interface ColorStat { color_no: string; name: string; hex: string; count: number; percentage: number; }

export default function ExportPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<ProjectData | null>(null);
  const [cells, setCells] = useState<CellData[]>([]);
  const [stats, setStats] = useState<{ total: number; stats: ColorStat[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/projects/${projectId}`).then(r => r.json()),
      fetch(`/api/projects/${projectId}/stats`).then(r => r.json()),
    ]).then(([projectData, statsData]) => {
      setProject(projectData.project);
      setCells(projectData.cells || []);
      setStats(statsData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [projectId]);

  const handleExport = async (options: { png: boolean; pdf: boolean; csv: boolean; coords: boolean }) => {
    if (!project || !stats) return;
    setExporting(true);
    try {
      if (options.png) {
        const dataUrl = exportToPNG(cells, project.rows, project.cols);
        const link = document.createElement('a');
        link.download = `${project.name}_grid.png`;
        link.href = dataUrl;
        link.click();
      }
      if (options.pdf) {
        const doc = exportToPDF(project.name, cells, project.rows, project.cols, stats.stats);
        doc.save(`${project.name}_print.pdf`);
      }
      if (options.csv) {
        const csv = exportStatsCSV(stats.stats);
        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.download = `${project.name}_stats.csv`;
        link.href = URL.createObjectURL(blob);
        link.click();
      }
      if (options.coords) {
        const text = exportCoordinates(cells, stats.stats);
        const blob = new Blob([text], { type: 'text/plain' });
        const link = document.createElement('a');
        link.download = `${project.name}_coords.txt`;
        link.href = URL.createObjectURL(blob);
        link.click();
      }
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">加载中...</div>;
  if (!project || !stats) return <div className="flex items-center justify-center h-screen">项目不存在</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href={`/editor/${projectId}`} className="text-gray-600 hover:text-gray-900">返回编辑器</Link>
          <h1 className="text-2xl font-bold">导出：{project.name}</h1>
        </div>
      </div>
      <div className="flex gap-6">
        <div className="w-56 border border-gray-200 rounded-lg p-4 bg-white">
          <h3 className="font-bold mb-3 text-sm">图纸预览</h3>
          <div className="w-44 h-44 mx-auto bg-gray-50 border border-gray-200 flex items-center justify-center">
            <img src={project.source_image} alt={project.name} className="max-w-full max-h-full object-contain" />
          </div>
          <div className="mt-3 text-sm text-gray-600 text-center">{project.rows}x{project.cols} · {stats.stats.length}色 · {stats.total}颗</div>
        </div>
        <div className="flex-1 border border-gray-200 rounded-lg p-4 bg-white">
          <StatsTable stats={stats.stats} total={stats.total} />
        </div>
        <ExportPanel onExport={handleExport} disabled={exporting} />
      </div>
    </div>
  );
}
