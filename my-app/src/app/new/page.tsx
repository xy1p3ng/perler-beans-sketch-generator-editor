'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UploadZone from '@/components/UploadZone';
import ParameterPanel from '@/components/ParameterPanel';
import { pixelateImage } from '@/lib/pixelation';
import { MARD_PALETTE } from '@/lib/palette';
import { calculateComplexity, ComplexityScore } from '@/lib/complexity';

export default function NewProject() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [complexity, setComplexity] = useState<ComplexityScore | null>(null);
  const [pendingProjectId, setPendingProjectId] = useState<string | null>(null);

  const handleGenerate = async (params: { name: string; rows: number; cols: number; boardType: string; colorLimit: number; ditherEnabled: boolean; colorBias: 'warm' | 'cool' | 'neutral' | null }) => {
    if (!selectedFile) { setError('请先上传图片'); return; }
    setIsGenerating(true);
    setError(null);
    setComplexity(null);
    setPendingProjectId(null);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('name', params.name);
      formData.append('rows', String(params.rows));
      formData.append('cols', String(params.cols));
      formData.append('board_type', params.boardType);
      formData.append('color_limit', String(params.colorLimit));
      formData.append('dither_enabled', params.ditherEnabled ? '1' : '0');
      if (params.colorBias) {
        formData.append('color_bias', params.colorBias);
      }

      const projectRes = await fetch('/api/projects', { method: 'POST', body: formData });
      if (!projectRes.ok) throw new Error('创建项目失败');
      const { id: projectId } = await projectRes.json();

      const imageUrl = URL.createObjectURL(selectedFile);
      const result = await pixelateImage(imageUrl, params.rows, params.cols, params.colorLimit, MARD_PALETTE, params.colorBias);
      URL.revokeObjectURL(imageUrl);

      const cellsRes = await fetch(`/api/projects/${projectId}/cells`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cells: result.cells }),
      });
      if (!cellsRes.ok) throw new Error('保存格子数据失败');

      // Calculate complexity score
      const score = calculateComplexity(result.cells, params.rows, params.cols, params.boardType);
      setComplexity(score);
      setPendingProjectId(projectId);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
      setIsGenerating(false);
    }
  };

  const handleProceed = () => {
    if (pendingProjectId) {
      router.push(`/editor/${pendingProjectId}`);
    }
  };

  const difficultyLabel = (score: string) => {
    switch (score) {
      case 'easy': return { text: '简单', class: 'bg-green-100 text-green-700' };
      case 'medium': return { text: '中等', class: 'bg-yellow-100 text-yellow-700' };
      case 'hard': return { text: '困难', class: 'bg-red-100 text-red-700' };
      default: return { text: '简单', class: 'bg-green-100 text-green-700' };
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">新建项目</h1>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">{error}</div>}
      <div className="flex gap-6">
        <div className="flex-1"><UploadZone onImageSelect={setSelectedFile} /></div>
        <div className="w-72">
          <ParameterPanel onSubmit={handleGenerate} disabled={isGenerating} />
        </div>
      </div>

      {complexity && pendingProjectId && (
        <div className="mt-6 border border-gray-200 rounded-lg p-5 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">图纸复杂度分析</h2>
            <button
              onClick={handleProceed}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 font-medium"
            >
              进入编辑器 →
            </button>
          </div>
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">{complexity.colorCount}</div>
              <div className="text-xs text-gray-500 mt-1">颜色数</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">{complexity.scatterRatio}%</div>
              <div className="text-xs text-gray-500 mt-1">散点比例</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">{complexity.edgeComplexity}%</div>
              <div className="text-xs text-gray-500 mt-1">边缘复杂度</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">{complexity.boardCount}</div>
              <div className="text-xs text-gray-500 mt-1">所需板数</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg flex flex-col items-center justify-center">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${difficultyLabel(complexity.totalScore).class}`}>
                {difficultyLabel(complexity.totalScore).text}
              </span>
              <div className="text-xs text-gray-500 mt-1">总体难度</div>
            </div>
          </div>
        </div>
      )}

      {isGenerating && !complexity && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-600 text-sm text-center">
          正在生成图纸，请稍候...
        </div>
      )}
    </div>
  );
}
