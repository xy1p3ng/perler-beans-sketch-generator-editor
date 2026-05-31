'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UploadZone from '@/components/UploadZone';
import ParameterPanel from '@/components/ParameterPanel';
import { pixelateImage } from '@/lib/pixelation';
import { MARD_PALETTE } from '@/lib/palette';

export default function NewProject() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (params: { name: string; rows: number; cols: number; boardType: string; colorLimit: number; ditherEnabled: boolean }) => {
    if (!selectedFile) { setError('请先上传图片'); return; }
    setIsGenerating(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('name', params.name);
      formData.append('rows', String(params.rows));
      formData.append('cols', String(params.cols));
      formData.append('board_type', params.boardType);
      formData.append('color_limit', String(params.colorLimit));
      formData.append('dither_enabled', params.ditherEnabled ? '1' : '0');

      const projectRes = await fetch('/api/projects', { method: 'POST', body: formData });
      if (!projectRes.ok) throw new Error('创建项目失败');
      const { id: projectId } = await projectRes.json();

      const imageUrl = URL.createObjectURL(selectedFile);
      const result = await pixelateImage(imageUrl, params.rows, params.cols, params.colorLimit, MARD_PALETTE);
      URL.revokeObjectURL(imageUrl);

      const cellsRes = await fetch(`/api/projects/${projectId}/cells`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cells: result.cells }),
      });
      if (!cellsRes.ok) throw new Error('保存格子数据失败');

      router.push(`/editor/${projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">新建项目</h1>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">{error}</div>}
      <div className="flex gap-6">
        <div className="flex-1"><UploadZone onImageSelect={setSelectedFile} /></div>
        <div className="w-72"><ParameterPanel onSubmit={handleGenerate} disabled={isGenerating} /></div>
      </div>
    </div>
  );
}
